/**
 * @file food-recognizer.js
 * @description 食材识别结果展示组件 - 展示单个识别结果，支持编辑和选中
 */
Component({
  properties: {
    item: { type: Object, value: {} },
    index: { type: Number, value: 0 }
  },
  methods: {
    onToggle() { this.triggerEvent('toggle', { index: this.data.index }) },
    onNameInput(e) { this.triggerEvent('namechange', { index: this.data.index, value: e.detail.value }) },
    onQuantityInput(e) { this.triggerEvent('quantitychange', { index: this.data.index, value: e.detail.value }) }
  }
})
