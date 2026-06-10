/**
 * 一周菜单页
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const recipeService = require('../../services/recipe-service')
const shoppingService = require('../../services/shopping-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    weekMenu: [],
    loading: true
  },

  onLoad() { this._loadData() },

  _loadData() {
    recipeService.initRecipeData()
    const weekMenu = recipeService.getWeeklyMenu()
    this.setData({ weekMenu, loading: false })
  },

  onRegenerateDay(e) {
    const date = e.currentTarget.dataset.date
    const newDay = recipeService.regenerateDayMenu(date)
    const weekMenu = this.data.weekMenu.map(d => {
      if (d.date === date) return { ...d, meals: newDay.meals }
      return d
    })
    this.setData({ weekMenu })
    wx.showToast({ title: '已重新生成', icon: 'success' })
  },

  onAddDayToShopping(e) {
    const date = e.currentTarget.dataset.date
    const day = this.data.weekMenu.find(d => d.date === date)
    if (!day) return

    const allIngredients = new Set()
    Object.values(day.meals).forEach(recipe => {
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach(i => allIngredients.add(i))
      }
    })

    allIngredients.forEach(name => {
      shoppingService.addShoppingItem({ name, category: '其他', quantity: 1 })
    })
    wx.showToast({ title: '食材已加入采购清单', icon: 'success' })
  },

  onAddAllToShopping() {
    const allIngredients = new Set()
    this.data.weekMenu.forEach(day => {
      Object.values(day.meals).forEach(recipe => {
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(i => allIngredients.add(i))
        }
      })
    })
    allIngredients.forEach(name => {
      shoppingService.addShoppingItem({ name, category: '其他', quantity: 1 })
    })
    wx.showToast({ title: '一周食材已加入采购清单', icon: 'success' })
  }
}))
