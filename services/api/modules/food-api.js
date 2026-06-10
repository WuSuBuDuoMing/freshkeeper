/**
 * @file 食材 API 模块
 * @description 封装所有食材相关的接口调用
 *   当前使用 Mock 数据实现，接口定义完整，方便后续替换为真实后端
 * @module services/api/modules/food-api
 */

const { get, post, put, del, upload } = require('../request')

// ======================== Mock 数据 ========================

/**
 * Mock 食材数据库
 * @type {Array<Object>}
 * @private
 */
const MOCK_FOODS = [
  {
    id: 'food_001',
    name: '西红柿',
    category: 'vegetable',
    categoryName: '蔬菜',
    quantity: 3,
    unit: '个',
    expiryDate: '2026-06-15',
    purchaseDate: '2026-06-05',
    storage: 'fridge',
    storageName: '冷藏',
    status: 'fresh',
    statusName: '新鲜',
    image: '/assets/mock/tomato.png',
    location: '冷藏室第一层',
    createdAt: '2026-06-05T10:00:00Z',
    updatedAt: '2026-06-05T10:00:00Z'
  },
  {
    id: 'food_002',
    name: '鸡蛋',
    category: 'egg',
    categoryName: '蛋类',
    quantity: 10,
    unit: '个',
    expiryDate: '2026-07-01',
    purchaseDate: '2026-06-01',
    storage: 'fridge',
    storageName: '冷藏',
    status: 'fresh',
    statusName: '新鲜',
    image: '/assets/mock/egg.png',
    location: '冷藏室第二层',
    createdAt: '2026-06-01T08:30:00Z',
    updatedAt: '2026-06-01T08:30:00Z'
  },
  {
    id: 'food_003',
    name: '牛奶',
    category: 'dairy',
    categoryName: '乳制品',
    quantity: 2,
    unit: '盒',
    expiryDate: '2026-06-10',
    purchaseDate: '2026-06-03',
    storage: 'fridge',
    storageName: '冷藏',
    status: 'expiring',
    statusName: '即将过期',
    image: '/assets/mock/milk.png',
    location: '冷藏室第一层',
    createdAt: '2026-06-03T09:00:00Z',
    updatedAt: '2026-06-07T09:00:00Z'
  },
  {
    id: 'food_004',
    name: '猪肉',
    category: 'meat',
    categoryName: '肉类',
    quantity: 500,
    unit: 'g',
    expiryDate: '2026-06-12',
    purchaseDate: '2026-06-06',
    storage: 'freezer',
    storageName: '冷冻',
    status: 'fresh',
    statusName: '新鲜',
    image: '/assets/mock/pork.png',
    location: '冷冻室',
    createdAt: '2026-06-06T07:00:00Z',
    updatedAt: '2026-06-06T07:00:00Z'
  },
  {
    id: 'food_005',
    name: '豆腐',
    category: 'bean',
    categoryName: '豆制品',
    quantity: 1,
    unit: '块',
    expiryDate: '2026-06-09',
    purchaseDate: '2026-06-07',
    storage: 'fridge',
    storageName: '冷藏',
    status: 'expiring',
    statusName: '即将过期',
    image: '/assets/mock/tofu.png',
    location: '冷藏室第一层',
    createdAt: '2026-06-07T06:30:00Z',
    updatedAt: '2026-06-07T06:30:00Z'
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
 * 深拷贝对象（简单实现，满足 Mock 数据需求）
 * @param {*} obj
 * @returns {*}
 * @private
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// ======================== API 接口 ========================

/**
 * 获取食材列表
 * 支持分页、按分类筛选、按状态筛选
 *
 * @param {Object} [params] - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=20] - 每页数量
 * @param {string} [params.category] - 分类筛选（vegetable/egg/dairy/meat/bean/fruit/seafood/seasoning）
 * @param {string} [params.status] - 状态筛选（fresh/expiring/expired）
 * @param {string} [params.storage] - 存储位置筛选（fridge/freezer）
 * @param {string} [params.sortBy='expiryDate'] - 排序字段
 * @param {string} [params.sortOrder='asc'] - 排序方向（asc/desc）
 * @returns {Promise<{list: Array<Object>, total: number, page: number, pageSize: number, hasMore: boolean}>}
 *
 * @example
 * // 获取蔬菜类食材
 * foodApi.getFoodList({ category: 'vegetable', page: 1, pageSize: 10 })
 */
async function getFoodList(params = {}) {
  await simulateDelay()

  const {
    page = 1,
    pageSize = 20,
    category,
    status,
    storage,
    sortBy = 'expiryDate',
    sortOrder = 'asc'
  } = params

  let list = deepClone(MOCK_FOODS)

  // 筛选
  if (category) {
    list = list.filter(item => item.category === category)
  }
  if (status) {
    list = list.filter(item => item.status === status)
  }
  if (storage) {
    list = list.filter(item => item.storage === storage)
  }

  // 排序
  list.sort((a, b) => {
    const aVal = a[sortBy] || ''
    const bVal = b[sortBy] || ''
    if (sortOrder === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    }
    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
  })

  // 分页
  const total = list.length
  const start = (page - 1) * pageSize
  const paginatedList = list.slice(start, start + pageSize)

  return {
    list: paginatedList,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total
  }

  // ---- 替换为真实后端时取消注释 ----
  // return get('food/list', params, { useCache: true })
}

/**
 * 获取食材详情
 *
 * @param {string} id - 食材 ID
 * @returns {Promise<Object>} 食材详细信息
 *
 * @example
 * foodApi.getFoodDetail('food_001')
 */
async function getFoodDetail(id) {
  await simulateDelay()

  const food = MOCK_FOODS.find(item => item.id === id)
  if (!food) {
    return Promise.reject({ code: 10003, message: '食材数据不存在' })
  }
  return deepClone(food)

  // ---- 替换为真实后端时取消注释 ----
  // return get(`food/${id}`, null, { useCache: true, cacheTtl: 60000 })
}

/**
 * 创建食材
 *
 * @param {Object} data - 食材数据
 * @param {string} data.name - 食材名称（必填）
 * @param {string} data.category - 分类（必填）
 * @param {number} data.quantity - 数量（必填）
 * @param {string} data.unit - 单位（必填）
 * @param {string} [data.expiryDate] - 过期日期
 * @param {string} [data.purchaseDate] - 购买日期
 * @param {string} [data.storage='fridge'] - 存储位置
 * @param {string} [data.image] - 图片地址
 * @param {string} [data.location] - 冰箱内具体位置
 * @returns {Promise<Object>} 创建成功后的食材对象（含 id）
 *
 * @example
 * foodApi.createFood({ name: '胡萝卜', category: 'vegetable', quantity: 5, unit: '根' })
 */
async function createFood(data) {
  await simulateDelay(300, 800)

  const now = new Date().toISOString()
  const newFood = {
    id: `food_${String(mockIdCounter++).padStart(3, '0')}`,
    name: data.name,
    category: data.category,
    categoryName: getCategoryName(data.category),
    quantity: data.quantity,
    unit: data.unit,
    expiryDate: data.expiryDate || '',
    purchaseDate: data.purchaseDate || now.split('T')[0],
    storage: data.storage || 'fridge',
    storageName: data.storage === 'freezer' ? '冷冻' : '冷藏',
    status: 'fresh',
    statusName: '新鲜',
    image: data.image || '',
    location: data.location || '',
    createdAt: now,
    updatedAt: now,
    ...data
  }

  MOCK_FOODS.push(newFood)
  return deepClone(newFood)

  // ---- 替换为真实后端时取消注释 ----
  // return post('food', data, { showLoading: true })
}

/**
 * 更新食材
 *
 * @param {string} id - 食材 ID
 * @param {Object} data - 要更新的字段
 * @returns {Promise<Object>} 更新后的食材对象
 *
 * @example
 * foodApi.updateFood('food_001', { quantity: 2, name: '大西红柿' })
 */
async function updateFood(id, data) {
  await simulateDelay(300, 800)

  const index = MOCK_FOODS.findIndex(item => item.id === id)
  if (index === -1) {
    return Promise.reject({ code: 10003, message: '食材数据不存在' })
  }

  const now = new Date().toISOString()
  MOCK_FOODS[index] = {
    ...MOCK_FOODS[index],
    ...data,
    updatedAt: now
  }

  // 更新分类名称
  if (data.category) {
    MOCK_FOODS[index].categoryName = getCategoryName(data.category)
  }
  // 更新存储名称
  if (data.storage) {
    MOCK_FOODS[index].storageName = data.storage === 'freezer' ? '冷冻' : '冷藏'
  }

  return deepClone(MOCK_FOODS[index])

  // ---- 替换为真实后端时取消注释 ----
  // return put(`food/${id}`, data, { showLoading: true })
}

/**
 * 删除食材
 *
 * @param {string} id - 食材 ID
 * @returns {Promise<{success: boolean}>}
 *
 * @example
 * foodApi.deleteFood('food_001')
 */
async function deleteFood(id) {
  await simulateDelay(300, 600)

  const index = MOCK_FOODS.findIndex(item => item.id === id)
  if (index === -1) {
    return Promise.reject({ code: 10003, message: '食材数据不存在' })
  }

  MOCK_FOODS.splice(index, 1)
  return { success: true }

  // ---- 替换为真实后端时取消注释 ----
  // return del(`food/${id}`, null, { showLoading: true })
}

/**
 * 批量删除食材
 *
 * @param {Array<string>} ids - 要删除的食材 ID 数组
 * @returns {Promise<{success: boolean, deletedCount: number}>}
 *
 * @example
 * foodApi.batchDeleteFoods(['food_001', 'food_002'])
 */
async function batchDeleteFoods(ids) {
  await simulateDelay(400, 1000)

  let deletedCount = 0
  ids.forEach(id => {
    const index = MOCK_FOODS.findIndex(item => item.id === id)
    if (index !== -1) {
      MOCK_FOODS.splice(index, 1)
      deletedCount++
    }
  })

  return { success: true, deletedCount }

  // ---- 替换为真实后端时取消注释 ----
  // return post('food/batch-delete', { ids }, { showLoading: true })
}

/**
 * 搜索食材
 *
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array<Object>>} 搜索结果列表
 *
 * @example
 * foodApi.searchFoods('番茄')
 */
async function searchFoods(keyword) {
  await simulateDelay(100, 300)

  if (!keyword || !keyword.trim()) {
    return []
  }

  const lowerKeyword = keyword.toLowerCase()
  const results = MOCK_FOODS.filter(item =>
    item.name.toLowerCase().includes(lowerKeyword) ||
    item.categoryName.toLowerCase().includes(lowerKeyword) ||
    (item.location && item.location.toLowerCase().includes(lowerKeyword))
  )

  return deepClone(results)

  // ---- 替换为真实后端时取消注释 ----
  // return get('food/search', { keyword }, { useCache: true, cacheTtl: 30000 })
}

/**
 * 上传食材图片
 *
 * @param {string} id - 食材 ID
 * @param {string} filePath - 本地图片临时路径（由 wx.chooseMedia 获取）
 * @returns {Promise<{imageUrl: string}>} 上传后的图片 URL
 *
 * @example
 * // 先选择图片
 * wx.chooseMedia({
 *   count: 1,
 *   mediaType: ['image'],
 *   success(res) {
 *     const tempPath = res.tempFiles[0].tempFilePath
 *     foodApi.uploadFoodImage('food_001', tempPath)
 *   }
 * })
 */
async function uploadFoodImage(id, filePath) {
  const result = await upload(
    `food/${id}/image`,
    filePath,
    'image',
    {},
    { showLoading: true, loadingText: '上传图片中...' }
  )
  return result

  // ---- Mock 返回 ----
  // return { imageUrl: `/assets/upload/${id}_${Date.now()}.png` }
}

// ======================== 工具函数 ========================

/**
 * 根据分类代码获取中文分类名称
 * @param {string} category - 分类代码
 * @returns {string} 中文分类名称
 * @private
 */
function getCategoryName(category) {
  const categoryMap = {
    vegetable: '蔬菜',
    fruit: '水果',
    meat: '肉类',
    seafood: '海鲜',
    egg: '蛋类',
    dairy: '乳制品',
    bean: '豆制品',
    grain: '谷物',
    seasoning: '调味品',
    beverage: '饮品',
    snack: '零食',
    other: '其他'
  }
  return categoryMap[category] || '其他'
}

module.exports = {
  getFoodList,
  getFoodDetail,
  createFood,
  updateFood,
  deleteFood,
  batchDeleteFoods,
  searchFoods,
  uploadFoodImage
}
