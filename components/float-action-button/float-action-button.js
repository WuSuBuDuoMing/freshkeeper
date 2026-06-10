/**
 * @file float-action-button.js
 * @description 悬浮操作按钮(FAB) - 可拖动、展开子菜单
 */
Component({
  properties: {
    actions: { type: Array, value: [] } // [{icon, label, color}]
  },
  data: { expanded: false, x: 600, y: 900, _startX: 0, _startY: 0 },
  lifetimes: {
    attached() {
      const sys = wx.getSystemInfoSync()
      this.setData({ x: sys.windowWidth - 80, y: sys.windowHeight - 200 })
    }
  },
  methods: {
    onTouchStart(e) {
      this._touchX = e.touches[0].clientX
      this._touchY = e.touches[0].clientY
      this._moved = false
    },
    onTouchMove(e) {
      const dx = e.touches[0].clientX - this._touchX
      const dy = e.touches[0].clientY - this._touchY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this._moved = true
      if (this._moved) {
        this.setData({
          x: Math.max(0, Math.min(this.data.x + dx, 690)),
          y: Math.max(80, Math.min(this.data.y + dy, 1200))
        })
        this._touchX = e.touches[0].clientX
        this._touchY = e.touches[0].clientY
      }
    },
    onTap() {
      if (!this._moved) this.setData({ expanded: !this.data.expanded })
    },
    onActionTap(e) {
      const index = e.currentTarget.dataset.index
      this.triggerEvent('action', { index, action: this.data.actions[index] })
      this.setData({ expanded: false })
    }
  }
})
