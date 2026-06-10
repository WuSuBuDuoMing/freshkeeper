/**
 * AI 菜谱生成引擎
 * 支持真实 API 和 mock 两种模式
 */
const storage = require('../utils/storage-utils')

// AI 配置
const AI_CONFIG = {
  useRealAPI: false, // 开关：切换真实 API / mock
  apiEndpoint: '',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.8
}

/**
 * 构建菜谱生成 prompt
 * @param {Array} foods 冰箱食材列表
 * @param {object} options 额外选项
 * @returns {string}
 */
function buildRecipePrompt(foods, options = {}) {
  const foodList = foods.map(f => `${f.name}(${f.quantity}${f.unit})`).join('、')
  const expiringFoods = foods.filter(f => {
    const days = Math.ceil((new Date(f.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 3
  }).map(f => f.name)

  let prompt = '你是一位专业的中餐厨师。请根据以下冰箱食材推荐菜谱。\n\n'
  prompt += `现有食材：${foodList}\n`

  if (expiringFoods.length > 0) {
    prompt += `以下食材即将过期，请优先使用：${expiringFoods.join('、')}\n`
  }

  prompt += '\n请推荐 3 道菜谱，每道菜包含以下信息（JSON 格式）：\n'
  prompt += '[\n  {\n'
  prompt += '    "name": "菜名",\n'
  prompt += '    "ingredients": ["食材1", "食材2"],\n'
  prompt += '    "missingIngredients": ["缺少的食材"],\n'
  prompt += '    "difficulty": "简单/中等/困难",\n'
  prompt += '    "cookingTime": 分钟数,\n'
  prompt += '    "calories": 热量,\n'
  prompt += '    "steps": ["步骤1", "步骤2"],\n'
  prompt += '    "reason": "推荐理由",\n'
  prompt += '    "tags": ["标签"]\n'
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
    '青椒肉丝': '🫑'
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
 * 评分菜谱（根据食材匹配度、营养、难度）
 * @param {object} recipe 菜谱
 * @param {Array} foods 用户食材
 * @returns {object} 带评分的菜谱
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

  // 即将过期食材加分
  const expiringFoods = foods.filter(f => {
    const days = Math.ceil((new Date(f.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 3
  }).map(f => f.name)
  const usesExpiring = recipe.ingredients.some(i =>
    expiringFoods.some(e => e.includes(i) || i.includes(e))
  )
  const expiryBonus = usesExpiring ? 15 : 0

  // 综合评分（加权平均）
  const totalScore = Math.min(100, Math.round(
    matchScore * 0.4 + nutritionScore * 0.2 + difficultyScore * 0.2 + expiryBonus
  ))

  return {
    ...recipe,
    matchScore,
    nutritionScore,
    difficultyScore,
    totalScore,
    usesExpiring
  }
}

/**
 * 缓存管理
 */
const CACHE_KEY = 'ai_recipe_cache'
const CACHE_TTL = 30 * 60 * 1000 // 30分钟

function getCachedRecipe(cacheKey) {
  const cache = storage.get(CACHE_KEY, {})
  const item = cache[cacheKey]
  if (item && Date.now() - item.timestamp < CACHE_TTL) {
    return item.data
  }
  return null
}

function setCachedRecipe(cacheKey, data) {
  const cache = storage.get(CACHE_KEY, {})
  cache[cacheKey] = { data, timestamp: Date.now() }
  // 清理过期缓存
  Object.keys(cache).forEach(key => {
    if (Date.now() - cache[key].timestamp > CACHE_TTL) delete cache[key]
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
 * @returns {Promise<Array>}
 */
async function generateRecipes(foods, options = {}) {
  // 检查缓存
  const cacheKey = generateCacheKey(foods, options)
  const cached = getCachedRecipe(cacheKey)
  if (cached) {
    return cached
  }

  // 构建 prompt 并调用 AI
  const prompt = buildRecipePrompt(foods, options)
  const recipes = await callAIAPI(prompt)

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
  generateRecipes
}
