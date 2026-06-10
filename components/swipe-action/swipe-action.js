/**
 * @file swipe-action.js
 * @description 左滑操作组件 - 左滑露出操作按钮
 */
Component({
  properties: {
    actions: { type: Array, value: [] }, // [{text, color, bgColor}]
    disabled: { type: Boolean, value: false }
  },
  data: { offsetX: 0, actionWidth: 140 },
  methods: {
    onTouchStart(e) {
      if (this.data.disabled) return
      this._startX = e.touches[0].clientX
      this._moved = false
    },
    onTouchMove(e) {
      if (this.data.disabled) return
      const dx = e.touches[0].clientX - this._startX
      const maxOffset = -this.data.actions.length * this.data.actionWidth
      const offset = Math.max(maxOffset, Math.min(0, dx))
      if (Math.abs(dx) > 10) this._moved = true
      this.setData({ offsetX: this._moved ? offset : 0 })
    },
    onTouchEnd() {
      if (this.data.disabled) return
      const threshold = -this.data.actions.length * this.data.actionWidth * 0.4
      this.setData({ offsetX: this.data.offsetX < threshold ? -this.data.actions.length * this.data.actionWidth : 0 })
    },
    reset() { this.setData({ offsetX: 0 }) },
    onActionTap(e) {
      const index = e.currentTarget.dataset.index
      this.triggerEvent('action', { index, action: this.data.actions[index] })
      this.reset()
    }
  }
})
