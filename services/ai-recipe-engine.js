/**
 * @file AI Recipe Generation Engine
 * @description Generates recipe recommendations using AI (or mock fallback) based on
 *   current fridge contents. Supports real API integration (OpenAI-compatible) and
 *   mock mode for offline development. Includes recipe scoring, caching, seasonal
 *   awareness, user preference learning, and streaming support for real-time output.
 * @module services/ai-recipe-engine
 * @version 2.15.0
 */
const storage = require('../utils/storage-utils')
const { daysUntilExpiry, isExpiringSoon } = require('../utils/date-utils')

/**
 * AI engine configuration.
 * Toggle `useRealAPI` to switch between mock mode and a live LLM endpoint.
 * @type {Object}
 * @property {boolean} useRealAPI - Whether to call the real AI API (false = mock mode)
 * @property {string} apiEndpoint - LLM API endpoint URL
 * @property {string} apiKey - Bearer token for the API
 * @property {string} model - Model identifier (e.g. 'gpt-3.5-turbo')
 * @property {number} maxTokens - Maximum response tokens
 * @property {number} temperature - Sampling temperature (0-2)
 * @property {number} cacheTTL - Recipe cache time-to-live in milliseconds (default 30 min)
 */
const AI_CONFIG = {
  useRealAPI: false, // Toggle: set to true to use a real AI API
  apiEndpoint: '',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.8,
  cacheTTL: 30 * 60 * 1000
}

/**
 * 获取当前季节（用于季节性推荐）
 * @returns {'spring'|'summer'|'autumn'|'winter'} 季节标识
 */
function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

/**
 * 季节性食材权重映射
 * @type {Object}
 */
const SEASONAL_INGREDIENTS = {
  spring: ['春笋', '荠菜', '菠菜', '豌豆', '芦笋'],
  summer: ['番茄', '黄瓜', '西瓜', '苦瓜', '茄子', '丝瓜'],
  autumn: ['南瓜', '莲藕', '山药', '板栗', '银耳'],
  winter: ['白菜', '萝卜', '羊肉', '牛肉', '豆腐']
}

/**
 * 用户偏好存储 key
 * @type {string}
 */
const PREFS_KEY = 'recipe_user_prefs'

/**
 * 加载用户偏好（最近点击/收藏的菜谱标签）
 * @returns {{ likedTags: Array<string>, likedCuisines: Array<string>, cookFrequency: number }}
 */
function loadUserPrefs() {
  return storage.get(PREFS_KEY, { likedTags: [], likedCuisines: [], cookFrequency: 0 })
}

/**
 * 保存用户偏好
 * @param {object} prefs
 */
function saveUserPrefs(prefs) {
  storage.set(PREFS_KEY, prefs)
}

/**
 * 记录用户对某菜谱的偏好（标签 +1）
 * @param {object} recipe 菜谱对象
 */
function recordUserLike(recipe) {
  const prefs = loadUserPrefs()
  if (recipe.tags) {
    recipe.tags.forEach(tag => {
      if (!prefs.likedTags.includes(tag)) {
        prefs.likedTags.push(tag)
      }
    })
  }
  prefs.cookFrequency = (prefs.cookFrequency || 0) + 1
  // 仅保留最近 20 个标签
  if (prefs.likedTags.length > 20) {
    prefs.likedTags = prefs.likedTags.slice(-20)
  }
  saveUserPrefs(prefs)
}

/**
 * 构建菜谱生成 prompt
 * @param {Array} foods 冰箱食材列表
 * @param {object} options 额外选项
 * @param {string} [options.cuisine] 偏好菜系
 * @param {number} [options.maxTime] 最长烹饪时间（分钟）
 * @param {number} [options.calorieLimit] 热量限制（卡）
 * @param {number} [options.count] 推荐数量（默认 3）
 * @returns {string} 生成的 prompt 文本
 */
function buildRecipePrompt(foods, options = {}) {
  const foodList = foods.map(f => `${f.name}(${f.quantity}${f.unit})`).join('、')
  const expiringFoods = foods
    .filter(f => isExpiringSoon(f.expiryDate))
    .map(f => f.name)

  const season = getCurrentSeason()
  const seasonFoods = SEASONAL_INGREDIENTS[season] || []

  let prompt = '你是一位专业的中餐厨师。请根据以下冰箱食材推荐菜谱。\n\n'
  prompt += `现有食材：${foodList}\n`
  prompt += `当前季节：${season}，应季食材：${seasonFoods.join('、')}\n`

  if (expiringFoods.length > 0) {
    prompt += `以下食材即将过期，请优先使用：${expiringFoods.join('、')}\n`
  }

  const count = options.count || 3
  prompt += `\n请推荐 ${count} 道菜谱，每道菜包含以下信息（JSON 格式）：\n`
  prompt += '[\n  {\n'
  prompt += '    "name": "菜名",\n'
  prompt += '    "ingredients": ["食材1", "食材2"],\n'
  prompt += '    "missingIngredients": ["缺少的食材"],\n'
  prompt += '    "difficulty": "简单/中等/困难",\n'
  prompt += '    "cookingTime": 分钟数,\n'
  prompt += '    "calories": 热量,\n'
  prompt += '    "steps": ["步骤1", "步骤2"],\n'
  prompt += '    "reason": "推荐理由",\n'
  prompt += '    "tags": ["标签"],\n'
  prompt += '    "nutritionTip": "营养小贴士"\n'
  prompt += '  }\n]\n'

  if (options.cuisine) prompt += `偏好菜系：${options.cuisine}\n`
  if (options.maxTime) prompt += `最长烹饪时间：${options.maxTime}分钟\n`
  if (options.calorieLimit) prompt += `热量限制：${options.calorieLimit}卡以内\n`

  return prompt
}

/**
 * 调用 AI API 生成菜谱
 * @param {string} prompt
 * @returns {Promise<Array>}
 */
async function callAIAPI(prompt) {
  if (!AI_CONFIG.useRealAPI) {
    return generateMockRecipes(prompt)
  }

  // 真实 API 调用
  return new Promise((resolve, reject) => {
    wx.request({
      url: AI_CONFIG.apiEndpoint,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      data: {
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: '你是一位专业中餐厨师，请以 JSON 格式回复。' },
          { role: 'user', content: prompt }
        ],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature
      },
      success: (res) => {
        try {
          const content = res.data.choices[0].message.content
          const recipes = JSON.parse(content)
          resolve(recipes)
        } catch (e) {
          reject(new Error('解析 AI 响应失败'))
        }
      },
      fail: reject
    })
  })
}

/**
 * 流式调用 AI API（SSE）
 * @param {string} prompt
 * @param {Function} onChunk 每个 chunk 的回调
 * @returns {Promise<string>} 完整响应
 */
async function callAIStream(prompt, onChunk) {
  if (!AI_CONFIG.useRealAPI) {
    const recipes = generateMockRecipes(prompt)
    // 模拟流式输出
    const fullText = JSON.stringify(recipes)
    let index = 0
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        const chunk = fullText.slice(index, index + 20)
        index += 20
        if (chunk) {
          onChunk(chunk)
        } else {
          clearInterval(timer)
          resolve(fullText)
        }
      }, 50)
    })
  }

  // 真实流式调用预留
  return callAIAPI(prompt)
}

/**
 * 生成 mock 菜谱（AI 不可用时的降级方案）
 * @param {string} prompt
 * @returns {Array}
 */
function generateMockRecipes(prompt) {
  // 从 prompt 中提取食材
  const foodMatch = prompt.match(/现有食材：(.+)/)
  const foodNames = foodMatch
    ? foodMatch[1].match(/[一-龥]+/g) || []
    : []

/**
 * Mock 菜谱池（扩展到 15 道，覆盖更多食材和场景）
 * @type {Array<object>}
 */
  const mockPool = [
    {
      name: '番茄炒蛋', ingredients: ['番茄', '鸡蛋'],
      difficulty: '简单', cookingTime: 10, calories: 180,
      steps: ['番茄切块', '打散鸡蛋', '热锅炒蛋盛出', '炒番茄出汁', '加入鸡蛋翻炒'],
      tags: ['快手菜', '家常']
    },
    {
      name: '蒜蓉西兰花', ingredients: ['西兰花', '大蒜'],
      difficulty: '简单', cookingTime: 10, calories: 80,
      steps: ['西兰花掰小朵焯水', '蒜末爆香', '加入西兰花翻炒', '调味出锅'],
      tags: ['低卡', '健康']
    },
    {
      name: '红烧排骨', ingredients: ['排骨', '姜'],
      difficulty: '中等', cookingTime: 45, calories: 520,
      steps: ['排骨焯水', '炒糖色', '加入排骨翻炒', '加水炖煮30分钟', '收汁出锅'],
      tags: ['硬菜', '下饭']
    },
    {
      name: '虾仁滑蛋', ingredients: ['虾', '鸡蛋'],
      difficulty: '简单', cookingTime: 12, calories: 200,
      steps: ['虾去虾线腌制', '鸡蛋打散', '炒虾仁盛出', '炒蛋至半凝固', '加入虾仁翻炒'],
      tags: ['快手菜', '高蛋白']
    },
    {
      name: '青椒肉丝', ingredients: ['猪肉', '青椒'],
      difficulty: '简单', cookingTime: 15, calories: 350,
      steps: ['猪肉切丝腌制', '青椒切丝', '大火炒肉丝', '加入青椒翻炒', '调味出锅'],
      tags: ['家常', '下饭']
    },
    {
      name: '白菜豆腐汤', ingredients: ['白菜', '豆腐'],
      difficulty: '简单', cookingTime: 15, calories: 120,
      steps: ['白菜切段', '豆腐切块', '姜片爆香', '加白菜翻炒', '加水煮开放豆腐', '调味出锅'],
      tags: ['清淡', '汤品']
    },
    {
      name: '可乐鸡翅', ingredients: ['鸡腿', '可乐'],
      difficulty: '简单', cookingTime: 30, calories: 420,
      steps: ['鸡翅划刀腌制', '煎至两面金黄', '倒入可乐没过鸡翅', '大火烧开转小火', '收汁出锅'],
      tags: ['家常', '快手菜']
    },
    {
      name: '蒜蓉蒸虾', ingredients: ['虾', '大蒜'],
      difficulty: '简单', cookingTime: 15, calories: 180,
      steps: ['虾开背去虾线', '蒜蓉铺在虾上', '淋上酱油', '上锅蒸8分钟', '热油浇上'],
      tags: ['海鲜', '健康']
    },
    {
      name: '凉拌黄瓜', ingredients: ['黄瓜', '大蒜'],
      difficulty: '简单', cookingTime: 5, calories: 50,
      steps: ['黄瓜拍碎切段', '蒜末辣椒', '淋醋和酱油', '拌匀即食'],
      tags: ['快手菜', '低卡']
    },
    {
      name: '胡萝卜炒鸡蛋', ingredients: ['胡萝卜', '鸡蛋'],
      difficulty: '简单', cookingTime: 10, calories: 200,
      steps: ['胡萝卜切丝', '鸡蛋打散', '炒鸡蛋盛出', '炒胡萝卜至软', '加入鸡蛋翻炒'],
      tags: ['快手菜', '家常']
    },
    {
      name: '水果酸奶碗', ingredients: ['酸奶', '蓝莓', '草莓'],
      difficulty: '简单', cookingTime: 5, calories: 150,
      steps: ['酸奶倒入碗中', '水果洗净摆盘', '淋上蜂蜜', '撒上坚果碎'],
      tags: ['早餐', '低卡']
    },
    {
      name: '洋葱炒牛肉', ingredients: ['牛肉', '洋葱'],
      difficulty: '中等', cookingTime: 20, calories: 380,
      steps: ['牛肉切片腌制', '洋葱切丝', '大火快炒牛肉', '加入洋葱翻炒', '调味出锅'],
      tags: ['家常', '高蛋白']
    },
    {
      name: '蘑菇鸡蛋汤', ingredients: ['蘑菇', '鸡蛋'],
      difficulty: '简单', cookingTime: 15, calories: 120,
      steps: ['蘑菇切片', '鸡蛋打散', '姜片爆香', '加水煮开放蘑菇', '淋入蛋液', '调味出锅'],
      tags: ['清淡', '汤品']
    },
    {
      name: '糖醋里脊', ingredients: ['猪里脊', '醋'],
      difficulty: '中等', cookingTime: 25, calories: 400,
      steps: ['里脊切条裹粉', '炸至金黄', '调糖醋汁', '翻炒裹汁出锅'],
      tags: ['硬菜', '下饭']
    },
    {
      name: '番茄牛腩煲', ingredients: ['牛肉', '番茄'],
      difficulty: '中等', cookingTime: 60, calories: 450,
      steps: ['牛腩切块焯水', '番茄切块', '炒番茄出汁', '加入牛腩炖煮50分钟', '调味出锅'],
      tags: ['硬菜', '汤品']
    }
  ]

  // 根据 prompt 中的食材匹配
  const matched = mockPool.filter(recipe =>
    recipe.ingredients.some(i => foodNames.some(f => f.includes(i) || i.includes(f)))
  )

  const result = matched.length >= 3 ? matched.slice(0, 3) : [
    ...matched,
    ...mockPool.filter(r => !matched.includes(r)).slice(0, 3 - matched.length)
  ]

  return result.map((r, i) => ({
    id: `ai_recipe_${Date.now()}_${i}`,
    ...r,
    imageEmoji: getEmoji(r.name),
    reason: getReason(r.ingredients, foodNames)
  }))
}

/**
 * 根据菜名获取 emoji
 * @param {string} name 菜名
 * @returns {string}
 */
function getEmoji(name) {
  const map = {
    '番茄炒蛋': '🍅',
    '蒜蓉西兰花': '🥦',
    '红烧排骨': '🍖',
    '虾仁滑蛋': '🦐',
    '青椒肉丝': '🫑',
    '白菜豆腐汤': '🥣',
    '可乐鸡翅': '🍗',
    '蒜蓉蒸虾': '🦐',
    '凉拌黄瓜': '🥒',
    '胡萝卜炒鸡蛋': '🥕',
    '水果酸奶碗': '🥗',
    '洋葱炒牛肉': '🥩',
    '蘑菇鸡蛋汤': '🍄',
    '糖醋里脊': '🍖',
    '番茄牛腩煲': '🍲'
  }
  return map[name] || '🍳'
}

/**
 * 生成推荐理由
 * @param {Array} recipeIngredients 菜谱食材
 * @param {Array} userFoods 用户食材
 * @returns {string}
 */
function getReason(recipeIngredients, userFoods) {
  const used = recipeIngredients.filter(i =>
    userFoods.some(f => f.includes(i) || i.includes(f))
  )
  return `使用冰箱现有的${used.join('、')}，简单又美味`
}

/**
 * 评分菜谱（根据食材匹配度、营养、难度、季节性、用户偏好）
 * @param {object} recipe 菜谱对象
 * @param {Array} foods 用户冰箱食材列表
 * @returns {object} 带评分的菜谱（matchScore, nutritionScore, difficultyScore, totalScore, usesExpiring）
 */
function scoreRecipe(recipe, foods) {
  const foodNames = foods.map(f => f.name)

  // 食材匹配度评分（0-100）
  const matchCount = recipe.ingredients.filter(i =>
    foodNames.some(f => f.includes(i) || i.includes(f))
  ).length
  const matchScore = Math.round((matchCount / recipe.ingredients.length) * 100)

  // 营养评分（根据热量，越低越好，满分100）
  let nutritionScore = 100
  if (recipe.calories > 500) nutritionScore = 40
  else if (recipe.calories > 400) nutritionScore = 60
  else if (recipe.calories > 300) nutritionScore = 75
  else if (recipe.calories > 200) nutritionScore = 85

  // 难度评分（越简单越好）
  const difficultyMap = { '简单': 100, '中等': 70, '困难': 40 }
  const difficultyScore = difficultyMap[recipe.difficulty] || 70

  // 即将过期食材加分（使用 date-utils 共享逻辑）
  const expiringFoodNames = foods
    .filter(f => isExpiringSoon(f.expiryDate))
    .map(f => f.name)
  const usesExpiring = recipe.ingredients.some(i =>
    expiringFoodNames.some(e => e.includes(i) || i.includes(e))
  )
  const expiryBonus = usesExpiring ? 15 : 0

  // 季节性加分：菜谱使用的应季食材越多，加分越高
  const season = getCurrentSeason()
  const seasonal = SEASONAL_INGREDIENTS[season] || []
  const seasonalMatchCount = recipe.ingredients.filter(i =>
    seasonal.some(s => s.includes(i) || i.includes(s))
  ).length
  const seasonalBonus = Math.min(10, seasonalMatchCount * 5)

  // 用户偏好加分：菜谱标签命中用户偏好标签越多，加分越高
  const prefs = loadUserPrefs()
  const prefMatchCount = (recipe.tags || []).filter(t =>
    prefs.likedTags.includes(t)
  ).length
  const prefBonus = Math.min(10, prefMatchCount * 3)

  // 综合评分（加权平均 + 额外加分，上限 100）
  const totalScore = Math.min(100, Math.round(
    matchScore * 0.35 + nutritionScore * 0.15 + difficultyScore * 0.15
    + expiryBonus + seasonalBonus + prefBonus
  ))

  return {
    ...recipe,
    matchScore,
    nutritionScore,
    difficultyScore,
    seasonalBonus,
    prefBonus,
    totalScore,
    usesExpiring
  }
}

/**
 * In-memory TTL cache for generated recipes.
 * @private
 */
const CACHE_KEY = 'ai_recipe_cache'

/**
 * Retrieve a cached recipe result by key, if still within TTL.
 * @param {string} cacheKey - The cache lookup key
 * @returns {Array|null} Cached recipe array, or null if expired / missing
 */
function getCachedRecipe(cacheKey) {
  const cache = storage.get(CACHE_KEY, {})
  const item = cache[cacheKey]
  if (item && Date.now() - item.timestamp < AI_CONFIG.cacheTTL) {
    return item.data
  }
  return null
}

/**
 * Store a recipe result in the TTL cache and purge expired entries.
 * @param {string} cacheKey - The cache key
 * @param {Array} data - Recipe data to cache
 */
function setCachedRecipe(cacheKey, data) {
  const cache = storage.get(CACHE_KEY, {})
  cache[cacheKey] = { data, timestamp: Date.now() }
  // 清理过期缓存
  const now = Date.now()
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > AI_CONFIG.cacheTTL) delete cache[key]
  })
  storage.set(CACHE_KEY, cache)
}

/**
 * 生成缓存 key
 * @param {Array} foods 食材列表
 * @param {object} options 选项
 * @returns {string}
 */
function generateCacheKey(foods, options) {
  const foodNames = foods.map(f => f.name).sort().join(',')
  const optStr = JSON.stringify(options || {})
  return `recipe_${foodNames}_${optStr}`
}

/**
 * 主入口：根据冰箱食材生成菜谱
 * @param {Array} foods 冰箱食材列表
 * @param {object} options 选项（cuisine, maxTime, calorieLimit）
 * @returns {Promise<Array>} 按综合评分降序排列的菜谱列表
 */
async function generateRecipes(foods, options = {}) {
  // 检查缓存
  const cacheKey = generateCacheKey(foods, options)
  const cached = getCachedRecipe(cacheKey)
  if (cached) {
    return cached
  }

  // 构建 prompt 并调用 AI（带错误回退）
  const prompt = buildRecipePrompt(foods, options)
  let recipes
  try {
    recipes = await callAIAPI(prompt)
  } catch (err) {
    // AI 调用失败时降级到 mock 数据
    console.warn('[ai-recipe-engine] API 调用失败，使用 mock 数据:', err.message)
    recipes = generateMockRecipes(prompt)
  }

  // 评分并排序
  const scored = recipes.map(r => scoreRecipe(r, foods))
  scored.sort((a, b) => b.totalScore - a.totalScore)

  // 写入缓存
  setCachedRecipe(cacheKey, scored)

  return scored
}

module.exports = {
  AI_CONFIG,
  buildRecipePrompt,
  callAIAPI,
  callAIStream,
  generateMockRecipes,
  scoreRecipe,
  getCachedRecipe,
  setCachedRecipe,
  generateCacheKey,
  generateRecipes,
  getCurrentSeason,
  SEASONAL_INGREDIENTS,
  loadUserPrefs,
  saveUserPrefs,
  recordUserLike
}
