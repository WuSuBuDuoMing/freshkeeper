/**
 * @file AI Recipe Recommendation Page
 * @description Displays AI-generated recipe recommendations based on current fridge
 *   contents. Supports recipe detail view, missing ingredient shopping, and
 *   navigation to weekly menu planning.
 * @module pages/recipes
 * @version 2.15.0
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const recipeService = require('../../services/recipe-service')
const shoppingService = require('../../services/shopping-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    /** @type {Array} 推荐菜谱列表 */
    recipes: [],
    /** @type {boolean} 加载状态 */
    loading: true,
    /** @type {boolean} 是否显示菜谱详情 */
    showDetail: false,
    /** @type {object|null} 当前选中的菜谱 */
    selectedRecipe: null
  },

  /** 页面加载时获取菜谱推荐 */
  onLoad() { this._loadRecipes() },

  /**
   * 加载菜谱推荐数据
   * @private
   */
  _loadRecipes() {
    recipeService.initRecipeData()
    const recipes = recipeService.getRecommendRecipes()
    this.setData({ recipes, loading: false })
  },

  /**
   * 刷新菜谱推荐
   */
  onRefresh() {
    this.setData({ loading: true })
    setTimeout(() => {
      this._loadRecipes()
      wx.showToast({ title: '已刷新推荐', icon: 'success' })
    }, 500)
  },

  /**
   * 点击菜谱卡片查看详情
   * @param {object} e 事件对象，detail 包含 recipe 对象
   */
  onRecipeTap(e) {
    const { recipe } = e.detail
    this.setData({ showDetail: true, selectedRecipe: recipe })
  },

  /**
   * 关闭菜谱详情
   */
  onCloseDetail() {
    this.setData({ showDetail: false, selectedRecipe: null })
  },

  /**
   * 将缺少的食材加入采购清单
   */
  onAddMissingToShopping() {
    const { selectedRecipe } = this.data
    if (!selectedRecipe || !selectedRecipe.missingIngredients) return

    selectedRecipe.missingIngredients.forEach(name => {
      shoppingService.addShoppingItem({ name, category: '其他', quantity: 1 })
    })
    wx.showToast({ title: '缺少食材已加入采购清单', icon: 'success' })
    this.setData({ showDetail: false, selectedRecipe: null })
  },

  /**
   * 跳转到一周菜单页面
   */
  goToWeeklyMenu() {
    wx.navigateTo({ url: '/pages/weekly-menu/weekly-menu' })
  }
}))
