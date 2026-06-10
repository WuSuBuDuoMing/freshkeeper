/**
 * 全局错误处理模块
 * 统一处理异常、记录日志、用户友好提示
 */

/**
 * 错误码映射表
 */
const ERROR_CODES = {
  NETWORK_ERROR: { code: 1001, message: '网络连接失败，请检查网络设置', icon: '📡' },
  NETWORK_TIMEOUT: { code: 1002, message: '请求超时，请稍后重试', icon: '⏱' },
  SERVER_ERROR: { code: 1003, message: '服务器开小差了，请稍后重试', icon: '🔧' },
  UNAUTHORIZED: { code: 1004, message: '登录已过期，请重新登录', icon: '🔑' },
  FORBIDDEN: { code: 1005, message: '没有操作权限', icon: '🔒' },
  NOT_FOUND: { code: 1006, message: '数据不存在', icon: '📭' },
  VALIDATION_ERROR: { code: 2001, message: '输入信息有误，请检查', icon: '📝' },
  STORAGE_FULL: { code: 2002, message: '存储空间不足，请清理缓存', icon: '💾' },
  CAMERA_ERROR: { code: 3001, message: '相机权限被拒绝', icon: '📷' },
  IMAGE_ERROR: { code: 3002, message: '图片处理失败', icon: '🖼' },
  AI_ERROR: { code: 4001, message: 'AI 服务暂时不可用', icon: '🤖' },
  UNKNOWN: { code: 9999, message: '发生了未知错误', icon: '❓' }
}

/**
 * 日志级别
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

/**
 * 日志管理器
 */
const Logger = {
  _logs: [],
  _maxLogs: 200,
  _level: LOG_LEVELS.DEBUG,

  /**
   * 设置日志级别
   * @param {string} level
   */
  setLevel(level) {
    this._level = LOG_LEVELS[level] || LOG_LEVELS.DEBUG
  },

  /**
   * 添加日志
   */
  _add(level, tag, message, data) {
    if (level < this._level) return

    const entry = {
      timestamp: new Date().toISOString(),
      level: Object.keys(LOG_LEVELS)[level],
      tag,
      message,
      data
    }

    this._logs.push(entry)
    if (this._logs.length > this._maxLogs) {
      this._logs = this._logs.slice(-this._maxLogs)
    }

    // 开发环境输出到控制台
    const prefix = `[${entry.level}][${tag}]`
    switch (entry.level) {
      case 'DEBUG': console.log(prefix, message, data || ''); break
      case 'INFO': console.log(prefix, message, data || ''); break
      case 'WARN': console.warn(prefix, message, data || ''); break
      case 'ERROR': console.error(prefix, message, data || ''); break
    }
  },

  debug(tag, message, data) { this._add(LOG_LEVELS.DEBUG, tag, message, data) },
  info(tag, message, data) { this._add(LOG_LEVELS.INFO, tag, message, data) },
  warn(tag, message, data) { this._add(LOG_LEVELS.WARN, tag, message, data) },
  error(tag, message, data) { this._add(LOG_LEVELS.ERROR, tag, message, data) },

  /**
   * 获取所有日志
   */
  getLogs() { return [...this._logs] },

  /**
   * 获取指定级别的日志
   */
  getLogsByLevel(level) {
    return this._logs.filter(l => l.level === level)
  },

  /**
   * 清空日志
   */
  clearLogs() { this._logs = [] },

  /**
   * 导出日志为文本
   */
  exportLogs() {
    return this._logs.map(l =>
      `${l.timestamp} [${l.level}][${l.tag}] ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`
    ).join('\n')
  }
}

/**
 * 错误处理核心函数
 * @param {Error|string} error
 * @param {object} options
 */
function handleError(error, options = {}) {
  const { silent = false, tag = 'Global', showUI = true } = options

  // 获取错误信息
  let errorInfo = ERROR_CODES.UNKNOWN

  if (typeof error === 'string') {
    errorInfo = { ...ERROR_CODES.UNKNOWN, message: error }
  } else if (error && error.code && ERROR_CODES[error.code]) {
    errorInfo = ERROR_CODES[error.code]
  } else if (error && error.errMsg) {
    // wx API 错误
    if (error.errMsg.includes('timeout')) errorInfo = ERROR_CODES.NETWORK_TIMEOUT
    else if (error.errMsg.includes('fail')) errorInfo = ERROR_CODES.NETWORK_ERROR
    else errorInfo = { ...ERROR_CODES.UNKNOWN, message: error.errMsg }
  }

  // 记录日志
  Logger.error(tag, errorInfo.message, { original: error, errorInfo })

  // 显示 UI 提示
  if (!silent && showUI) {
    wx.showToast({
      title: `${errorInfo.icon} ${errorInfo.message}`,
      icon: 'none',
      duration: 2500
    })
  }

  return errorInfo
}

/**
 * 异步函数错误包装器
 * @param {Function} fn 异步函数
 * @param {object} options
 * @returns {Function}
 */
function wrapAsync(fn, options = {}) {
  return async function (...args) {
    try {
      return await fn.apply(this, args)
    } catch (error) {
      return handleError(error, options)
    }
  }
}

/**
 * 设置全局错误监听
 */
function setupGlobalErrorHandling() {
  // 小程序全局错误
  wx.onError((error) => {
    Logger.error('App', '未捕获异常', { error })
  })

  // 页面未找到
  wx.onPageNotFound((res) => {
    Logger.error('App', '页面未找到', { path: res.path })
    wx.navigateTo({ url: '/pages/index/index' })
  })

  // 网络状态变化
  wx.onNetworkStatusChange((res) => {
    if (!res.isConnected) {
      Logger.warn('Network', '网络已断开')
      wx.showToast({ title: '📡 网络已断开', icon: 'none' })
    } else {
      Logger.info('Network', '网络已恢复')
    }
  })
}

module.exports = {
  ERROR_CODES,
  LOG_LEVELS,
  Logger,
  handleError,
  wrapAsync,
  setupGlobalErrorHandling
}
