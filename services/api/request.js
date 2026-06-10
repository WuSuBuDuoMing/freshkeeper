/**
 * @file 统一请求封装
 * @description 对 wx.request 进行二次封装，提供：
 *   - 统一的 GET / POST / PUT / DELETE 方法
 *   - 请求 / 响应拦截器链
 *   - 网络错误自动重试（默认 3 次）
 *   - GET 请求缓存（可自定义过期时间）
 *   - 请求取消（页面卸载时清理进行中的请求）
 *   - Loading 管理（自动显示/隐藏 wx.showLoading）
 *   - 错误码中文映射
 * @module services/api/request
 */

const config = require('./config')
const {
  requestInterceptor,
  responseInterceptor,
  networkErrorInterceptor,
  ERROR_MESSAGES
} = require('./interceptors')

// ======================== 请求管理 ========================

/**
 * 当前正在进行中的请求任务映射表
 * key: 请求唯一标识，value: wx.request 返回的 task 对象
 * @type {Object<string, wx.RequestTask>}
 * @private
 */
const pendingRequests = {}

/**
 * 请求计数器，用于生成唯一标识
 * @type {number}
 * @private
 */
let requestCounter = 0

/**
 * 全局 Loading 引用计数
 * 当计数 > 0 时显示 loading，= 0 时隐藏
 * @type {number}
 * @private
 */
let loadingCount = 0

// ======================== 缓存管理 ========================

/**
 * 内存缓存存储
 * @type {Object<string, {data: *, timestamp: number, ttl: number}>}
 * @private
 */
const cacheStore = {}

/**
 * 缓存默认过期时间（毫秒）
 * @type {number}
 * @constant
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 分钟

// ======================== Loading 管理 ========================

/**
 * 显示 Loading（引用计数，防止多次调用冲突）
 * @param {string} [title='加载中...'] - Loading 提示文字
 */
function showLoading(title = '加载中...') {
  if (loadingCount === 0) {
    wx.showLoading({ title, mask: true })
  }
  loadingCount++
}

/**
 * 隐藏 Loading（引用计数归零时才真正隐藏）
 */
function hideLoading() {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    wx.hideLoading()
  }
}

// ======================== 缓存工具 ========================

/**
 * 从缓存中读取数据
 * @param {string} key - 缓存键
 * @returns {*|null} 缓存的数据，未命中或已过期返回 null
 * @private
 */
function getFromCache(key) {
  const entry = cacheStore[key]
  if (!entry) return null
  if (Date.now() - entry.timestamp > entry.ttl) {
    delete cacheStore[key]
    return null
  }
  return entry.data
}

/**
 * 写入缓存
 * @param {string} key - 缓存键
 * @param {*} data - 要缓存的数据
 * @param {number} [ttl=DEFAULT_CACHE_TTL] - 过期时间（毫秒）
 * @private
 */
function setToCache(key, data, ttl = DEFAULT_CACHE_TTL) {
  cacheStore[key] = { data, timestamp: Date.now(), ttl }
}

/**
 * 清除全部缓存
 */
function clearCache() {
  Object.keys(cacheStore).forEach(key => delete cacheStore[key])
}

/**
 * 清除指定前缀的缓存
 * @param {string} prefix - 缓存键前缀
 */
function clearCacheByPrefix(prefix) {
  Object.keys(cacheStore)
    .filter(key => key.startsWith(prefix))
    .forEach(key => delete cacheStore[key])
}

// ======================== 请求取消 ========================

/**
 * 取消所有进行中的请求
 * 通常在页面 onUnload 或组件 detached 时调用
 */
function cancelAllRequests() {
  const keys = Object.keys(pendingRequests)
  keys.forEach(id => {
    if (pendingRequests[id]) {
      pendingRequests[id].abort()
      delete pendingRequests[id]
    }
  })
}

/**
 * 取消指定前缀的请求
 * @param {string} prefix - URL 前缀
 */
function cancelRequestsByPrefix(prefix) {
  Object.keys(pendingRequests).forEach(id => {
    const task = pendingRequests[id]
    if (task && task._url && task._url.startsWith(prefix)) {
      task.abort()
      delete pendingRequests[id]
    }
  })
}

// ======================== 核心请求方法 ========================

/**
 * 生成请求唯一标识
 * @returns {string}
 * @private
 */
function generateRequestId() {
  requestCounter++
  return `req_${Date.now()}_${requestCounter}`
}

/**
 * 核心请求方法
 * 所有 HTTP 方法最终都调用此函数
 *
 * @param {Object} options - 请求配置
 * @param {string} options.url - 请求地址（支持相对路径，会自动拼接 baseUrl）
 * @param {string} [options.method='GET'] - HTTP 方法
 * @param {Object} [options.data] - 请求参数（GET 时为 query，POST 时为 body）
 * @param {Object} [options.header] - 自定义请求头
 * @param {boolean} [options.showLoading=false] - 是否显示 Loading
 * @param {string} [options.loadingText='加载中...'] - Loading 文字
 * @param {boolean} [options.withToken=true] - 是否携带 Token
 * @param {boolean} [options.useCache=false] - GET 请求是否使用缓存
 * @param {number} [options.cacheTtl] - 缓存过期时间（毫秒）
 * @param {boolean} [options.enableRetry=true] - 是否启用自动重试
 * @param {number} [options.retryCount=3] - 最大重试次数
 * @param {number} [options.retryDelay=1000] - 重试间隔（毫秒）
 * @param {boolean} [options.enableCancel=true] - 是否支持请求取消
 * @returns {Promise<Object>} 响应数据
 */
function request(options = {}) {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading: needLoading = false,
    loadingText = '加载中...',
    withToken = true,
    useCache = false,
    cacheTtl,
    enableRetry = true,
    retryCount = 3,
    retryDelay = 1000,
    enableCancel = true
  } = options

  // 拼接完整 URL
  const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}/${url}`

  // 生成请求 ID
  const requestId = generateRequestId()

  // ---- GET 缓存检查 ----
  if (method.toUpperCase() === 'GET' && useCache) {
    const cacheKey = `${fullUrl}_${JSON.stringify(data || {})}`
    const cached = getFromCache(cacheKey)
    if (cached !== null) {
      return Promise.resolve(cached)
    }
  }

  // 构建拦截器处理后的配置
  let interceptedConfig = requestInterceptor({
    url: fullUrl,
    method: method.toUpperCase(),
    data,
    header,
    withToken
  })

  // ---- 显示 Loading ----
  if (needLoading) {
    showLoading(loadingText)
  }

  /**
   * 执行实际的网络请求
   * @param {number} retryRemaining - 剩余重试次数
   * @returns {Promise<Object>}
   * @private
   */
  function doRequest(retryRemaining) {
    return new Promise((resolve, reject) => {
      const task = wx.request({
        ...interceptedConfig,
        success(response) {
          try {
            const result = responseInterceptor(response)

            // GET 请求写入缓存
            if (method.toUpperCase() === 'GET' && useCache) {
              const cacheKey = `${fullUrl}_${JSON.stringify(data || {})}`
              setToCache(cacheKey, result, cacheTtl)
            }

            resolve(result)
          } catch (err) {
            reject(err)
          }
        },
        fail(error) {
          // 网络错误拦截
          const networkError = networkErrorInterceptor(error)

          // 自动重试
          if (enableRetry && retryRemaining > 0) {
            setTimeout(() => {
              doRequest(retryRemaining - 1)
                .then(resolve)
                .catch(reject)
            }, retryDelay)
            return
          }

          reject(networkError)
        },
        complete() {
          // 清理请求记录
          if (enableCancel) {
            delete pendingRequests[requestId]
          }
          // 隐藏 Loading
          if (needLoading) {
            hideLoading()
          }
        }
      })

      // 注册可取消的 task
      if (enableCancel) {
        task._url = fullUrl
        pendingRequests[requestId] = task
      }
    })
  }

  return doRequest(retryCount)
}

// ======================== 便捷 HTTP 方法 ========================

/**
 * GET 请求
 *
 * @param {string} url - 请求地址
 * @param {Object} [data] - 查询参数
 * @param {Object} [options] - 额外配置（覆盖默认值）
 * @returns {Promise<Object>}
 */
function get(url, data, options = {}) {
  return request({ url, method: 'GET', data, ...options })
}

/**
 * POST 请求
 *
 * @param {string} url - 请求地址
 * @param {Object} [data] - 请求体
 * @param {Object} [options] - 额外配置
 * @returns {Promise<Object>}
 */
function post(url, data, options = {}) {
  return request({ url, method: 'POST', data, ...options })
}

/**
 * PUT 请求
 *
 * @param {string} url - 请求地址
 * @param {Object} [data] - 请求体
 * @param {Object} [options] - 额外配置
 * @returns {Promise<Object>}
 */
function put(url, data, options = {}) {
  return request({ url, method: 'PUT', data, ...options })
}

/**
 * DELETE 请求
 *
 * @param {string} url - 请求地址
 * @param {Object} [data] - 请求参数
 * @param {Object} [options] - 额外配置
 * @returns {Promise<Object>}
 */
function del(url, data, options = {}) {
  return request({ url, method: 'DELETE', data, ...options })
}

/**
 * 上传文件
 *
 * @param {string} url - 上传地址
 * @param {string} filePath - 本地文件路径
 * @param {string} [name='file'] - 文件字段名
 * @param {Object} [formData] - 附加表单数据
 * @param {Object} [options] - 额外配置
 * @returns {Promise<Object>}
 */
function upload(url, filePath, name = 'file', formData = {}, options = {}) {
  const {
    showLoading: needLoading = false,
    loadingText = '上传中...',
    enableCancel = true
  } = options

  // 拼接完整 URL
  const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}/${url}`

  // 请求拦截
  const token = wx.getStorageSync('token')
  const systemInfo = wx.getSystemInfoSync()

  const header = {}
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }
  header['X-Platform'] = 'wechat'
  header['X-System'] = systemInfo.platform
  header['X-Api-Version'] = config.version

  const requestId = generateRequestId()

  if (needLoading) {
    showLoading(loadingText)
  }

  return new Promise((resolve, reject) => {
    const task = wx.uploadFile({
      url: fullUrl,
      filePath,
      name,
      formData,
      header,
      success(response) {
        try {
          // uploadFile 返回的 data 是字符串，需要手动解析
          const parsed = typeof response.data === 'string'
            ? JSON.parse(response.data)
            : response.data
          const result = responseInterceptor({
            statusCode: response.statusCode,
            data: parsed,
            header: response.header
          })
          resolve(result)
        } catch (err) {
          reject(err)
        }
      },
      fail(error) {
        const networkError = networkErrorInterceptor(error)
        reject(networkError)
      },
      complete() {
        if (enableCancel) {
          delete pendingRequests[requestId]
        }
        if (needLoading) {
          hideLoading()
        }
      }
    })

    if (enableCancel) {
      task._url = fullUrl
      pendingRequests[requestId] = task
    }
  })
}

module.exports = {
  // 核心方法
  request,
  get,
  post,
  put,
  del,
  upload,

  // 请求管理
  cancelAllRequests,
  cancelRequestsByPrefix,

  // 缓存管理
  clearCache,
  clearCacheByPrefix,

  // Loading 管理
  showLoading,
  hideLoading,

  // 配置（方便外部访问错误码映射）
  ERROR_MESSAGES
}
