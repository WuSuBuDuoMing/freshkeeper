/**
 * 添加/编辑食材页
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const foodService = require('../../services/food-service')
const { CATEGORIES, STORAGE_AREAS, UNITS } = require('../../utils/food-utils')
const { getToday, getFutureDate, formatDate } = require('../../utils/date-utils')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    isEdit: false,
    foodId: '',
    categories: CATEGORIES.filter(c => c.key !== 'all'),
    storageAreas: STORAGE_AREAS,
    units: UNITS,
    form: {
      name: '',
      category: '蔬菜',
      quantity: 1,
      unit: '个',
      storageArea: '冷藏区',
      purchaseDate: '',
      expiryDate: '',
      notes: ''
    },
    errors: {}
  },

  onLoad(options) {
    const today = getToday()
    const defaultExpiry = getFutureDate(7)

    if (options && options.id) {
      // 编辑模式
      const food = foodService.getFoodById(options.id)
      if (food) {
        this.setData({
          isEdit: true,
          foodId: options.id,
          form: {
            name: food.name,
            category: food.category,
            quantity: food.quantity,
            unit: food.unit,
            storageArea: food.storageArea,
            purchaseDate: food.purchaseDate,
            expiryDate: food.expiryDate,
            notes: food.notes || ''
          }
        })
        wx.setNavigationBarTitle({ title: '编辑食材' })
      }
    } else {
      this.setData({
        form: { ...this.data.form, purchaseDate: today, expiryDate: defaultExpiry }
      })
      wx.setNavigationBarTitle({ title: '添加食材' })
    }
  },

  onInputName(e) {
    this.setData({ 'form.name': e.detail.value, 'errors.name': '' })
  },

  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({ 'form.category': this.data.categories[index].key })
  },

  onQuantityChange(e) {
    const val = parseInt(e.detail.value) || 1
    this.setData({ 'form.quantity': Math.max(1, val) })
  },

  onQuantityMinus() {
    const q = Math.max(1, this.data.form.quantity - 1)
    this.setData({ 'form.quantity': q })
  },

  onQuantityPlus() {
    this.setData({ 'form.quantity': this.data.form.quantity + 1 })
  },

  onUnitChange(e) {
    const index = e.detail.value
    this.setData({ 'form.unit': this.data.units[index] })
  },

  onStorageAreaChange(e) {
    const index = e.detail.value
    this.setData({ 'form.storageArea': this.data.storageAreas[index].key })
  },

  onPurchaseDateChange(e) {
    this.setData({ 'form.purchaseDate': e.detail.value })
  },

  onExpiryDateChange(e) {
    this.setData({ 'form.expiryDate': e.detail.value, 'errors.expiryDate': '' })
  },

  onNotesInput(e) {
    this.setData({ 'form.notes': e.detail.value })
  },

  _validate() {
    const { form } = this.data
    const errors = {}

    if (!form.name || !form.name.trim()) {
      errors.name = '请输入食材名称'
    }
    if (!form.expiryDate) {
      errors.expiryDate = '请选择过期日期'
    }
    if (form.purchaseDate && form.expiryDate && form.expiryDate < form.purchaseDate) {
      errors.expiryDate = '过期日期不能早于购买日期'
    }

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  onSubmit() {
    if (!this._validate()) {
      wx.showToast({ title: '请检查表单', icon: 'none' })
      return
    }

    const { form, isEdit, foodId } = this.data

    if (isEdit) {
      foodService.updateFood(foodId, form)
      wx.showToast({ title: '保存成功', icon: 'success' })
    } else {
      foodService.addFood(form)
      wx.showToast({ title: '添加成功', icon: 'success' })
    }

    setTimeout(() => {
      wx.navigateBack()
    }, 800)
  }
}))
