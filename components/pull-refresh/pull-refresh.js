/**
 * @file pull-refresh.js
 * @description 下拉刷新组件 - 冰箱主题动画
 */
Component({
  properties: {
    refreshing: { type: Boolean, value: false },
    threshold: { type: Number, value: 80 }
  },
  data: {
    startY: 0, pulling: false, offset: 0,
    indicatorOffset: 0, rotateDeg: 0, indicatorOpacity: 0, refreshText: '下拉刷新'
  },
  observers: {
    refreshing(val) {
      if (!val && this.data.pulling) {
        this.setData({ offset: 0, pulling: false, indicatorOpacity: 0 })
      }
    }
  },
  methods: {
    onTouchStart(e) { this._startY = e.touches[0].clientY },
    onTouchMove(e) {
      const dy = e.touches[0].clientY - this._startY
      if (dy <= 0) return
      const offset = Math.min(dy, 200)
      const progress = Math.min(offset / this.data.threshold, 1)
      this.setData({
        pulling: true, offset,
        indicatorOffset: Math.min(offset, 80),
        rotateDeg: progress * 360,
        indicatorOpacity: progress,
        refreshText: progress >= 1 ? '松开刷新' : '下拉刷新'
      })
    },
    onTouchEnd() {
      if (this.data.offset >= this.data.threshold) {
        this.triggerEvent('refresh')
        this.setData({ offset: 60, refreshText: '正在刷新...' })
      } else {
        this.setData({ offset: 0, pulling: false, indicatorOpacity: 0 })
      }
    }
  }
})
