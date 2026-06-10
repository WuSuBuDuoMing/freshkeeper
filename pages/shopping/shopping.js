/**
 * 采购清单页
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const shoppingService = require('../../services/shopping-service')
const { CATEGORIES } = require('../../utils/food-utils')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    pendingItems: [],
    purchasedItems: [],
    groupedPending: {},
    totalEstimate: 0,
    purchasedCount: 0,
    totalCount: 0,
    showAddForm: false,
    newItem: { name: '', quantity: 1, unit: '个', category: '蔬菜' },
    categories: CATEGORIES.filter(c => c.key !== 'all'),
    activeTab: 'pending',
    loading: true
  },

  onLoad() { this._loadData() },
  onShow() { this._loadData() },

  _loadData() {
    shoppingService.initShoppingData()
    const pending = shoppingService.getPendingItems()
    const purchased = shoppingService.getPurchasedItems()
    const grouped = shoppingService.groupByCategory(pending)
    const totalEstimate = shoppingService.calculateTotalPrice(pending)

    this.setData({
      pendingItems: pending,
      purchasedItems: purchased,
      groupedPending: grouped,
      totalEstimate,
      purchasedCount: purchased.length,
      totalCount: pending.length + purchased.length,
      loading: false
    })
  },

  onToggleTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onToggleAddForm() {
    this.setData({ showAddForm: !this.data.showAddForm })
  },

  onNewItemInput(e) {
    this.setData({ 'newItem.name': e.detail.value })
  },

  onNewItemQuantityChange(e) {
    this.setData({ 'newItem.quantity': parseInt(e.detail.value) || 1 })
  },

  onNewItemCategoryChange(e) {
    const index = e.detail.value
    this.setData({ 'newItem.category': this.data.categories[index].key })
  },

  onAddItem() {
    const { newItem } = this.data
    if (!newItem.name.trim()) {
      wx.showToast({ title: '请输入物品名称', icon: 'none' })
      return
    }
    shoppingService.addShoppingItem(newItem)
    this.setData({ newItem: { name: '', quantity: 1, unit: '个', category: '蔬菜' }, showAddForm: false })
    this._loadData()
    wx.showToast({ title: '已添加', icon: 'success' })
  },

  onTogglePurchased(e) {
    const { item } = e.detail
    if (item.purchased) {
      shoppingService.unmarkPurchased(item.id)
    } else {
      shoppingService.markAsPurchased(item.id)
    }
    this._loadData()
  },

  onDeleteItem(e) {
    const { item } = e.detail
    wx.showModal({
      title: '确认', content: `删除「${item.name}」？`,
      success: (res) => {
        if (res.confirm) { shoppingService.deleteShoppingItem(item.id); this._loadData() }
      }
    })
  },

  onClearPurchased() {
    if (this.data.purchasedCount === 0) return
    wx.showModal({
      title: '确认', content: `清空已购买的 ${this.data.purchasedCount} 项？`,
      success: (res) => {
        if (res.confirm) { shoppingService.clearPurchased(); this._loadData(); wx.showToast({ title: '已清空', icon: 'success' }) }
      }
    })
  }
}))
