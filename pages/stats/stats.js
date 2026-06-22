/**
 * @file Statistics & Analytics Page
 * @description Displays comprehensive fridge analytics including category distribution,
 *   expiry trends, inventory flow, waste analysis, storage area breakdown, category
 *   health scores, purchasing patterns, and savings tips with data visualization.
 * @module pages/stats
 * @version 2.12.0
 */
const { ThemeBehavior } = require('../../utils/theme-behavior')
const statsService = require('../../services/stats-service')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    /** @type {Array<{name: string, value: number, color: string}>} 食材分类占比 */
    categoryDistribution: [],
    /** @type {Array} 过期趋势数据 */
    expiryTrend: [],
    /** @type {object} 浪费统计 */
    wasteStats: {},
    /** @type {Array} 最常购买食材 */
    mostPurchased: [],
    /** @type {Array} 省钱建议 */
    savingTips: [],
    /** @type {object} 月度报告 */
    monthlyReport: {},
    /** @type {Array} 库存流动趋势（7天） */
    inventoryTrend: [],
    /** @type {Array} 存放区域分布 */
    storageAreaDistribution: [],
    /** @type {Array} 浪费趋势（7天） */
    wasteTrend: [],
    /** @type {Array} 分类健康度评分 */
    categoryHealthScore: [],
    /** @type {boolean} 加载状态 */
    loading: true
  },

  onLoad() { this._loadData() },

  /**
   * 加载所有统计数据
   * @private
   */
  _loadData() {
    statsService.initStatsData()
    const categoryDistribution = statsService.getCategoryDistribution()
    const expiryTrend = statsService.getExpiryTrend()
    const wasteStats = statsService.getWasteStats()
    const mostPurchased = statsService.getMostPurchased()
    const savingTips = statsService.getSavingTips()
    const monthlyReport = statsService.getMonthlyReport()
    const inventoryTrend = statsService.getInventoryTrend()
    const storageAreaDistribution = statsService.getStorageAreaDistribution()
    const wasteTrend = statsService.getWasteTrend()
    const categoryHealthScore = statsService.getCategoryHealthScore()

    this.setData({
      categoryDistribution, expiryTrend, wasteStats,
      mostPurchased, savingTips, monthlyReport,
      inventoryTrend, storageAreaDistribution, wasteTrend,
      categoryHealthScore,
      loading: false
    })
  }
}))
