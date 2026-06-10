/**
 * 食材卡片组件
 * 用于展示单个食材的信息
 */
const { getFoodEmoji, getStatusTagClass, getStatusText, getStatusColor } = require('../../utils/food-utils')
const { daysUntilExpiry, formatRelativeTime } = require('../../utils/date-utils')

Component({
  properties: {
    food: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: true
    },
    compact: {
      type: Boolean,
      value: false
    }
  },

  data: {
    emoji: '📦',
    statusClass: 'tag-normal',
    statusText: '正常',
    statusColor: '#4CAF50',
    daysText: ''
  },

  lifetimes: {
    attached() {
      this._updateDisplay()
    }
  },

  observers: {
    'food'() {
      this._updateDisplay()
    }
  },

  methods: {
    _updateDisplay() {
      const { food } = this.data
      if (!food || !food.name) return

      const emoji = getFoodEmoji(food.name, food.category)
      const status = food.status || 'normal'
      const days = daysUntilExpiry(food.expiryDate)
      let daysText = ''

      if (status === 'used') {
        daysText = '已用完'
      } else if (days < 0) {
        daysText = `已过期${Math.abs(days)}天`
      } else if (days === 0) {
        daysText = '今天过期'
      } else if (days === 1) {
        daysText = '明天过期'
      } else {
        daysText = `${days}天后过期`
      }

      this.setData({
        emoji,
        statusClass: getStatusTagClass(status),
        statusText: getStatusText(status),
        statusColor: getStatusColor(status),
        daysText
      })
    },

    onTap() {
      this.triggerEvent('tap', { food: this.data.food })
    },

    onUseUp() {
      this.triggerEvent('useup', { food: this.data.food })
    },

    onDelete() {
      this.triggerEvent('delete', { food: this.data.food })
    },

    onAddToShopping() {
      this.triggerEvent('addtoshopping', { food: this.data.food })
    },

    onEdit() {
      this.triggerEvent('edit', { food: this.data.food })
    }
  }
})
