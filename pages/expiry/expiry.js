/**
 * 过期提醒页
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const foodService = require('../../services/food-service')
const shoppingService = require('../../services/shopping-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    todayExpiring: [],
    threeDayExpiring: [],
    sevenDayExpiring: [],
    alreadyExpired: [],
    loading: true
  },

  onLoad() { this._loadData() },
  onShow() { this._loadData() },

  _loadData() {
    foodService.initMockData()
    const all = foodService.getAllFoods().filter(f => f.status !== 'used')
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const daysLeft = (expiryDate) => {
      const e = new Date(expiryDate)
      const ed = new Date(e.getFullYear(), e.getMonth(), e.getDate())
      return Math.ceil((ed - today) / (1000 * 60 * 60 * 24))
    }

    const todayExpiring = all.filter(f => daysLeft(f.expiryDate) === 0)
    const threeDayExpiring = all.filter(f => { const d = daysLeft(f.expiryDate); return d > 0 && d <= 3 })
    const sevenDayExpiring = all.filter(f => { const d = daysLeft(f.expiryDate); return d > 3 && d <= 7 })
    const alreadyExpired = all.filter(f => daysLeft(f.expiryDate) < 0)

    this.setData({ todayExpiring, threeDayExpiring, sevenDayExpiring, alreadyExpired, loading: false })
  },

  onUseUp(e) {
    const { food } = e.detail
    wx.showModal({
      title: '确认', content: `将「${food.name}」标记为已用完？`,
      success: (res) => {
        if (res.confirm) { foodService.markAsUsed(food.id); this._loadData(); wx.showToast({ title: '已标记', icon: 'success' }) }
      }
    })
  },

  onAddToShopping(e) {
    const { food } = e.detail
    shoppingService.addFromUsedFood(food)
    wx.showToast({ title: '已加入采购清单', icon: 'success' })
  },

  onDelete(e) {
    const { food } = e.detail
    wx.showModal({
      title: '确认删除', content: `确定删除「${food.name}」吗？`,
      success: (res) => {
        if (res.confirm) { foodService.deleteFood(food.id); this._loadData(); wx.showToast({ title: '已删除', icon: 'success' }) }
      }
    })
  }
}))
