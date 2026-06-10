/**
 * @file 订阅引导横幅组件
 * @description 当用户未授权订阅消息时显示，引导用户开启通知
 * @module components/subscribe-banner
 */

const subscriptionService = require('../../services/subscription-service')

/**
 * 订阅引导横幅组件
 * @class SubscribeBanner
 */
Component({
  /**
   * 组件属性
   * @type {Object}
   */
  properties: {
    /** 横幅类型：expiry（过期提醒）/ shopping（采购提醒）/ weekly（周报）/ all（全部） */
    type: {
      type: String,
      value: 'all'
    },
    /** 是否自动展示（页面加载时检查并弹出） */
    autoShow: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件数据
   * @type {Object}
   */
  data: {
    /** 是否显示横幅 */
    visible: false,
    /** 是否正在请求授权 */
    loading: false,
    /** 已关闭过（用户点击了"下次再说"或关闭按钮） */
    dismissed: false,
    /** 提醒类型对应的图标和描述 */
    typeConfig: {
      expiry: {
        icon: '/assets/icons/expiry.png',
        title: '食材过期提醒',
        desc: '智能追踪保质期，过期前及时提醒您处理'
      },
      shopping: {
        icon: '/assets/icons/shopping.png',
        title: '采购清单提醒',
        desc: '自动生成采购清单，缺什么一目了然'
      },
      weekly: {
        icon: '/assets/icons/report.png',
        title: '冰箱周报',
        desc: '每周食材使用总结，帮您减少浪费'
      }
    },
    /** 当前展示的类型列表 */
    displayTypes: []
  },

  /**
   * 组件生命周期 - 组件进入页面节点树
   */
  lifetimes: {
    attached() {
      if (this.properties.autoShow) {
        this._checkAndShow()
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 检查订阅状态并决定是否展示横幅
     * @private
     */
    _checkAndShow() {
      // 检查用户是否已关闭过横幅（本次会话内不再弹出）
      if (this.data.dismissed) return

      const status = subscriptionService.getSubscriptionStatus()
      const type = this.properties.type

      let needsShow = false
      const displayTypes = []

      if (type === 'all') {
        // 检查所有模板是否都已授权
        Object.keys(subscriptionService.TEMPLATES).forEach(key => {
          if (status[key] !== 'accept') {
            displayTypes.push(key)
            needsShow = true
          }
        })
      } else {
        if (status[type] !== 'accept') {
          displayTypes.push(type)
          needsShow = true
        }
      }

      if (needsShow) {
        this.setData({
          visible: true,
          displayTypes
        })
      }
    },

    /**
     * 处理一键开启按钮点击
     */
    async handleSubscribe() {
      if (this.data.loading) return

      this.setData({ loading: true })

      try {
        const type = this.properties.type
        let results

        if (type === 'all') {
          results = await subscriptionService.requestAllSubscriptions()
        } else {
          const result = await subscriptionService.requestSubscribe(type)
          results = { [type]: result }
        }

        // 更新授权状态
        const currentStatus = subscriptionService.getSubscriptionStatus()
        const newStatus = Object.assign({}, currentStatus, results)
        subscriptionService.saveSubscriptionStatus(newStatus)

        // 检查是否全部授权
        const allAccepted = Object.values(results).every(v => v === 'accept')

        if (allAccepted) {
          wx.showToast({
            title: '开启成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '部分权限未开启',
            icon: 'none'
          })
        }

        this.setData({ visible: false })
        this.triggerEvent('subscribed', { results, newStatus })
      } catch (err) {
        console.error('[SubscribeBanner] 订阅失败:', err)
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        })
      } finally {
        this.setData({ loading: false })
      }
    },

    /**
     * 处理关闭按钮点击（下次再说）
     */
    handleDismiss() {
      this.setData({
        visible: false,
        dismissed: true
      })
      this.triggerEvent('dismissed')
    },

    /**
     * 阻止蒙层下的滚动穿透
     */
    preventScroll() {
      // 空方法，用于 catch-scroll
    }
  }
})
