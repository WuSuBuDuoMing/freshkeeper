/**
 * 采购清单服务
 * 管理采购清单的增删改查
 */
const storage = require('../utils/storage-utils')
const { generateId, randomInt } = require('../utils/mock-utils')

const STORAGE_KEY = 'shopping'

/**
 * 初始化采购清单 mock 数据
 */
function initShoppingData() {
  const existing = storage.get(STORAGE_KEY)
  if (existing && existing.length > 0) return
  storage.set(STORAGE_KEY, generateMockShopping())
}

/**
 * 获取所有采购项
 * @returns {Array}
 */
function getAllShoppingItems() {
  return storage.get(STORAGE_KEY, [])
}

/**
 * 获取未完成的采购项
 * @returns {Array}
 */
function getPendingItems() {
  return getAllShoppingItems().filter(item => !item.purchased)
}

/**
 * 获取已完成的采购项
 * @returns {Array}
 */
function getPurchasedItems() {
  return getAllShoppingItems().filter(item => item.purchased)
}

/**
 * 添加采购项
 * @param {object} item
 * @returns {object}
 */
function addShoppingItem(item) {
  const items = getAllShoppingItems()
  const newItem = {
    id: generateId('shop'),
    name: item.name || '',
    category: item.category || '其他',
    quantity: item.quantity || 1,
    unit: item.unit || '个',
    estimatedPrice: item.estimatedPrice || randomInt(5, 30),
    purchased: false,
    fromUsed: item.fromUsed || false,
    notes: item.notes || '',
    createdAt: new Date().toISOString()
  }
  items.unshift(newItem)
  storage.set(STORAGE_KEY, items)
  return newItem
}

/**
 * 批量添加采购项
 * @param {Array} itemList
 * @returns {Array}
 */
function addShoppingItems(itemList) {
  const items = getAllShoppingItems()
  const newItems = itemList.map(item => ({
    id: generateId('shop'),
    name: item.name || '',
    category: item.category || '其他',
    quantity: item.quantity || 1,
    unit: item.unit || '个',
    estimatedPrice: item.estimatedPrice || randomInt(5, 30),
    purchased: false,
    fromUsed: item.fromUsed || false,
    notes: item.notes || '',
    createdAt: new Date().toISOString()
  }))
  items.unshift(...newItems)
  storage.set(STORAGE_KEY, items)
  return newItems
}

/**
 * 标记已购买
 * @param {string} id
 * @returns {object|null}
 */
function markAsPurchased(id) {
  const items = getAllShoppingItems()
  const index = items.findIndex(i => i.id === id)
  if (index === -1) return null
  items[index].purchased = true
  items[index].purchasedAt = new Date().toISOString()
  storage.set(STORAGE_KEY, items)
  return items[index]
}

/**
 * 取消已购买
 * @param {string} id
 * @returns {object|null}
 */
function unmarkPurchased(id) {
  const items = getAllShoppingItems()
  const index = items.findIndex(i => i.id === id)
  if (index === -1) return null
  items[index].purchased = false
  items[index].purchasedAt = null
  storage.set(STORAGE_KEY, items)
  return items[index]
}

/**
 * 删除采购项
 * @param {string} id
 * @returns {boolean}
 */
function deleteShoppingItem(id) {
  const items = getAllShoppingItems()
  const newItems = items.filter(i => i.id !== id)
  if (newItems.length === items.length) return false
  storage.set(STORAGE_KEY, newItems)
  return true
}

/**
 * 清空已购买项
 * @returns {number}
 */
function clearPurchased() {
  const items = getAllShoppingItems()
  const pending = items.filter(i => !i.purchased)
  const clearedCount = items.length - pending.length
  storage.set(STORAGE_KEY, pending)
  return clearedCount
}

/**
 * 按分类分组采购项
 * @param {Array} items
 * @returns {Object}
 */
function groupByCategory(items) {
  const groups = {}
  items.forEach(item => {
    const cat = item.category || '其他'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  })
  return groups
}

/**
 * 计算预计总花费
 * @param {Array} items
 * @returns {number}
 */
function calculateTotalPrice(items) {
  return items.reduce((sum, item) => sum + (item.estimatedPrice || 0) * item.quantity, 0)
}

/**
 * 从已用完的食材添加到采购清单
 * @param {object} food
 * @returns {object}
 */
function addFromUsedFood(food) {
  return addShoppingItem({
    name: food.name,
    category: food.category,
    quantity: 1,
    unit: food.unit,
    fromUsed: true,
    notes: `从冰箱中已用完的${food.name}补充`
  })
}

/**
 * 生成 30 条 mock 数据
 */
function generateMockShopping() {
  const items = [
    { name: '番茄', category: '蔬菜', quantity: 4, unit: '个', estimatedPrice: 3, purchased: false },
    { name: '鸡蛋', category: '蛋奶', quantity: 12, unit: '个', estimatedPrice: 1, purchased: false },
    { name: '鸡胸肉', category: '肉类', quantity: 1, unit: '斤', estimatedPrice: 15, purchased: false },
    { name: '牛奶', category: '蛋奶', quantity: 2, unit: '瓶', estimatedPrice: 8, purchased: false },
    { name: '面包', category: '主食', quantity: 1, unit: '袋', estimatedPrice: 12, purchased: true },
    { name: '苹果', category: '水果', quantity: 4, unit: '个', estimatedPrice: 2, purchased: true },
    { name: '香蕉', category: '水果', quantity: 1, unit: '把', estimatedPrice: 6, purchased: false },
    { name: '西兰花', category: '蔬菜', quantity: 1, unit: '颗', estimatedPrice: 5, purchased: false },
    { name: '虾', category: '海鲜', quantity: 1, unit: '斤', estimatedPrice: 35, purchased: false },
    { name: '酸奶', category: '蛋奶', quantity: 6, unit: '杯', estimatedPrice: 4, purchased: true },
    { name: '土豆', category: '蔬菜', quantity: 3, unit: '个', estimatedPrice: 2, purchased: false },
    { name: '胡萝卜', category: '蔬菜', quantity: 3, unit: '根', estimatedPrice: 1, purchased: true },
    { name: '豆腐', category: '蔬菜', quantity: 2, unit: '块', estimatedPrice: 3, purchased: false },
    { name: '排骨', category: '肉类', quantity: 1, unit: '斤', estimatedPrice: 28, purchased: false },
    { name: '面条', category: '主食', quantity: 1, unit: '袋', estimatedPrice: 8, purchased: true },
    { name: '橙汁', category: '饮料', quantity: 1, unit: '瓶', estimatedPrice: 10, purchased: false },
    { name: '咖啡', category: '饮料', quantity: 1, unit: '盒', estimatedPrice: 35, purchased: true },
    { name: '奶酪片', category: '蛋奶', quantity: 1, unit: '盒', estimatedPrice: 18, purchased: false },
    { name: '食用油', category: '调料', quantity: 1, unit: '瓶', estimatedPrice: 45, purchased: false },
    { name: '酱油', category: '调料', quantity: 1, unit: '瓶', estimatedPrice: 12, purchased: true },
    { name: '牛肉', category: '肉类', quantity: 1, unit: '斤', estimatedPrice: 38, purchased: false },
    { name: '草莓', category: '水果', quantity: 1, unit: '盒', estimatedPrice: 15, purchased: false },
    { name: '大蒜', category: '蔬菜', quantity: 2, unit: '头', estimatedPrice: 2, purchased: true },
    { name: '五花肉', category: '肉类', quantity: 1, unit: '斤', estimatedPrice: 22, purchased: false },
    { name: '黄瓜', category: '蔬菜', quantity: 3, unit: '根', estimatedPrice: 1, purchased: false },
    { name: '可乐', category: '饮料', quantity: 6, unit: '罐', estimatedPrice: 2, purchased: true },
    { name: '馒头', category: '主食', quantity: 8, unit: '个', estimatedPrice: 0.5, purchased: false },
    { name: '三文鱼', category: '海鲜', quantity: 1, unit: '盒', estimatedPrice: 48, purchased: false },
    { name: '粉丝', category: '其他', quantity: 1, unit: '袋', estimatedPrice: 5, purchased: true },
    { name: '菠菜', category: '蔬菜', quantity: 2, unit: '把', estimatedPrice: 3, purchased: false }
  ]

  return items.map((item, index) => ({
    id: `shop_${String(index + 1).padStart(3, '0')}`,
    ...item,
    fromUsed: index % 5 === 0,
    notes: '',
    createdAt: new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000)).toISOString(),
    purchasedAt: item.purchased ? new Date(Date.now() - randomInt(0, 3 * 24 * 60 * 60 * 1000)).toISOString() : null
  }))
}

module.exports = {
  initShoppingData,
  getAllShoppingItems,
  getPendingItems,
  getPurchasedItems,
  addShoppingItem,
  addShoppingItems,
  markAsPurchased,
  unmarkPurchased,
  deleteShoppingItem,
  clearPurchased,
  groupByCategory,
  calculateTotalPrice,
  addFromUsedFood
}
