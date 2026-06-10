Component({
  properties: {
    title: { type: String, value: '' },
    subtitle: { type: String, value: '' },
    showBack: { type: Boolean, value: false },
    showAdd: { type: Boolean, value: false }
  },
  methods: {
    onBack() { wx.navigateBack({ delta: 1 }) },
    onAdd() { this.triggerEvent('add') }
  }
})
