/**
 * AI 菜谱推荐页
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const recipeService = require('../../services/recipe-service')
const shoppingService = require('../../services/shopping-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    recipes: [],
    loading: true,
    showDetail: false,
    selectedRecipe: null
  },

  onLoad() { this._loadRecipes() },

  _loadRecipes() {
    recipeService.initRecipeData()
    const recipes = recipeService.getRecommendRecipes()
    this.setData({ recipes, loading: false })
  },

  onRefresh() {
    this.setData({ loading: true })
    setTimeout(() => {
      this._loadRecipes()
      wx.showToast({ title: '已刷新推荐', icon: 'success' })
    }, 500)
  },

  onRecipeTap(e) {
    const { recipe } = e.detail
    this.setData({ showDetail: true, selectedRecipe: recipe })
  },

  onCloseDetail() {
    this.setData({ showDetail: false, selectedRecipe: null })
  },

  onAddMissingToShopping() {
    const { selectedRecipe } = this.data
    if (!selectedRecipe || !selectedRecipe.missingIngredients) return

    selectedRecipe.missingIngredients.forEach(name => {
      shoppingService.addShoppingItem({ name, category: '其他', quantity: 1 })
    })
    wx.showToast({ title: '缺少食材已加入采购清单', icon: 'success' })
    this.setData({ showDetail: false, selectedRecipe: null })
  },

  goToWeeklyMenu() {
    wx.navigateTo({ url: '/pages/weekly-menu/weekly-menu' })
  }
}))
