/**
 * @file 拦截器配置
 * @description 请求拦截器和响应拦截器的统一配置
 *   - 请求拦截：自动添加 token、设备信息、时间戳
 *   - 响应拦截：统一错误码处理（401/403/500 等）
 *   - 网络异常处理：断网提示、超时提示
 * @module services/api/interceptors
 */

/**
 * HTTP 状态码常量
 * @enum {number}
 */
const HTTP_STATUS = {
  /** 成功 */
  OK: 200,
  /** 未登录 */
  UNAUTHORIZED: 401,
  /** 无权限 */
  FORBIDDEN: 403,
  /** 服务器错误 */
  SERVER_ERROR: 500,
  /** 网关超时 */
  GATEWAY_TIMEOUT: 504
}

/**
 * 业务错误码 → 中文提示映射表
 * @type {Object<number, string>}
 */
const ERROR_MESSAGES = {
  400: '请求参数错误，请检查输入',
  401: '登录已过期，请重新登录',
  403: '没有权限执行此操作',
  404: '请求的资源不存在',
  408: '请求超时，请稍后重试',
  422: '数据验证失败，请检查输入内容',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务暂不可用，请稍后重试',
  504: '网关超时，请稍后重试',
  10001: '微信登录失败，请重试',
  10002: '用户信息获取失败',
  10003: '食材数据不存在',
  10004: '图片上传失败，请重试',
  10005: 'AI 服务暂时不可用',
  10006: '食材识别失败，请重新拍照'
}

/**
 * 请求拦截器
 * 在每次请求发出前自动注入公共参数
 *
 * @param {Object} config - 请求配置对象
 * @param {string} config.url - 请求地址
 * @param {string} config.method - 请求方法
 * @param {Object} [config.data] - 请求体数据
 * @param {Object} [config.header] - 自定义请求头
 * @param {boolean} [config.withToken=true] - 是否携带 token
 * @returns {Object} 处理后的请求配置
 */
function requestInterceptor(config) {
  // --- 自动添加 Token ---
  if (config.withToken !== false) {
    const token = wx.getStorageSync('token')
    if (token) {
      config.header = config.header || {}
      config.header['Authorization'] = `Bearer ${token}`
    }
  }

  // --- 注入设备信息 ---
  const systemInfo = wx.getSystemInfoSync()
  config.header = config.header || {}
  config.header['X-Platform'] = 'wechat'
  config.header['X-System'] = systemInfo.platform
  config.header['X-Version'] = systemInfo.version
  config.header['X-Model'] = systemInfo.model
  config.header['X-Env'] = require('./config').currentEnv

  // --- 注入请求时间戳（用于服务端防重放） ---
  config.header['X-Timestamp'] = Date.now().toString()

  // --- 注入 API 版本 ---
  config.header['X-Api-Version'] = require('./config').version

  return config
}

/**
 * 响应拦截器
 * 对服务端返回的数据做统一处理
 *
 * @param {Object} response - 原始响应对象
 * @param {Object} response.data - 响应体
 * @param {Object} response.header - 响应头
 * @param {number} response.statusCode - HTTP 状态码
 * @returns {Object} 处理后的响应数据
 */
function responseInterceptor(response) {
  const { statusCode, data } = response

  // --- HTTP 层错误处理 ---
  if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
    handleUnauthorized()
    return Promise.reject({
      code: 401,
      message: ERROR_MESSAGES[401]
    })
  }

  if (statusCode === HTTP_STATUS.FORBIDDEN) {
    showToast(ERROR_MESSAGES[403])
    return Promise.reject({
      code: 403,
      message: ERROR_MESSAGES[403]
    })
  }

  if (statusCode >= 500) {
    const msg = ERROR_MESSAGES[statusCode] || ERROR_MESSAGES[500]
    showToast(msg)
    return Promise.reject({
      code: statusCode,
      message: msg
    })
  }

  // --- 业务层错误处理（根据服务端约定的 code 字段判断） ---
  if (data && data.code !== undefined && data.code !== 0 && data.code !== 200) {
    const msg = ERROR_MESSAGES[data.code] || data.message || '未知错误'
    // 401 业务码也需要重新登录
    if (data.code === 401) {
      handleUnauthorized()
    } else {
      showToast(msg)
    }
    return Promise.reject({
      code: data.code,
      message: msg
    })
  }

  return data
}

/**
 * 网络错误处理器
 * 在请求失败（非 HTTP 响应，而是网络层失败）时调用
 *
 * @param {Object} error - wx.request 失败回调中的 error 对象
 * @returns {Object} 格式化的错误信息
 */
function networkErrorInterceptor(error) {
  const { errMsg } = error

  // 超时
  if (errMsg && errMsg.includes('timeout')) {
    showToast(ERROR_MESSAGES[408])
    return {
      code: 408,
      message: ERROR_MESSAGES[408]
    }
  }

  // 网络断开
  if (errMsg && (errMsg.includes('fail') || errMsg.includes('interrupted'))) {
    // 检查当前网络状态
    wx.getNetworkType({
      success(res) {
        if (res.networkType === 'none') {
          showToast('网络已断开，请检查网络连接')
        } else {
          showToast('网络请求失败，请稍后重试')
        }
      }
    })
    return {
      code: -1,
      message: '网络请求失败'
    }
  }

  return {
    code: -1,
    message: errMsg || '未知网络错误'
  }
}

/**
 * 处理 401 未授权：清除本地登录态并跳转到登录页
 * @private
 */
function handleUnauthorized() {
  // 清除本地存储的 token 和用户信息
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')

  // 弹窗提示并跳转
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    showCancel: false,
    confirmText: '去登录',
    success() {
      // 跳转到登录页，关闭所有页面栈
      wx.reLaunch({ url: '/pages/login/login' })
    }
  })
}

/**
 * 封装的轻量 Toast 提示
 * @private
 * @param {string} title - 提示文字
 */
function showToast(title) {
  wx.showToast({
    title,
    icon: 'none',
    duration: 2500
  })
}

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  requestInterceptor,
  responseInterceptor,
  networkErrorInterceptor
}
