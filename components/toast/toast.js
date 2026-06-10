/**
 * @file toast.js
 * @description 全局轻提示组件 - success/error/warning/info/loading
 */
const animUtils = require('../../utils/animation-utils')

Component({
  data: {
    visible: false,
    message: '',
    icon: '',
    type: 'info',
    timer: null
  },
  methods: {
    show(options = {}) {
      const { message = '', type = 'info', duration = 2000 } = options
      const iconMap = { success: '✅', error: '❌', warning: '⚠️', info: '💡', loading: '⏳' }
      if (this.data.timer) clearTimeout(this.data.timer)
      this.setData({ visible: true, message, type, icon: iconMap[type] || '💡' })
      if (duration > 0) {
        const timer = setTimeout(() => this.hide(), duration)
        this.setData({ timer })
      }
    },
    hide() {
      this.setData({ visible: false })
    },
    success(msg, dur) { this.show({ message: msg, type: 'success', duration: dur }) },
    error(msg, dur) { this.show({ message: msg, type: 'error', duration: dur }) },
    warning(msg, dur) { this.show({ message: msg, type: 'warning', duration: dur }) },
    info(msg, dur) { this.show({ message: msg, type: 'info', duration: dur }) },
    loading(msg) { this.show({ message: msg, type: 'loading', duration: 0 }) }
  }
})
