/**
 * @file Food Service - Core CRUD and query operations for fridge food items.
 * @description Manages all food items in the fridge including creation, updates,
 *   deletion, expiry tracking, search, batch operations, and statistics. Uses mock
 *   data with local storage persistence. This is the primary data service for the
 *   application.
 * @module services/food-service
 * @version 2.15.0
 */
const storage = require('../utils/storage-utils')
const { generateId, getDateOffset } = require('../utils/mock-utils')
const { daysUntilExpiry, isExpired, isExpiringSoon } = require('../utils/date-utils')

const STORAGE_KEY = 'foods'

/**
 * 初始化 mock 数据（仅首次加载时写入）
 */
function initMockData() {
  const existing = storage.get(STORAGE_KEY)
  if (existing && existing.length > 0) return
  storage.set(STORAGE_KEY, generateMockFoods())
}

/**
 * 获取所有食材
 * @returns {Array}
 */
function getAllFoods() {
  return storage.get(STORAGE_KEY, [])
}

/**
 * 根据 ID 获取食材
 * @param {string} id
 * @returns {object|null}
 */
function getFoodById(id) {
  const foods = getAllFoods()
  return foods.find(f => f.id === id) || null
}

/**
 * 添加食材
 * @param {object} food
 * @returns {object} 添加后的食材
 */
function addFood(food) {
  const foods = getAllFoods()
  const now = new Date().toISOString()
  const newFood = {
    id: generateId('food'),
    name: food.name || '',
    category: food.category || '其他',
    quantity: food.quantity || 1,
    unit: food.unit || '个',
    storageArea: food.storageArea || '冷藏区',
    purchaseDate: food.purchaseDate || getDateOffset(0),
    expiryDate: food.expiryDate || getDateOffset(7),
    status: 'normal',
    imageUrl: food.imageUrl || '',
    notes: food.notes || '',
    createdAt: now,
    updatedAt: now
  }
  foods.unshift(newFood)
  storage.set(STORAGE_KEY, foods)
  return newFood
}

/**
 * 更新食材
 * @param {string} id
 * @param {object} updates
 * @returns {object|null}
 */
function updateFood(id, updates) {
  const foods = getAllFoods()
  const index = foods.findIndex(f => f.id === id)
  if (index === -1) return null
  foods[index] = {
    ...foods[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  storage.set(STORAGE_KEY, foods)
  return foods[index]
}

/**
 * 删除食材
 * @param {string} id
 * @returns {boolean}
 */
function deleteFood(id) {
  const foods = getAllFoods()
  const newFoods = foods.filter(f => f.id !== id)
  if (newFoods.length === foods.length) return false
  storage.set(STORAGE_KEY, newFoods)
  return true
}

/**
 * 批量删除食材
 * @param {Array<string>} ids
 * @returns {number} 删除数量
 */
function deleteFoods(ids) {
  const foods = getAllFoods()
  const newFoods = foods.filter(f => !ids.includes(f.id))
  const deletedCount = foods.length - newFoods.length
  storage.set(STORAGE_KEY, newFoods)
  return deletedCount
}

/**
 * 标记食材为已用完
 * @param {string} id
 * @returns {object|null}
 */
function markAsUsed(id) {
  return updateFood(id, { status: 'used', quantity: 0 })
}

/**
 * 获取即将过期的食材
 * @param {number} days 内（默认 3 天）
 * @returns {Array} 指定天数内过期的活跃食材列表
 */
function getExpiringFoods(days = 3) {
  const foods = getAllFoods()
  return foods.filter(f => {
    if (f.status === 'used') return false
    const remaining = daysUntilExpiry(f.expiryDate)
    return remaining >= 0 && remaining <= days
  })
}

/**
 * 获取已过期的食材
 * @returns {Array} 已过期的活跃食材列表
 */
function getExpiredFoods() {
  const foods = getAllFoods()
  return foods.filter(f => f.status !== 'used' && isExpired(f.expiryDate))
}

/**
 * 获取今天过期的食材
 * @returns {Array}
 */
function getTodayExpiringFoods() {
  const foods = getAllFoods()
  const today = getDateOffset(0)
  return foods.filter(f => f.status !== 'used' && f.expiryDate === today)
}

/**
 * 获取 7 天内过期的食材
 * @returns {Array}
 */
function getWeekExpiringFoods() {
  return getExpiringFoods(7)
}

/**
 * 搜索食材
 * @param {string} keyword
 * @returns {Array}
 */
function searchFoods(keyword) {
  if (!keyword || !keyword.trim()) return getAllFoods()
  const kw = keyword.trim().toLowerCase()
  return getAllFoods().filter(f =>
    f.name.toLowerCase().includes(kw) ||
    f.category.toLowerCase().includes(kw) ||
    (f.notes && f.notes.toLowerCase().includes(kw))
  )
}

/**
 * 获取分类统计
 * @returns {Array<{category: string, count: number}>}
 */
function getCategoryStats() {
  const foods = getAllFoods().filter(f => f.status !== 'used')
  const stats = {}
  foods.forEach(f => {
    if (!stats[f.category]) stats[f.category] = 0
    stats[f.category]++
  })
  return Object.entries(stats).map(([category, count]) => ({ category, count }))
}

/**
 * 获取统计概览
 * @returns {object} 包含 total, expiredCount, expiringCount, freshCount, usedCount,
 *   wastedValue, categoryStats 等字段
 */
function getOverview() {
  const foods = getAllFoods()
  const active = foods.filter(f => f.status !== 'used')

  let expiredCount = 0
  let expiringCount = 0
  let freshCount = 0

  active.forEach(f => {
    const remaining = daysUntilExpiry(f.expiryDate)
    if (remaining < 0) expiredCount++
    else if (remaining <= 3) expiringCount++
    else freshCount++
  })

  // 本周浪费估算：已过期食材 × 平均单价 mock
  const wastedValue = expiredCount * 15 // mock 平均 15 元/个

  return {
    total: active.length,
    expiredCount,
    expiringCount,
    freshCount,
    usedCount: foods.filter(f => f.status === 'used').length,
    wastedValue,
    categoryStats: getCategoryStats()
  }
}

/**
 * 获取需要今日处理的食材（今日过期 + 已过期未处理）
 * @returns {Array} 需要当天处理的活跃食材列表
 */
function getTodayTasks() {
  const foods = getAllFoods().filter(f => f.status !== 'used')
  return foods.filter(f => {
    const remaining = daysUntilExpiry(f.expiryDate)
    return remaining <= 1 // 今日及之前过期的
  })
}

/**
 * 获取分级过期预警（智能分级 + 处理建议）
 * @returns {{ today: Array, tomorrow: Array, threeDay: Array, sevenDay: Array, expired: Array }}
 *   每个食材对象额外包含 daysLeft 和 suggestion 字段
 */
function getTieredExpiryAlerts() {
  const foods = getAllFoods().filter(f => f.status !== 'used')

  const enriched = foods.map(f => ({
    ...f,
    daysLeft: daysUntilExpiry(f.expiryDate),
    suggestion: getSuggestion(daysUntilExpiry(f.expiryDate), f.category)
  }))

  return {
    today: enriched.filter(f => f.daysLeft === 0),
    tomorrow: enriched.filter(f => f.daysLeft === 1),
    threeDay: enriched.filter(f => f.daysLeft > 1 && f.daysLeft <= 3),
    sevenDay: enriched.filter(f => f.daysLeft > 3 && f.daysLeft <= 7),
    expired: enriched.filter(f => f.daysLeft < 0)
  }
}

/**
 * 根据剩余天数和食材分类生成处理建议
 * @param {number} daysLeft 剩余天数（负数表示已过期）
 * @param {string} category 食材分类
 * @returns {string} 处理建议文本
 */
function getSuggestion(daysLeft, category) {
  if (daysLeft < -3) return '已过期超过3天，建议立即丢弃'
  if (daysLeft < 0) return '已过期，建议尽快处理或丢弃'
  if (daysLeft === 0) return '今天到期，建议立即使用'
  if (daysLeft === 1) return '明天到期，建议优先安排使用'
  if (daysLeft <= 3) {
    const quickCategories = ['蔬菜', '水果', '海鲜']
    return quickCategories.includes(category)
      ? '保质期短，建议尽快使用'
      : '3天内到期，可安排近期使用'
  }
  return '新鲜状态，正常管理即可'
}

/**
 * 批量标记食材为已用完
 * @param {Array<string>} ids 食材 ID 列表
 * @returns {{ success: number, failed: number }} 操作结果
 */
function batchMarkAsUsed(ids) {
  const foods = getAllFoods()
  let success = 0
  let failed = 0

  const updated = foods.map(f => {
    if (ids.includes(f.id)) {
      success++
      return { ...f, status: 'used', quantity: 0, updatedAt: new Date().toISOString() }
    }
    failed++
    return f
  })

  if (success > 0) {
    storage.set(STORAGE_KEY, updated)
  }

  return { success, failed }
}

/**
 * 批量删除过期食材
 * @returns {number} 删除数量
 */
function batchDeleteExpired() {
  const foods = getAllFoods()

  const remaining = foods.filter(f => {
    if (f.status === 'used') return true
    return !isExpired(f.expiryDate)
  })

  const deletedCount = foods.length - remaining.length
  if (deletedCount > 0) {
    storage.set(STORAGE_KEY, remaining)
  }

  return deletedCount
}

/**
 * 获取即将过期食材的统计摘要
 * @returns {object} 各等级数量（todayCount, soonCount, weekCount, expiredCount）、
 *   总需关注数（totalNeedAttention）和浪费预估（wastedValueEstimate）
 */
function getExpirySummary() {
  const foods = getAllFoods().filter(f => f.status !== 'used')

  let todayCount = 0
  let soonCount = 0
  let weekCount = 0
  let expiredCount = 0
  let wastedValueEstimate = 0

  foods.forEach(f => {
    const remaining = daysUntilExpiry(f.expiryDate)

    if (remaining < 0) {
      expiredCount++
      wastedValueEstimate += 15 // mock 平均浪费价值
    } else if (remaining === 0) todayCount++
    else if (remaining <= 3) soonCount++
    else if (remaining <= 7) weekCount++
  })

  return {
    todayCount,
    soonCount,
    weekCount,
    expiredCount,
    totalNeedAttention: todayCount + soonCount + expiredCount,
    wastedValueEstimate
  }
}

/**
 * 生成 50+ 条 mock 食材数据
 */
function generateMockFoods() {
  const mockFoods = [
    // 蔬菜
    { name: '番茄', category: '蔬菜', quantity: 4, unit: '个', storageArea: '冷藏区', expiryOffset: -1, notes: '做番茄炒蛋' },
    { name: '黄瓜', category: '蔬菜', quantity: 3, unit: '根', storageArea: '保鲜区', expiryOffset: 2, notes: '凉拌用' },
    { name: '西兰花', category: '蔬菜', quantity: 1, unit: '颗', storageArea: '保鲜区', expiryOffset: 5, notes: '低卡蔬菜' },
    { name: '胡萝卜', category: '蔬菜', quantity: 5, unit: '根', storageArea: '保鲜区', expiryOffset: 10, notes: '炒菜常用' },
    { name: '白菜', category: '蔬菜', quantity: 1, unit: '颗', storageArea: '保鲜区', expiryOffset: 4, notes: '炖汤用' },
    { name: '菠菜', category: '蔬菜', quantity: 2, unit: '把', storageArea: '保鲜区', expiryOffset: 1, notes: '补铁好食材' },
    { name: '土豆', category: '蔬菜', quantity: 4, unit: '个', storageArea: '常温区', expiryOffset: 14, notes: '炒土豆丝' },
    { name: '青椒', category: '蔬菜', quantity: 3, unit: '个', storageArea: '保鲜区', expiryOffset: 6, notes: '配菜用' },
    { name: '茄子', category: '蔬菜', quantity: 2, unit: '根', storageArea: '保鲜区', expiryOffset: 3, notes: '做红烧茄子' },
    { name: '洋葱', category: '蔬菜', quantity: 2, unit: '个', storageArea: '常温区', expiryOffset: 20, notes: '提味用' },
    { name: '蘑菇', category: '蔬菜', quantity: 1, unit: '盒', storageArea: '冷藏区', expiryOffset: 2, notes: '煮汤用' },
    { name: '大蒜', category: '蔬菜', quantity: 1, unit: '头', storageArea: '常温区', expiryOffset: 30, notes: '炒菜必备' },

    // 水果
    { name: '苹果', category: '水果', quantity: 4, unit: '个', storageArea: '冷藏区', expiryOffset: 7, notes: '当零食吃' },
    { name: '香蕉', category: '水果', quantity: 1, unit: '把', storageArea: '常温区', expiryOffset: -1, notes: '早餐搭配' },
    { name: '草莓', category: '水果', quantity: 1, unit: '盒', storageArea: '冷藏区', expiryOffset: -2, notes: '周末买的' },
    { name: '橙子', category: '水果', quantity: 3, unit: '个', storageArea: '冷藏区', expiryOffset: 8, notes: '补充维C' },
    { name: '葡萄', category: '水果', quantity: 1, unit: '串', storageArea: '冷藏区', expiryOffset: 3, notes: '孩子爱吃' },
    { name: '芒果', category: '水果', quantity: 2, unit: '个', storageArea: '常温区', expiryOffset: 2, notes: '做奶昔' },
    { name: '蓝莓', category: '水果', quantity: 1, unit: '盒', storageArea: '冷藏区', expiryOffset: 5, notes: '抗氧化' },
    { name: '猕猴桃', category: '水果', quantity: 3, unit: '个', storageArea: '冷藏区', expiryOffset: 6, notes: '维C丰富' },
    { name: '西瓜', category: '水果', quantity: 1, unit: '块', storageArea: '冷藏区', expiryOffset: 1, notes: '解暑神器' },

    // 肉类
    { name: '鸡胸肉', category: '肉类', quantity: 500, unit: '克', storageArea: '冷冻区', expiryOffset: 15, notes: '健身餐用' },
    { name: '猪里脊', category: '肉类', quantity: 300, unit: '克', storageArea: '冷冻区', expiryOffset: 10, notes: '做糖醋排骨' },
    { name: '牛肉', category: '肉类', quantity: 400, unit: '克', storageArea: '冷冻区', expiryOffset: 12, notes: '炒牛肉丝' },
    { name: '五花肉', category: '肉类', quantity: 500, unit: '克', storageArea: '冷冻区', expiryOffset: 8, notes: '做红烧肉' },
    { name: '排骨', category: '肉类', quantity: 600, unit: '克', storageArea: '冷冻区', expiryOffset: 5, notes: '炖汤用' },
    { name: '鸡腿', category: '肉类', quantity: 4, unit: '个', storageArea: '冷冻区', expiryOffset: -3, notes: '可乐鸡翅' },
    { name: '羊肉卷', category: '肉类', quantity: 300, unit: '克', storageArea: '冷冻区', expiryOffset: 20, notes: '火锅用' },

    // 海鲜
    { name: '三文鱼', category: '海鲜', quantity: 200, unit: '克', storageArea: '冷冻区', expiryOffset: -1, notes: '刺身用' },
    { name: '虾', category: '海鲜', quantity: 300, unit: '克', storageArea: '冷冻区', expiryOffset: 6, notes: '白灼虾' },
    { name: '鱿鱼', category: '海鲜', quantity: 200, unit: '克', storageArea: '冷冻区', expiryOffset: 4, notes: '炒鱿鱼' },
    { name: '带鱼', category: '海鲜', quantity: 1, unit: '条', storageArea: '冷冻区', expiryOffset: 9, notes: '红烧带鱼' },

    // 蛋奶
    { name: '鸡蛋', category: '蛋奶', quantity: 12, unit: '个', storageArea: '冷藏区', expiryOffset: 10, notes: '早餐常用' },
    { name: '牛奶', category: '蛋奶', quantity: 2, unit: '瓶', storageArea: '冷藏区', expiryOffset: -5, notes: '纯牛奶' },
    { name: '酸奶', category: '蛋奶', quantity: 4, unit: '杯', storageArea: '冷藏区', expiryOffset: 1, notes: '原味酸奶' },
    { name: '奶酪片', category: '蛋奶', quantity: 6, unit: '片', storageArea: '冷藏区', expiryOffset: 15, notes: '三明治用' },
    { name: '黄油', category: '蛋奶', quantity: 1, unit: '块', storageArea: '冷藏区', expiryOffset: 25, notes: '烘焙用' },

    // 饮料
    { name: '橙汁', category: '饮料', quantity: 1, unit: '瓶', storageArea: '冷藏区', expiryOffset: 3, notes: '鲜榨' },
    { name: '可乐', category: '饮料', quantity: 6, unit: '罐', storageArea: '常温区', expiryOffset: 90, notes: '囤货' },
    { name: '矿泉水', category: '饮料', quantity: 12, unit: '瓶', storageArea: '常温区', expiryOffset: 180, notes: '日常饮用' },
    { name: '咖啡', category: '饮料', quantity: 1, unit: '盒', storageArea: '常温区', expiryOffset: 60, notes: '提神必备' },
    { name: '啤酒', category: '饮料', quantity: 4, unit: '罐', storageArea: '常温区', expiryOffset: 45, notes: '聚会用' },

    // 调料
    { name: '酱油', category: '调料', quantity: 1, unit: '瓶', storageArea: '常温区', expiryOffset: 180, notes: '生抽' },
    { name: '醋', category: '调料', quantity: 1, unit: '瓶', storageArea: '常温区', expiryOffset: 200, notes: '陈醋' },
    { name: '盐', category: '调料', quantity: 1, unit: '袋', storageArea: '常温区', expiryOffset: 365, notes: '加碘盐' },
    { name: '食用油', category: '调料', quantity: 1, unit: '瓶', storageArea: '常温区', expiryOffset: 120, notes: '花生油' },

    // 主食
    { name: '面条', category: '主食', quantity: 1, unit: '袋', storageArea: '常温区', expiryOffset: 30, notes: '挂面' },
    { name: '大米', category: '主食', quantity: 1, unit: '袋', storageArea: '常温区', expiryOffset: 90, notes: '东北大米' },
    { name: '面包', category: '主食', quantity: 1, unit: '袋', storageArea: '常温区', expiryOffset: -1, notes: '全麦面包' },
    { name: '馒头', category: '主食', quantity: 4, unit: '个', storageArea: '冷藏区', expiryOffset: 0, notes: '速冻馒头' },
    { name: '饺子皮', category: '主食', quantity: 1, unit: '袋', storageArea: '冷冻区', expiryOffset: 25, notes: '包饺子用' },

    // 额外凑数
    { name: '豆腐', category: '蔬菜', quantity: 1, unit: '块', storageArea: '冷藏区', expiryOffset: 1, notes: '豆腐脑' },
    { name: '腐竹', category: '其他', quantity: 1, unit: '袋', storageArea: '常温区', expiryOffset: 60, notes: '凉拌用' },
    { name: '粉丝', category: '其他', quantity: 1, unit: '袋', storageArea: '常温区', expiryOffset: 120, notes: '做酸辣粉' },
    { name: '海带', category: '其他', quantity: 1, unit: '袋', storageArea: '常温区', expiryOffset: 90, notes: '海带汤' },
    { name: '姜', category: '调料', quantity: 1, unit: '块', storageArea: '常温区', expiryOffset: 14, notes: '去腥用' }
  ]

  return mockFoods.map((f, index) => {
    const now = new Date()
    const daysAgo = Math.floor(Math.random() * 10) + 1
    const purchaseDate = new Date(now)
    purchaseDate.setDate(purchaseDate.getDate() - daysAgo)

    const expiryDate = new Date(now)
    expiryDate.setDate(expiryDate.getDate() + (f.expiryOffset || 0))

    const year = (d) => d.getFullYear()
    const month = (d) => String(d.getMonth() + 1).padStart(2, '0')
    const day = (d) => String(d.getDate()).padStart(2, '0')
    const fmt = (d) => `${year(d)}-${month(d)}-${day(d)}`

    return {
      id: `food_${String(index + 1).padStart(3, '0')}`,
      name: f.name,
      category: f.category,
      quantity: f.quantity,
      unit: f.unit,
      storageArea: f.storageArea,
      purchaseDate: fmt(purchaseDate),
      expiryDate: fmt(expiryDate),
      status: f.expiryOffset < 0 ? 'expired' : 'normal',
      imageUrl: '',
      notes: f.notes || '',
      createdAt: `${fmt(purchaseDate)}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:00:00Z`,
      updatedAt: `${fmt(purchaseDate)}T${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:00:00Z`
    }
  })
}

module.exports = {
  initMockData,
  getAllFoods,
  getFoodById,
  addFood,
  updateFood,
  deleteFood,
  deleteFoods,
  markAsUsed,
  getExpiringFoods,
  getExpiredFoods,
  getTodayExpiringFoods,
  getWeekExpiringFoods,
  searchFoods,
  getCategoryStats,
  getOverview,
  getTodayTasks,
  getTieredExpiryAlerts,
  getSuggestion,
  batchMarkAsUsed,
  batchDeleteExpired,
  getExpirySummary
}
