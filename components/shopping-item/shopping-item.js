Component({
  properties: {
    item: { type: Object, value: {} }
  },
  methods: {
    onToggle() { this.triggerEvent('toggle', { item: this.data.item }) },
    onDelete() { this.triggerEvent('delete', { item: this.data.item }) }
  }
})
