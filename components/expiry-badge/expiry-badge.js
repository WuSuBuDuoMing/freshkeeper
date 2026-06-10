const { daysUntilExpiry } = require('../../utils/date-utils')

Component({
  properties: {
    expiryDate: { type: String, value: '' },
    status: { type: String, value: 'normal' }
  },
  data: {
    days: 0,
    text: '',
    colorClass: 'badge-normal'
  },
  lifetimes: { attached() { this._update() } },
  observers: { 'expiryDate, status'() { this._update() } },
  methods: {
    _update() {
      const { expiryDate, status } = this.data
      if (status === 'used') {
        this.setData({ days: -999, text: '已用完', colorClass: 'badge-used' })
        return
      }
      const days = daysUntilExpiry(expiryDate)
      let text = '', colorClass = 'badge-normal'
      if (days < 0) { text = `过期${Math.abs(days)}天`; colorClass = 'badge-expired' }
      else if (days === 0) { text = '今天过期'; colorClass = 'badge-expiring' }
      else if (days <= 3) { text = `${days}天后过期`; colorClass = 'badge-expiring' }
      else { text = `${days}天后过期`; colorClass = 'badge-normal' }
      this.setData({ days, text, colorClass })
    }
  }
})
