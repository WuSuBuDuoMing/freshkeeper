/**
 * 冰箱食材列表页
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const { debounce } = require('../../utils/performance-utils')
const foodService = require('../../services/food-service')
const { CATEGORIES, STATUS_LIST } = require('../../utils/food-utils')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    foods: [],
    filteredFoods: [],
    categories: CATEGORIES,
    statusList: STATUS_LIST,
    activeCategory: 'all',
    activeStatus: 'all',
    searchKeyword: '',
    sortBy: 'expiry',
    loading: true,
    isEmpty: false
  },

  onLoad() {
    this._loadFoods()
    this._debouncedSearch = debounce(() => this._applyFilters(), 200)
  },

  onShow() {
    if (this.data.foods.length === 0) {
      this._loadFoods()
    }
  },

  _loadFoods() {
    foodService.initMockData()
    const foods = foodService.getAllFoods()
    this.setData({ foods, loading: false })
    this._applyFilters()
  },

  _applyFilters() {
    let { foods, activeCategory, activeStatus, searchKeyword, sortBy } = this.data
    let result = [...foods]

    // 分类筛选
    if (activeCategory !== 'all') {
      result = result.filter(f => f.category === activeCategory)
    }

    // 状态筛选
    if (activeStatus !== 'all') {
      result = result.filter(f => f.status === activeStatus)
    }

    // 搜索
    if (searchKeyword && searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase()
      result = result.filter(f =>
        f.name.toLowerCase().includes(kw) ||
        f.category.toLowerCase().includes(kw)
      )
    }

    // 排序
    switch (sortBy) {
      case 'expiry':
        result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
        break
      case 'created':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    this.setData({ filteredFoods: result, isEmpty: result.length === 0 })
  },

  onCategoryChange(e) {
    this.setData({ activeCategory: e.detail.key })
    this._applyFilters()
  },

  onStatusChange(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ activeStatus: key })
    this._applyFilters()
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    this._debouncedSearch()
  },

  onSearchClear() {
    this.setData({ searchKeyword: '' })
    this._applyFilters()
  },

  onAddFood() {
    wx.navigateTo({ url: '/pages/add-food/add-food' })
  },

  onFoodTap(e) {
    const { food } = e.detail
    wx.navigateTo({ url: `/pages/add-food/add-food?id=${food.id}` })
  },

  onFoodUseUp(e) {
    const { food } = e.detail
    wx.showModal({
      title: '确认',
      content: `将「${food.name}」标记为已用完？`,
      success: (res) => {
        if (res.confirm) {
          foodService.markAsUsed(food.id)
          this._loadFoods()
          wx.showToast({ title: '已标记用完', icon: 'success' })
        }
      }
    })
  },

  onFoodDelete(e) {
    const { food } = e.detail
    wx.showModal({
      title: '确认删除',
      content: `确定要删除「${food.name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          foodService.deleteFood(food.id)
          this._loadFoods()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort
    this.setData({ sortBy: sort })
    this._applyFilters()
  }
}))
