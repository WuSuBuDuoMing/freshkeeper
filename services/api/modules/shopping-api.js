/**
 * @file 采购 API 模块
 * @description 封装采购清单相关的接口调用
 *   当前使用 Mock 数据实现，接口定义完整，方便后续替换为真实后端
 * @module services/api/modules/shopping-api
 */

const { get, post, put, del } = require('../request')

// ======================== Mock 数据 ========================

/**
 * Mock 采购清单
 * @type {Array<Object>}
 * @private
 */
const MOCK_SHOPPING_LIST = [
  {
    id: 'shop_001',
    name: '西红柿',
    category: 'vegetable',
    categoryName: '蔬菜',
    quantity: 5,
    unit: '个',
    purchased: false,
    estimatedPrice: 8.00,
    note: '选红色饱满的',
    createdAt: '2026-06-07T10:00:00Z'
  },
  {
    id: 'shop_002',
    name: '牛奶',
    category: 'dairy',
    categoryName: '乳制品',
    quantity: 3,
    unit: '盒',
    purchased: true,
    estimatedPrice: 15.00,
    actualPrice: 14.50,
    note: '全脂纯牛奶',
    createdAt: '2026-06-06T08:00:00Z',
    purchasedAt: '2026-06-07T14:00:00Z'
  },
  {
    id: 'shop_003',
    name: '鸡蛋',
    category: 'egg',
    categoryName: '蛋类',
    quantity: 20,
    unit: '个',
    purchased: false,
    estimatedPrice: 16.00,
    note: '土鸡蛋',
    createdAt: '2026-06-07T09:00:00Z'
  },
  {
    id: 'shop_004',
    name: '猪肉',
    category: 'meat',
    categoryName: '肉类',
    quantity: 500,
    unit: 'g',
    purchased: false,
    estimatedPrice: 22.00,
    note: '前腿肉',
    createdAt: '2026-06-07T09:30:00Z'
  },
  {
    id: 'shop_005',
    name: '青椒',
    category: 'vegetable',
    categoryName: '蔬菜',
    quantity: 6,
    unit: '个',
    purchased: true,
    estimatedPrice: 5.00,
    actualPrice: 4.80,
    note: '',
    createdAt: '2026-06-06T11:00:00Z',
    purchasedAt: '2026-06-07T15:00:00Z'
  }
]

/**
 * 全局 Mock ID 计数器
 * @type {number}
 * @private
 */
let mockIdCounter = 6

// ======================== Mock 工具函数 ========================

/**
 * 模拟网络延迟
 * @param {number} [min=200] - 最小延迟（毫秒）
 * @param {number} [max=600] - 最大延迟（毫秒）
 * @returns {Promise<void>}
 * @private
 */
function simulateDelay(min = 200, max = 600) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * 深拷贝对象
 * @param {*} obj
 * @returns {*}
 * @private
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// ======================== API 接口 ========================

/**
 * 获取采购清单
 * 返回用户的完整采购清单，包含已购买和未购买的项目
 *
 * @param {Object} [params] - 查询参数
 * @param {boolean} [params.purchased] - 筛选购买状态（true=已购，false=未购，undefined=全部）
 * @returns {Promise<{list: Array<Object>, summary: Object}>} 采购清单及统计摘要
 *
 * @example
 * shoppingApi.getShoppingList()
 * shoppingApi.getShoppingList({ purchased: false })
 */
async function getShoppingList(params = {}) {
  await simulateDelay()

  let list = deepClone(MOCK_SHOPPING_LIST)

  if (params.purchased !== undefined) {
    list = list.filter(item => item.purchased === params.purchased)
  }

  // 统计摘要
  const allItems = deepClone(MOCK_SHOPPING_LIST)
  const summary = {
    totalCount: allItems.length,
    purchasedCount: allItems.filter(i => i.purchased).length,
    unpurchasedCount: allItems.filter(i => !i.purchased).length,
    estimatedTotal: allItems.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0),
    actualTotal: allItems
      .filter(i => i.purchased && i.actualPrice)
      .reduce((sum, i) => sum + i.actualPrice, 0)
  }

  return { list, summary }

  // ---- 替换为真实后端时取消注释 ----
  // return get('shopping/list', params, { useCache: true })
}

/**
 * 添加采购项
 *
 * @param {Object} data - 采购项数据
 * @param {string} data.name - 物品名称（必填）
 * @param {string} [data.category] - 分类
 * @param {number} [data.quantity=1] - 数量
 * @param {string} [data.unit='个'] - 单位
 * @param {number} [data.estimatedPrice] - 预估价格
 * @param {string} [data.note] - 备注
 * @returns {Promise<Object>} 新添加的采购项
 *
 * @example
 * shoppingApi.addShoppingItem({
 *   name: '苹果',
 *   category: 'fruit',
 *   quantity: 4,
 *   unit: '个',
 *   estimatedPrice: 12.00,
 *   note: '红富士'
 * })
 */
async function addShoppingItem(data) {
  await simulateDelay(300, 600)

  const now = new Date().toISOString()
  const categoryMap = {
    vegetable: '蔬菜', fruit: '水果', meat: '肉类',
    seafood: '海鲜', egg: '蛋类', dairy: '乳制品',
    bean: '豆制品', grain: '谷物', seasoning: '调味品',
    beverage: '饮品', snack: '零食', other: '其他'
  }

  const newItem = {
    id: `shop_${String(mockIdCounter++).padStart(3, '0')}`,
    name: data.name,
    category: data.category || 'other',
    categoryName: categoryMap[data.category] || '其他',
    quantity: data.quantity || 1,
    unit: data.unit || '个',
    purchased: false,
    estimatedPrice: data.estimatedPrice || 0,
    note: data.note || '',
    createdAt: now
  }

  MOCK_SHOPPING_LIST.push(newItem)
  return deepClone(newItem)

  // ---- 替换为真实后端时取消注释 ----
  // return post('shopping/item', data, { showLoading: true })
}

/**
 * 切换采购项的购买状态
 *
 * @param {string} id - 采购项 ID
 * @param {Object} [extraData] - 额外数据（如实际价格）
 * @param {number} [extraData.actualPrice] - 实际购买价格
 * @returns {Promise<Object>} 更新后的采购项
 *
 * @example
 * shoppingApi.togglePurchased('shop_001', { actualPrice: 7.50 })
 */
async function togglePurchased(id, extraData = {}) {
  await simulateDelay(200, 500)

  const item = MOCK_SHOPPING_LIST.find(i => i.id === id)
  if (!item) {
    return Promise.reject({ code: 404, message: '采购项不存在' })
  }

  item.purchased = !item.purchased
  if (item.purchased) {
    item.purchasedAt = new Date().toISOString()
    item.actualPrice = extraData.actualPrice || item.estimatedPrice
  } else {
    delete item.purchasedAt
    delete item.actualPrice
  }

  return deepClone(item)

  // ---- 替换为真实后端时取消注释 ----
  // return put(`shopping/item/${id}/toggle`, extraData, { showLoading: true })
}

/**
 * 删除采购项
 *
 * @param {string} id - 采购项 ID
 * @returns {Promise<{success: boolean}>}
 *
 * @example
 * shoppingApi.deleteShoppingItem('shop_001')
 */
async function deleteShoppingItem(id) {
  await simulateDelay(300, 500)

  const index = MOCK_SHOPPING_LIST.findIndex(i => i.id === id)
  if (index === -1) {
    return Promise.reject({ code: 404, message: '采购项不存在' })
  }

  MOCK_SHOPPING_LIST.splice(index, 1)
  return { success: true }

  // ---- 替换为真实后端时取消注释 ----
  // return del(`shopping/item/${id}`, null, { showLoading: true })
}

module.exports = {
  getShoppingList,
  addShoppingItem,
  togglePurchased,
  deleteShoppingItem
}
