/**
 * @file Expiry Alerts Page
 * @description Displays tiered expiry warnings with batch operations support.
 *   Users can mark items as used, add to shopping list, or delete in bulk.
 *   Supports 5-tier alert levels: expired / today / tomorrow / 3-day / 7-day.
 * @module pages/expiry
 * @version 2.12.0
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const foodService = require('../../services/food-service')
const shoppingService = require('../../services/shopping-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    /** @type {Array} 今日过期食材 */
    todayExpiring: [],
    /** @type {Array} 3天内过期食材 */
    threeDayExpiring: [],
    /** @type {Array} 7天内过期食材 */
    sevenDayExpiring: [],
    /** @type {Array} 已过期食材 */
    alreadyExpired: [],
    /** @type {boolean} 加载状态 */
    loading: true,
    /** @type {boolean} 批量选择模式 */
    batchMode: false,
    /** @type {Array<string>} 已选中的食材 ID 列表 */
    selectedIds: [],
    /** @type {object|null} 过期统计摘要 */
    expirySummary: null
  },

  onLoad() { this._loadData() },
  onShow() { this._loadData() },

  /**
   * 加载过期提醒数据（使用分级预警服务）
   * @private
   */
  _loadData() {
    foodService.initMockData()
    const alerts = foodService.getTieredExpiryAlerts()
    const expirySummary = foodService.getExpirySummary()

    this.setData({
      todayExpiring: alerts.today,
      threeDayExpiring: alerts.threeDay,
      sevenDayExpiring: alerts.sevenDay,
      alreadyExpired: alerts.expired,
      expirySummary,
      loading: false,
      batchMode: false,
      selectedIds: []
    })
  },

  /**
   * 标记食材为已用完
   * @param {object} e 事件对象
   */
  onUseUp(e) {
    const { food } = e.detail
    wx.showModal({
      title: '确认', content: `将「${food.name}」标记为已用完？`,
      success: (res) => {
        if (res.confirm) { foodService.markAsUsed(food.id); this._loadData(); wx.showToast({ title: '已标记', icon: 'success' }) }
      }
    })
  },

  /**
   * 将食材添加到采购清单
   * @param {object} e 事件对象
   */
  onAddToShopping(e) {
    const { food } = e.detail
    shoppingService.addFromUsedFood(food)
    wx.showToast({ title: '已加入采购清单', icon: 'success' })
  },

  /**
   * 删除食材
   * @param {object} e 事件对象
   */
  onDelete(e) {
    const { food } = e.detail
    wx.showModal({
      title: '确认删除', content: `确定删除「${food.name}」吗？`,
      success: (res) => {
        if (res.confirm) { foodService.deleteFood(food.id); this._loadData(); wx.showToast({ title: '已删除', icon: 'success' }) }
      }
    })
  },

  /**
   * 切换批量选择模式
   */
  onToggleBatchMode() {
    this.setData({
      batchMode: !this.data.batchMode,
      selectedIds: []
    })
  },

  /**
   * 切换单个食材选中状态
   * @param {object} e 事件对象
   */
  onToggleSelect(e) {
    const { food } = e.detail
    const selectedIds = [...this.data.selectedIds]
    const index = selectedIds.indexOf(food.id)
    if (index === -1) {
      selectedIds.push(food.id)
    } else {
      selectedIds.splice(index, 1)
    }
    this.setData({ selectedIds })
  },

  /**
   * 全选/取消全选已过期食材
   */
  onSelectAllExpired() {
    const expiredIds = this.data.alreadyExpired.map(f => f.id)
    const allSelected = expiredIds.every(id => this.data.selectedIds.includes(id))
    this.setData({
      selectedIds: allSelected ? [] : expiredIds
    })
  },

  /**
   * 批量标记已选中的食材为已用完
   */
  onBatchMarkUsed() {
    const ids = this.data.selectedIds
    if (ids.length === 0) {
      wx.showToast({ title: '请先选择食材', icon: 'none' })
      return
    }
    wx.showModal({
      title: '批量操作',
      content: `确定将 ${ids.length} 样食材标记为已用完？`,
      success: (res) => {
        if (res.confirm) {
          const result = foodService.batchMarkAsUsed(ids)
          this._loadData()
          wx.showToast({ title: `已标记 ${result.success} 样`, icon: 'success' })
        }
      }
    })
  },

  /**
   * 批量删除已选中的食材
   */
  onBatchDelete() {
    const ids = this.data.selectedIds
    if (ids.length === 0) {
      wx.showToast({ title: '请先选择食材', icon: 'none' })
      return
    }
    wx.showModal({
      title: '批量删除',
      content: `确定删除 ${ids.length} 样食材吗？此操作不可撤销。`,
      success: (res) => {
        if (res.confirm) {
          foodService.deleteFoods(ids)
          this._loadData()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  /**
   * 一键清除所有已过期食材
   */
  onClearAllExpired() {
    const count = this.data.alreadyExpired.length
    if (count === 0) {
      wx.showToast({ title: '没有过期食材', icon: 'none' })
      return
    }
    wx.showModal({
      title: '清除过期食材',
      content: `确定清除 ${count} 样已过期食材吗？`,
      success: (res) => {
        if (res.confirm) {
          const deleted = foodService.batchDeleteExpired()
          this._loadData()
          wx.showToast({ title: `已清除 ${deleted} 样`, icon: 'success' })
        }
      }
    })
  }
}))
