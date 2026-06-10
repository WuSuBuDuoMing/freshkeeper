Component({
  properties: {
    categories: { type: Array, value: [] },
    activeKey: { type: String, value: 'all' }
  },
  methods: {
    onSelect(e) {
      const key = e.currentTarget.dataset.key
      this.triggerEvent('change', { key })
    }
  }
})
