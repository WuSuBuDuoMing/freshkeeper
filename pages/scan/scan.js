/**
 * @file scan.js
 * @description 食材识别扫描页面 - 拍照识别并批量添加食材
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const foodService = require('../../services/food-service')
const { recognizeFood, toFoodForm } = require('../../services/food-recognition')
const imageUtils = require('../../utils/image-utils')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    status: 'idle', // idle | scanning | recognizing | done | error
    imagePath: '',
    results: [],
    addedCount: 0
  },

  /** 选择拍照或相册 */
  onChooseImage() {
    imageUtils.chooseImage(1).then(paths => {
      this.setData({ imagePath: paths[0], status: 'recognizing' })
      this._recognize(paths[0])
    }).catch(() => {})
  },

  /** 仅拍照 */
  onTakePhoto() {
    imageUtils.takePhoto().then(paths => {
      this.setData({ imagePath: paths[0], status: 'recognizing' })
      this._recognize(paths[0])
    }).catch(() => {})
  },

  /** 从相册选择 */
  onFromAlbum() {
    imageUtils.chooseFromAlbum(1).then(paths => {
      this.setData({ imagePath: paths[0], status: 'recognizing' })
      this._recognize(paths[0])
    }).catch(() => {})
  },

  /** 执行识别 */
  async _recognize(imagePath) {
    try {
      const results = await recognizeFood(imagePath)
      this.setData({ results, status: 'done' })
    } catch (e) {
      this.setData({ status: 'error' })
      wx.showToast({ title: '识别失败，请重试', icon: 'none' })
    }
  },

  /** 切换选中状态 */
  onToggleSelect(e) {
    const index = e.currentTarget.dataset.index
    const key = `results[${index}].selected`
    this.setData({ [key]: !this.data.results[index].selected })
  },

  /** 修改识别结果的名称 */
  onNameInput(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ [`results[${index}].name`]: e.detail.value })
  },

  /** 修改数量 */
  onQuantityChange(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ [`results[${index}].quantity`]: parseInt(e.detail.value) || 1 })
  },

  /** 批量添加到冰箱 */
  onAddAll() {
    const selected = this.data.results.filter(r => r.selected)
    if (selected.length === 0) {
      wx.showToast({ title: '请至少选择一项', icon: 'none' })
      return
    }

    let addedCount = 0
    selected.forEach(item => {
      const form = toFoodForm(item)
      form.quantity = item.quantity || 1
      form.name = item.name || form.name
      foodService.addFood(form)
      addedCount++
    })

    this.setData({ addedCount })
    wx.showToast({ title: `已添加 ${addedCount} 项食材`, icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1200)
  },

  /** 重新识别 */
  onRetry() {
    this.setData({ status: 'idle', imagePath: '', results: [] })
  }
}))
