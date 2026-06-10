Component({
  properties: {
    type: { type: String, value: 'list' }, // list | card | stats | avatar
    lines: { type: Number, value: 3 },
    listCount: { type: Number, value: 5 },
    showTitle: { type: Boolean, value: true },
    titleWidth: { type: Number, value: 60 },
    circleSize: { type: Number, value: 80 }
  }
})
