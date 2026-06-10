const imageUtils = require('../../utils/image-utils')

Component({
  properties: {
    images: { type: Array, value: [] },
    maxCount: { type: Number, value: 9 }
  },
  methods: {
    onChoose() {
      const remaining = this.data.maxCount - this.data.images.length
      if (remaining <= 0) return
      imageUtils.chooseImage(remaining).then(paths => {
        this.triggerEvent('change', { images: [...this.data.images, ...paths] })
      }).catch(() => {})
    },
    onDelete(e) {
      const idx = e.currentTarget.dataset.index
      const images = this.data.images.filter((_, i) => i !== idx)
      this.triggerEvent('change', { images })
    },
    onPreview(e) {
      const idx = e.currentTarget.dataset.index
      imageUtils.previewImage(this.data.images[idx], this.data.images)
    }
  }
})
