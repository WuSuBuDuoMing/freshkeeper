/**
 * 统计分析页
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const statsService = require('../../services/stats-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    categoryDistribution: [],
    expiryTrend: [],
    wasteStats: {},
    mostPurchased: [],
    savingTips: [],
    monthlyReport: {},
    loading: true
  },

  onLoad() { this._loadData() },

  _loadData() {
    statsService.initStatsData()
    const categoryDistribution = statsService.getCategoryDistribution()
    const expiryTrend = statsService.getExpiryTrend()
    const wasteStats = statsService.getWasteStats()
    const mostPurchased = statsService.getMostPurchased()
    const savingTips = statsService.getSavingTips()
    const monthlyReport = statsService.getMonthlyReport()

    this.setData({
      categoryDistribution, expiryTrend, wasteStats,
      mostPurchased, savingTips, monthlyReport,
      loading: false
    })
  }
}))
