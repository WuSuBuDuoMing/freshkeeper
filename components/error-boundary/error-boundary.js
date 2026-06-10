/**
 * 错误边界组件
 * 包裹子组件，捕获渲染错误并展示兜底 UI
 */

const { Logger } = require('../../utils/error-handler')

Component({
  options: {
    multipleSlots: true
  },

  properties: {
    /** 是否启用错误捕获 */
    enable: {
      type: Boolean,
      value: true
    },
    /** 自定义错误消息 */
    errorMessage: {
      type: String,
      value: ''
    },
    /** 是否显示重试按钮 */
    showRetry: {
      type: Boolean,
      value: true
    }
  },

  data: {
    hasError: false,
    displayMessage: ''
  },

  lifetimes: {
    error(err) {
      if (!this.data.enable) return

      Logger.error('ErrorBoundary', '组件渲染错误', {
        error: err.message || err,
        component: this.is || 'unknown'
      })

      this.setData({
        hasError: true,
        displayMessage: this.data.errorMessage || '组件加载失败，请尝试重新加载'
      })
    }
  },

  methods: {
    /**
     * 重试加载
     */
    onRetry() {
      Logger.info('ErrorBoundary', '用户触发重试')
      this.setData({
        hasError: false,
        displayMessage: ''
      })

      // 触发重试事件供父组件监听
      this.triggerEvent('retry')
    },

    /**
     * 手动重置错误状态（供父组件调用）
     */
    reset() {
      this.setData({
        hasError: false,
        displayMessage: ''
      })
    }
  }
})
