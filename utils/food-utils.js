/**
 * @file Food Utility Functions
 * @description Comprehensive food management helpers including category/area/status
 *   enumerations, food status calculation, grouping, searching, sorting, and
 *   emoji/icon mappings for the FreshKeeper application.
 * @module utils/food-utils
 * @version 2.15.0
 */

/**
 * 食材分类枚举
 */
const CATEGORIES = [
  { key: 'all', name: '全部', icon: '📋' },
  { key: '蔬菜', name: '蔬菜', icon: '🥬' },
  { key: '水果', name: '水果', icon: '🍎' },
  { key: '肉类', name: '肉类', icon: '🥩' },
  { key: '海鲜', name: '海鲜', icon: '🦐' },
  { key: '蛋奶', name: '蛋奶', icon: '🥚' },
  { key: '饮料', name: '饮料', icon: '🥤' },
  { key: '调料', name: '调料', icon: '🧂' },
  { key: '主食', name: '主食', icon: '🍚' },
  { key: '其他', name: '其他', icon: '📦' }
]

/**
 * 存放位置枚举
 */
const STORAGE_AREAS = [
  { key: '冷藏区', icon: '❄️', color: '#2196F3' },
  { key: '冷冻区', icon: '🧊', color: '#00BCD4' },
  { key: '保鲜区', icon: '🌱', color: '#4CAF50' },
  { key: '常温区', icon: '☀️', color: '#FF9800' }
]

/**
 * 食材状态枚举
 */
const STATUS_LIST = [
  { key: 'all', name: '全部', color: '#999' },
  { key: 'normal', name: '正常', color: '#4CAF50' },
  { key: 'expiring_soon', name: '即将过期', color: '#FF9800' },
  { key: 'expired', name: '已过期', color: '#F44336' },
  { key: 'used', name: '已用完', color: '#999' }
]

/**
 * 单位枚举
 */
const UNITS = ['个', '斤', '克', '千克', '瓶', '袋', '盒', '包', '罐', '根', '条', '只', '把', '块', '片', '升', '毫升']

/**
 * 获取分类信息
 * @param {string} categoryKey
 * @returns {object}
 */
function getCategoryInfo(categoryKey) {
  return CATEGORIES.find(c => c.key === categoryKey) || { key: categoryKey, name: categoryKey, icon: '📦' }
}

/**
 * 获取分类图标
 * @param {string} categoryKey
 * @returns {string}
 */
function getCategoryIcon(categoryKey) {
  return getCategoryInfo(categoryKey).icon
}

/**
 * 获取存放位置信息
 * @param {string} areaKey
 * @returns {object}
 */
function getStorageAreaInfo(areaKey) {
  return STORAGE_AREAS.find(a => a.key === areaKey) || { key: areaKey, icon: '📦', color: '#999' }
}

/**
 * 计算食材状态（基于过期日期）
 * @param {object} food 食材对象
 * @returns {string} normal | expiring_soon | expired | used
 */
function calculateFoodStatus(food) {
  if (food.status === 'used') return 'used'
  if (food.quantity <= 0) return 'used'

  const { daysUntilExpiry } = require('./date-utils')
  const days = daysUntilExpiry(food.expiryDate)

  if (days < 0) return 'expired'
  if (days <= 3) return 'expiring_soon'
  return 'normal'
}

/**
 * 获取状态中文名
 * @param {string} status
 * @returns {string}
 */
function getStatusText(status) {
  const map = {
    normal: '正常',
    expiring_soon: '即将过期',
    expired: '已过期',
    used: '已用完'
  }
  return map[status] || '未知'
}

/**
 * 获取状态颜色
 * @param {string} status
 * @returns {string}
 */
function getStatusColor(status) {
  const map = {
    normal: '#4CAF50',
    expiring_soon: '#FF9800',
    expired: '#F44336',
    used: '#999999'
  }
  return map[status] || '#999'
}

/**
 * 获取状态 tag class
 * @param {string} status
 * @returns {string}
 */
function getStatusTagClass(status) {
  const map = {
    normal: 'tag-normal',
    expiring_soon: 'tag-warning',
    expired: 'tag-danger',
    used: 'tag-info'
  }
  return map[status] || 'tag-info'
}

/**
 * 按分类分组
 * @param {Array} foods
 * @returns {Object} { '蔬菜': [...], '水果': [...] }
 */
function groupByCategory(foods) {
  const groups = {}
  foods.forEach(food => {
    const cat = food.category || '其他'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(food)
  })
  return groups
}

/**
 * 按状态分组
 * @param {Array} foods
 * @returns {Object}
 */
function groupByStatus(foods) {
  const groups = { normal: [], expiring_soon: [], expired: [], used: [] }
  foods.forEach(food => {
    const status = food.status || 'normal'
    if (groups[status]) groups[status].push(food)
    else groups.normal.push(food)
  })
  return groups
}

/**
 * 搜索食材
 * @param {Array} foods
 * @param {string} keyword
 * @returns {Array}
 */
function searchFoods(foods, keyword) {
  if (!keyword || !keyword.trim()) return foods
  const kw = keyword.trim().toLowerCase()
  return foods.filter(f =>
    f.name.toLowerCase().includes(kw) ||
    (f.notes && f.notes.toLowerCase().includes(kw)) ||
    f.category.toLowerCase().includes(kw)
  )
}

/**
 * 排序食材
 * @param {Array} foods
 * @param {string} sortBy name|expiry|category|created
 * @returns {Array}
 */
function sortFoods(foods, sortBy = 'expiry') {
  const sorted = [...foods]
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    case 'expiry':
      return sorted.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    case 'category':
      return sorted.sort((a, b) => a.category.localeCompare(b.category, 'zh-CN'))
    case 'created':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default:
      return sorted
  }
}

/**
 * 生成食材名称缩写（用于头像显示）
 * @param {string} name
 * @returns {string}
 */
function getFoodAvatar(name) {
  if (!name) return '?'
  return name.charAt(0)
}

/**
 * 获取食材对应的 emoji（基于分类）
 * @param {string} name 食材名
 * @param {string} category 分类
 * @returns {string} emoji
 */
function getFoodEmoji(name, category) {
  const emojiMap = {
    '鸡蛋': '🥚', '番茄': '🍅', '西红柿': '🍅', '土豆': '🥔', '胡萝卜': '🥕',
    '苹果': '🍎', '香蕉': '🍌', '橙子': '🍊', '葡萄': '🍇', '草莓': '🍓',
    '牛肉': '🥩', '猪肉': '🥩', '鸡肉': '🍗', '鸡胸肉': '🍗', '鸡腿': '🍗',
    '三文鱼': '🐟', '虾': '🦐', '鱼': '🐟', '螃蟹': '🦀',
    '牛奶': '🥛', '酸奶': '🧃', '奶酪': '🧀', '黄油': '🧈',
    '米饭': '🍚', '面条': '🍜', '面包': '🍞', '馒头': '🍞',
    '可乐': '🥤', '果汁': '🧃', '啤酒': '🍺', '矿泉水': '💧',
    '盐': '🧂', '酱油': '🫙', '醋': '🫙', '糖': '🍬',
    '白菜': '🥬', '菠菜': '🥬', '生菜': '🥬', '西兰花': '🥦',
    '豆腐': '🧈', '豆腐干': '🧈',
    '豆腐': '🧈', '蘑菇': '🍄', '洋葱': '🧅', '大蒜': '🧄',
    '辣椒': '🌶️', '青椒': '🫑', '黄瓜': '🥒', '茄子': '🍆',
    '西瓜': '🍉', '桃子': '🍑', '梨': '🍐', '芒果': '🥭',
    '柠檬': '🍋', '樱桃': '🍒', '蓝莓': '🫐', '猕猴桃': '🥝'
  }

  if (emojiMap[name]) return emojiMap[name]

  const categoryEmoji = {
    '蔬菜': '🥬', '水果': '🍎', '肉类': '🥩', '海鲜': '🦐',
    '蛋奶': '🥚', '饮料': '🥤', '调料': '🧂', '主食': '🍚', '其他': '📦'
  }

  return categoryEmoji[category] || '📦'
}

module.exports = {
  CATEGORIES,
  STORAGE_AREAS,
  STATUS_LIST,
  UNITS,
  getCategoryInfo,
  getCategoryIcon,
  getStorageAreaInfo,
  calculateFoodStatus,
  getStatusText,
  getStatusColor,
  getStatusTagClass,
  groupByCategory,
  groupByStatus,
  searchFoods,
  sortFoods,
  getFoodAvatar,
  getFoodEmoji
}
