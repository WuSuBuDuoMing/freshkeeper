/**
 * 日志 Behavior
 * 提供给页面使用的日志混入
 * 自动记录页面进入/离开、用户操作、数据加载耗时、错误事件
 */

const { Logger } = require('./error-handler')

/**
 * 记录用户行为
 * @param {string} action 操作类型
 * @param {string} detail 详情
 */
function logAction(action, detail) {
  Logger.info('UserAction', action, { detail, time: new Date().toISOString() })
}

/**
 * 日志 Behavior，供页面使用
 * 使用方式：Page(Behaviors({ ... }, LogBehavior))
 */
const LogBehavior = Behavior({
  lifetimes: {
    onLoad(options) {
      const pageName = this.route || this.__route__ || 'unknown'
      Logger.info('Page', `页面加载: ${pageName}`, { options })
      this._loadStartTime = Date.now()
    },

    show() {
      const pageName = this.route || this.__route__ || 'unknown'
      Logger.info('Page', `页面显示: ${pageName}`)

      // 记录页面加载耗时
      if (this._loadStartTime) {
        const duration = Date.now() - this._loadStartTime
        Logger.info('Performance', `页面渲染耗时: ${duration}ms`, { page: pageName, duration })
        this._loadStartTime = null
      }
    },

    hide() {
      const pageName = this.route || this.__route__ || 'unknown'
      Logger.info('Page', `页面隐藏: ${pageName}`)
    },

    detached() {
      const pageName = this.route || this.__route__ || 'unknown'
      Logger.info('Page', `页面卸载: ${pageName}`)
    },

    error(err) {
      const pageName = this.route || this.__route__ || 'unknown'
      Logger.error('Page', `页面错误: ${pageName}`, { error: err })
    }
  },

  methods: {
    /**
     * 记录按钮点击事件
     * 在 wxml 中使用 bindtap="onTapLog" data-action="添加食材"
     */
    onTapLog(e) {
      const action = (e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.action) || '未知操作'
      logAction('tap', action)
    },

    /**
     * 记录数据加载开始
     * @param {string} key 数据标识
     */
    _logLoadStart(key) {
      this._loadTimers = this._loadTimers || {}
      this._loadTimers[key] = Date.now()
      Logger.debug('DataLoad', `开始加载: ${key}`)
    },

    /**
     * 记录数据加载完成
     * @param {string} key 数据标识
     * @param {boolean} success 是否成功
     */
    _logLoadEnd(key, success = true) {
      this._loadTimers = this._loadTimers || {}
      const startTime = this._loadTimers[key]
      if (startTime) {
        const duration = Date.now() - startTime
        const level = success ? 'info' : 'warn'
        Logger[level]('DataLoad', `加载${success ? '完成' : '失败'}: ${key}`, { duration, success })
        delete this._loadTimers[key]
      }
    },

    /**
     * 记录自定义操作
     * @param {string} action 操作名称
     * @param {object} data 附加数据
     */
    _logEvent(action, data) {
      logAction(action, data)
    },

    /**
     * 记录错误事件
     * @param {string} context 错误上下文
     * @param {Error|string} error 错误信息
     */
    _logError(context, error) {
      Logger.error('PageError', context, {
        error: typeof error === 'string' ? error : (error.message || error),
        page: this.route || this.__route__ || 'unknown'
      })
    }
  }
})

module.exports = {
  LogBehavior,
  logAction,
  Logger
}
