/**
 * @file 菜谱 API 模块
 * @description 封装菜谱推荐、AI 生成菜谱、菜谱详情、一周菜单等接口
 *   当前使用 Mock 数据实现，接口定义完整，方便后续替换为真实后端
 * @module services/api/modules/recipe-api
 */

const { get, post } = require('../request')

// ======================== Mock 数据 ========================

/**
 * Mock 菜谱数据库
 * @type {Array<Object>}
 * @private
 */
const MOCK_RECIPES = [
  {
    id: 'recipe_001',
    title: '西红柿炒鸡蛋',
    description: '经典家常菜，酸甜可口，营养丰富',
    category: '家常菜',
    difficulty: '简单',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '西红柿', amount: '2个', essential: true },
      { name: '鸡蛋', amount: '3个', essential: true },
      { name: '葱', amount: '适量', essential: false },
      { name: '盐', amount: '适量', essential: false },
      { name: '糖', amount: '少许', essential: false },
      { name: '食用油', amount: '适量', essential: false }
    ],
    steps: [
      '西红柿洗净切块，鸡蛋打散加少许盐搅匀',
      '热锅凉油，倒入蛋液炒至凝固盛出备用',
      '锅中加油，放入西红柿翻炒出汁',
      '加入少许糖提鲜，倒入炒好的鸡蛋',
      '翻炒均匀，加盐调味，撒葱花出锅'
    ],
    image: '/assets/mock/recipe_tomato_egg.png',
    tags: ['快手菜', '下饭菜', '低脂'],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'recipe_002',
    title: '红烧豆腐',
    description: '外焦里嫩，酱香浓郁',
    category: '家常菜',
    difficulty: '简单',
    cookingTime: 20,
    servings: 2,
    ingredients: [
      { name: '豆腐', amount: '1块', essential: true },
      { name: '猪肉末', amount: '50g', essential: false },
      { name: '豆瓣酱', amount: '1勺', essential: true },
      { name: '蒜', amount: '3瓣', essential: false },
      { name: '生抽', amount: '1勺', essential: false },
      { name: '葱花', amount: '适量', essential: false }
    ],
    steps: [
      '豆腐切成小方块，放入淡盐水中浸泡5分钟',
      '热锅加油，放入豆腐煎至两面金黄盛出',
      '锅中加油，炒香肉末和蒜末',
      '加入豆瓣酱炒出红油',
      '放入煎好的豆腐，加入生抽和少许水',
      '中小火焖煮3分钟，大火收汁，撒葱花出锅'
    ],
    image: '/assets/mock/recipe_tofu.png',
    tags: ['下饭菜', '高蛋白'],
    createdAt: '2026-01-02T00:00:00Z'
  },
  {
    id: 'recipe_003',
    title: '牛奶燕麦粥',
    description: '营养早餐，简单快捷',
    category: '早餐',
    difficulty: '简单',
    cookingTime: 10,
    servings: 1,
    ingredients: [
      { name: '牛奶', amount: '250ml', essential: true },
      { name: '燕麦片', amount: '50g', essential: true },
      { name: '蜂蜜', amount: '适量', essential: false },
      { name: '水果', amount: '少许', essential: false }
    ],
    steps: [
      '锅中倒入牛奶，小火加热至微沸',
      '加入燕麦片，搅拌均匀',
      '小火煮3-5分钟至浓稠',
      '盛出后加入蜂蜜和水果即可'
    ],
    image: '/assets/mock/recipe_oatmeal.png',
    tags: ['早餐', '营养', '快手'],
    createdAt: '2026-01-03T00:00:00Z'
  },
  {
    id: 'recipe_004',
    title: '青椒肉丝',
    description: '色彩鲜艳，口感脆嫩',
    category: '家常菜',
    difficulty: '中等',
    cookingTime: 15,
    servings: 2,
    ingredients: [
      { name: '猪肉', amount: '200g', essential: true },
      { name: '青椒', amount: '3个', essential: true },
      { name: '生抽', amount: '1勺', essential: false },
      { name: '料酒', amount: '1勺', essential: false },
      { name: '淀粉', amount: '少许', essential: false },
      { name: '盐', amount: '适量', essential: false }
    ],
    steps: [
      '猪肉切丝，加生抽、料酒、淀粉腌制10分钟',
      '青椒去籽切丝',
      '热锅凉油，快速滑炒肉丝至变色盛出',
      '锅中加油，放入青椒翻炒至断生',
      '倒回肉丝，加盐翻炒均匀出锅'
    ],
    image: '/assets/mock/recipe_pepper_pork.png',
    tags: ['下饭菜', '快炒'],
    createdAt: '2026-01-04T00:00:00Z'
  }
]

/**
 * Mock 一周菜单数据
 * @type {Object}
 * @private
 */
const MOCK_WEEKLY_MENU = {
  weekStart: '2026-06-08',
  weekEnd: '2026-06-14',
  days: [
    {
      date: '2026-06-08',
      dayOfWeek: '周一',
      meals: {
        breakfast: ['牛奶燕麦粥'],
        lunch: ['西红柿炒鸡蛋', '青椒肉丝', '米饭'],
        dinner: ['红烧豆腐', '凉拌黄瓜', '米饭']
      }
    },
    {
      date: '2026-06-09',
      dayOfWeek: '周二',
      meals: {
        breakfast: ['豆浆', '包子'],
        lunch: ['青椒肉丝', '清炒时蔬', '米饭'],
        dinner: ['西红柿鸡蛋面']
      }
    },
    {
      date: '2026-06-10',
      dayOfWeek: '周三',
      meals: {
        breakfast: ['牛奶', '面包', '水果'],
        lunch: ['红烧豆腐', '炒青菜', '米饭'],
        dinner: ['蛋炒饭', '紫菜蛋花汤']
      }
    },
    {
      date: '2026-06-11',
      dayOfWeek: '周四',
      meals: {
        breakfast: ['粥', '咸鸭蛋'],
        lunch: ['西红柿炒鸡蛋', '红烧豆腐', '米饭'],
        dinner: ['饺子']
      }
    },
    {
      date: '2026-06-12',
      dayOfWeek: '周五',
      meals: {
        breakfast: ['牛奶燕麦粥'],
        lunch: ['青椒肉丝', '西红柿炒鸡蛋', '米饭'],
        dinner: ['火锅']
      }
    },
    {
      date: '2026-06-13',
      dayOfWeek: '周六',
      meals: {
        breakfast: ['煎蛋', '牛奶', '水果'],
        lunch: ['红烧排骨', '清炒豆角', '米饭'],
        dinner: ['烧烤']
      }
    },
    {
      date: '2026-06-14',
      dayOfWeek: '周日',
      meals: {
        breakfast: ['油条', '豆浆'],
        lunch: ['可乐鸡翅', '凉拌木耳', '米饭'],
        dinner: ['西红柿鸡蛋面']
      }
    }
  ]
}

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
 * 获取推荐菜谱
 * 根据冰箱内现有食材推荐可做的菜品
 *
 * @param {Object} [params] - 查询参数
 * @param {number} [params.limit=10] - 返回数量
 * @param {string} [params.category] - 菜谱分类（家常菜/早餐/快手菜）
 * @returns {Promise<Array<Object>>} 推荐菜谱列表
 *
 * @example
 * recipeApi.getRecommendRecipes({ limit: 5 })
 */
async function getRecommendRecipes(params = {}) {
  await simulateDelay()

  const { limit = 10, category } = params

  let recipes = deepClone(MOCK_RECIPES)

  if (category) {
    recipes = recipes.filter(r => r.category === category)
  }

  // 随机打散后截取
  recipes.sort(() => Math.random() - 0.5)
  recipes = recipes.slice(0, limit)

  return recipes

  // ---- 替换为真实后端时取消注释 ----
  // return get('recipe/recommend', params, { useCache: true, cacheTtl: 300000 })
}

/**
 * AI 生成菜谱
 * 根据提供的食材列表，由 AI 生成推荐菜谱
 *
 * @param {Object} data - 请求参数
 * @param {Array<string>} data.ingredients - 食材名称列表（必填）
 * @param {string} [data.preference] - 饮食偏好（如 "少油少盐"、"不吃辣"）
 * @param {number} [data.count=3] - 生成菜谱数量
 * @param {string} [data.difficulty] - 难度偏好（简单/中等/困难）
 * @returns {Promise<Array<Object>>} AI 生成的菜谱列表
 *
 * @example
 * recipeApi.generateRecipe({
 *   ingredients: ['西红柿', '鸡蛋', '豆腐'],
 *   preference: '少油少盐',
 *   count: 2
 * })
 */
async function generateRecipe(data) {
  await simulateDelay(1000, 3000) // AI 推理需要更长时间

  const { ingredients = [], count = 3 } = data

  // Mock: 根据食材关键词匹配菜谱
  const results = MOCK_RECIPES.filter(recipe =>
    recipe.ingredients.some(ing =>
      ingredients.some(input => ing.name.includes(input))
    )
  ).slice(0, count)

  // 如果匹配不足，补充推荐
  if (results.length < count) {
    const remaining = MOCK_RECIPES
      .filter(r => !results.find(res => res.id === r.id))
      .slice(0, count - results.length)
    results.push(...remaining)
  }

  return deepClone(results)

  // ---- 替换为真实后端时取消注释 ----
  // return post('recipe/generate', data, { showLoading: true, loadingText: 'AI 正在生成菜谱...' })
}

/**
 * 获取菜谱详情
 *
 * @param {string} id - 菜谱 ID
 * @returns {Promise<Object>} 菜谱详细信息
 *
 * @example
 * recipeApi.getRecipeDetail('recipe_001')
 */
async function getRecipeDetail(id) {
  await simulateDelay()

  const recipe = MOCK_RECIPES.find(item => item.id === id)
  if (!recipe) {
    return Promise.reject({ code: 404, message: '菜谱不存在' })
  }
  return deepClone(recipe)

  // ---- 替换为真实后端时取消注释 ----
  // return get(`recipe/${id}`, null, { useCache: true })
}

/**
 * 获取一周菜单
 * 返回本周推荐菜单（早/中/晚三餐安排）
 *
 * @param {Object} [params] - 查询参数
 * @param {string} [params.weekStart] - 周起始日期（YYYY-MM-DD），默认本周
 * @returns {Promise<Object>} 一周菜单数据
 *
 * @example
 * recipeApi.getWeeklyMenu()
 * recipeApi.getWeeklyMenu({ weekStart: '2026-06-15' })
 */
async function getWeeklyMenu(params = {}) {
  await simulateDelay()

  return deepClone(MOCK_WEEKLY_MENU)

  // ---- 替换为真实后端时取消注释 ----
  // return get('recipe/weekly-menu', params, { useCache: true, cacheTtl: 600000 })
}

module.exports = {
  getRecommendRecipes,
  generateRecipe,
  getRecipeDetail,
  getWeeklyMenu
}
