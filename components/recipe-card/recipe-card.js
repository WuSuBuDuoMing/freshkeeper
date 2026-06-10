Component({
  properties: {
    recipe: { type: Object, value: {} },
    showMissing: { type: Boolean, value: true }
  },
  methods: {
    onTap() { this.triggerEvent('tap', { recipe: this.data.recipe }) },
    onAddToShopping() { this.triggerEvent('addtoshopping', { recipe: this.data.recipe }) }
  }
})
