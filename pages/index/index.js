/**
 * 首页仪表盘
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const foodService = require('../../services/food-service')
const recipeService = require('../../services/recipe-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    overview: {},
    todayTasks: [],
    topRecipe: null,
    recentFoods: [],
    loading: true
  },

  onLoad() {
    this._loadData()
  },

  onShow() {
    this._loadData()
  },

  _loadData() {
    foodService.initMockData()
    const overview = foodService.getOverview()
    const todayTasks = foodService.getTodayTasks()
    const recipes = recipeService.getRecommendRecipes()
    const topRecipe = recipes.length > 0 ? recipes[0] : null
    const allFoods = foodService.getAllFoods()
    const recentFoods = allFoods.slice(0, 5)

    this.setData({
      overview,
      todayTasks: todayTasks.slice(0, 5),
      topRecipe,
      recentFoods,
      loading: false
    })
  },

  onAddFood() {
    wx.navigateTo({ url: '/pages/add-food/add-food' })
  },

  onViewExpiry() {
    wx.navigateTo({ url: '/pages/expiry/expiry' })
  },

  onViewRecipes() {
    wx.switchTab({ url: '/pages/recipes/recipes' })
  },

  onGoShopping() {
    wx.navigateTo({ url: '/pages/shopping/shopping' })
  },

  onGoFridge() {
    wx.switchTab({ url: '/pages/fridge/fridge' })
  },

  onGoStats() {
    wx.navigateTo({ url: '/pages/stats/stats' })
  },

  onGoWeeklyMenu() {
    wx.navigateTo({ url: '/pages/weekly-menu/weekly-menu' })
  },

  onFoodTap(e) {
    const { food } = e.detail
    wx.navigateTo({ url: `/pages/add-food/add-food?id=${food.id}` })
  },

  onRecipeTap(e) {
    wx.navigateTo({ url: '/pages/recipes/recipes' })
  }
}))
