/**
 * @file Statistics & Analytics Service
 * @description Provides data analysis, category distribution, expiry trends,
 *   waste tracking, savings tips, and monthly reports for fridge management
 *   insights. Uses mock data for demonstration purposes.
 * @module services/stats-service
 * @version 2.9.0
 */
const storage = require('../utils/storage-utils')
const { randomInt, getDateOffset } = require('../utils/mock-utils')

const STORAGE_KEY = 'stats'

/**
 * 初始化统计 mock 数据
 */
function initStatsData() {
  const existing = storage.get(STORAGE_KEY)
  if (existing && existing.length > 0) return
  storage.set(STORAGE_KEY, generateMockStats())
}

/**
 * 获取分类占比数据
 * @returns {Array<{name: string, value: number, color: string}>}
 */
function getCategoryDistribution() {
  return [
    { name: '蔬菜', value: 12, color: '#4CAF50' },
    { name: '水果', value: 9, color: '#FF9800' },
    { name: '肉类', value: 7, color: '#F44336' },
    { name: '海鲜', value: 4, color: '#2196F3' },
    { name: '蛋奶', value: 5, color: '#FFC107' },
    { name: '饮料', value: 5, color: '#9C27B0' },
    { name: '调料', value: 4, color: '#795548' },
    { name: '主食', value: 5, color: '#607D8B' },
    { name: '其他', value: 3, color: '#9E9E9E' }
  ]
}

/**
 * 获取过期趋势数据（最近14天）
 * @returns {Array<{date: string, label: string, expiring: number, expired: number}>}
 */
function getExpiryTrend() {
  const result = []
  for (let i = 13; i >= 0; i--) {
    const date = getDateOffset(-i)
    const d = new Date(date)
    result.push({
      date,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      expiring: randomInt(1, 5),
      expired: randomInt(0, 3)
    })
  }
  return result
}

/**
 * 获取本月浪费统计
 * @returns {object}
 */
function getWasteStats() {
  return {
    totalWasted: 8,
    wastedValue: 120,
    topWasted: [
      { name: '香蕉', count: 3 },
      { name: '菠菜', count: 2 },
      { name: '牛奶', count: 2 },
      { name: '草莓', count: 1 }
    ],
    savedMoney: 85 // 节省的钱（使用即将过期食材做菜）
  }
}

/**
 * 获取最常购买食材
 * @returns {Array<{name: string, count: number, totalCost: number}>}
 */
function getMostPurchased() {
  return [
    { name: '鸡蛋', count: 8, totalCost: 48 },
    { name: '牛奶', count: 6, totalCost: 96 },
    { name: '番茄', count: 5, totalCost: 15 },
    { name: '鸡胸肉', count: 5, totalCost: 75 },
    { name: '面包', count: 4, totalCost: 48 },
    { name: '苹果', count: 4, totalCost: 32 },
    { name: '酸奶', count: 4, totalCost: 48 },
    { name: '西兰花', count: 3, totalCost: 15 }
  ]
}

/**
 * 获取省钱建议
 * @returns {Array<{title: string, description: string, saving: number, icon: string}>}
 */
function getSavingTips() {
  return [
    {
      title: '优先使用临期食材',
      description: '本周通过优先使用即将过期的食材做菜，避免了约 85 元的浪费。',
      saving: 85,
      icon: '💡'
    },
    {
      title: '批量采购更划算',
      description: '鸡蛋、牛奶等常用食材建议每周固定采购，可节省约 15% 的费用。',
      saving: 30,
      icon: '🛒'
    },
    {
      title: '合理规划一周菜单',
      description: '使用一周菜单功能提前规划，避免冲动购买和食材浪费。',
      saving: 50,
      icon: '📋'
    },
    {
      title: '关注食材保质期',
      description: '及时处理即将过期食材，按"先进先出"原则使用冰箱食材。',
      saving: 20,
      icon: '⏰'
    }
  ]
}

/**
 * 获取月度报告
 * @returns {object}
 */
function getMonthlyReport() {
  return {
    totalFoods: 50,
    totalWasted: 8,
    wasteRate: '16%',
    totalSaved: 185,
    mealsCooked: 21,
    topCategory: '蔬菜',
    avgDailyCalories: 1850
  }
}

/**
 * 生成 14 天统计 mock 数据
 */
function generateMockStats() {
  const stats = []
  for (let i = 13; i >= 0; i--) {
    const date = getDateOffset(-i)
    stats.push({
      date,
      totalFoods: randomInt(35, 55),
      expiringFoods: randomInt(2, 8),
      expiredFoods: randomInt(0, 4),
      mealsCooked: randomInt(1, 3),
      wastedValue: randomInt(0, 30),
      savedValue: randomInt(5, 40)
    })
  }
  return stats
}

module.exports = {
  initStatsData,
  getCategoryDistribution,
  getExpiryTrend,
  getWasteStats,
  getMostPurchased,
  getSavingTips,
  getMonthlyReport
}
