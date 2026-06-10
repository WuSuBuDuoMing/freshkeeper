/**
 * 菜谱服务 - AI 菜谱推荐 mock
 * 基于冰箱现有食材生成菜谱推荐
 */
const storage = require('../utils/storage-utils')
const { generateId, randomPick, randomPickN } = require('../utils/mock-utils')
const foodService = require('./food-service')

const STORAGE_KEY = 'recipes'

/**
 * 初始化 mock 菜谱数据
 */
function initRecipeData() {
  const existing = storage.get(STORAGE_KEY)
  if (existing && existing.length > 0) return
  storage.set(STORAGE_KEY, generateMockRecipes())
}

/**
 * 获取所有菜谱
 * @returns {Array}
 */
function getAllRecipes() {
  return storage.get(STORAGE_KEY, [])
}

/**
 * 根据冰箱食材推荐菜谱
 * @returns {Array}
 */
function getRecommendRecipes() {
  const foods = foodService.getAllFoods().filter(f => f.status !== 'used')
  const foodNames = foods.map(f => f.name)
  const recipes = getAllRecipes()

  // 标记每个菜谱的匹配度
  const scored = recipes.map(recipe => {
    const usedInFridge = recipe.ingredients.filter(i => foodNames.includes(i))
    const missing = recipe.ingredients.filter(i => !foodNames.includes(i))
    const score = usedInFridge.length / recipe.ingredients.length

    // 优先使用即将过期食材
    const expiringFoods = foodService.getExpiringFoods(3).map(f => f.name)
    const usesExpiring = recipe.ingredients.some(i => expiringFoods.includes(i))

    return {
      ...recipe,
      usedIngredients: usedInFridge,
      missingIngredients: missing,
      matchScore: usesExpiring ? score + 0.3 : score,
      usesExpiring,
      reason: usesExpiring
        ? `优先使用即将过期的${recipe.ingredients.filter(i => expiringFoods.includes(i)).join('、')}`
        : `使用冰箱现有的${usedInFridge.join('、')}`
    }
  })

  // 按匹配度排序
  scored.sort((a, b) => b.matchScore - a.matchScore)

  return scored.map(r => ({
    id: r.id,
    name: r.name,
    usedIngredients: r.usedIngredients,
    missingIngredients: r.missingIngredients,
    difficulty: r.difficulty,
    cookingTime: r.cookingTime,
    calories: r.calories,
    reason: r.reason,
    steps: r.steps,
    imageEmoji: r.imageEmoji,
    tags: r.tags
  }))
}

/**
 * 获取一周菜单推荐
 * @returns {Array<{date: string, weekday: string, meals: {breakfast: object, lunch: object, dinner: object}}>}
 */
function getWeeklyMenu() {
  const recipes = getRecommendRecipes()
  const { getWeekDates } = require('../utils/date-utils')
  const weekDates = getWeekDates()

  const breakfastRecipes = recipes.filter(r => r.tags && r.tags.includes('早餐'))
  const lunchRecipes = recipes.filter(r => r.tags && r.tags.includes('午餐'))
  const dinnerRecipes = recipes.filter(r => r.tags && r.tags.includes('晚餐'))

  const allRecipes = recipes.length > 0 ? recipes : getAllRecipes()
  const breakfast = breakfastRecipes.length > 0 ? breakfastRecipes : allRecipes.slice(0, 7)
  const lunch = lunchRecipes.length > 0 ? lunchRecipes : allRecipes.slice(0, 7)
  const dinner = dinnerRecipes.length > 0 ? dinnerRecipes : allRecipes.slice(0, 7)

  return weekDates.map((d, i) => ({
    date: d.date,
    weekday: d.weekday,
    short: d.short,
    isToday: d.isToday,
    month: d.month,
    day: d.day,
    meals: {
      breakfast: breakfast[i % breakfast.length],
      lunch: lunch[i % lunch.length],
      dinner: dinner[i % dinner.length]
    }
  }))
}

/**
 * 重新生成某一天的菜单
 * @param {string} date
 * @returns {object}
 */
function regenerateDayMenu(date) {
  const recipes = getRecommendRecipes()
  const randomRecipes = randomPickN(recipes, 3)
  return {
    date,
    meals: {
      breakfast: randomRecipes[0] || recipes[0],
      lunch: randomRecipes[1] || recipes[1],
      dinner: randomRecipes[2] || recipes[2]
    }
  }
}

/**
 * 生成 20 条 mock 菜谱
 */
function generateMockRecipes() {
  return [
    {
      id: 'recipe_001',
      name: '番茄鸡蛋面',
      ingredients: ['番茄', '鸡蛋', '面条'],
      difficulty: '简单',
      cookingTime: 15,
      calories: 350,
      steps: ['烧水煮面', '番茄切块', '炒鸡蛋备用', '炒番茄出汁', '加入面条和鸡蛋', '调味出锅'],
      imageEmoji: '🍜',
      tags: ['午餐', '快手菜']
    },
    {
      id: 'recipe_002',
      name: '西兰花炒虾仁',
      ingredients: ['西兰花', '虾', '大蒜'],
      difficulty: '中等',
      cookingTime: 20,
      calories: 280,
      steps: ['虾仁去虾线腌制', '西兰花掰小朵焯水', '热锅凉油炒虾仁', '加入西兰花翻炒', '调味出锅'],
      imageEmoji: '🥦',
      tags: ['午餐', '低卡']
    },
    {
      id: 'recipe_003',
      name: '红烧排骨',
      ingredients: ['排骨', '土豆', '姜'],
      difficulty: '中等',
      cookingTime: 45,
      calories: 520,
      steps: ['排骨焯水', '炒糖色', '加入排骨翻炒', '加水炖煮30分钟', '加入土豆块', '收汁出锅'],
      imageEmoji: '🍖',
      tags: ['晚餐', '硬菜']
    },
    {
      id: 'recipe_004',
      name: '水果沙拉',
      ingredients: ['苹果', '草莓', '酸奶'],
      difficulty: '简单',
      cookingTime: 5,
      calories: 150,
      steps: ['水果洗净切块', '倒入酸奶', '轻轻搅拌', '冷藏后食用'],
      imageEmoji: '🥗',
      tags: ['早餐', '低卡']
    },
    {
      id: 'recipe_005',
      name: '可乐鸡翅',
      ingredients: ['鸡腿', '可乐'],
      difficulty: '简单',
      cookingTime: 30,
      calories: 420,
      steps: ['鸡翅划刀腌制', '煎至两面金黄', '倒入可乐没过鸡翅', '大火烧开转小火', '收汁出锅'],
      imageEmoji: '🍗',
      tags: ['午餐', '家常']
    },
    {
      id: 'recipe_006',
      name: '牛肉炒青椒',
      ingredients: ['牛肉', '青椒', '大蒜'],
      difficulty: '中等',
      cookingTime: 15,
      calories: 380,
      steps: ['牛肉切片腌制', '青椒切丝', '大火快炒牛肉', '加入青椒翻炒', '调味出锅'],
      imageEmoji: '🥩',
      tags: ['午餐', '家常']
    },
    {
      id: 'recipe_007',
      name: '蒜蓉蒸虾',
      ingredients: ['虾', '大蒜', '酱油'],
      difficulty: '简单',
      cookingTime: 15,
      calories: 180,
      steps: ['虾开背去虾线', '蒜蓉铺在虾上', '淋上酱油', '上锅蒸8分钟', '热油浇上'],
      imageEmoji: '🦐',
      tags: ['晚餐', '海鲜']
    },
    {
      id: 'recipe_008',
      name: '五花肉炒土豆片',
      ingredients: ['五花肉', '土豆', '酱油'],
      difficulty: '简单',
      cookingTime: 20,
      calories: 450,
      steps: ['五花肉切片', '土豆切薄片', '煎五花肉出油', '加入土豆片翻炒', '调味出锅'],
      imageEmoji: '🥔',
      tags: ['午餐', '家常']
    },
    {
      id: 'recipe_009',
      name: '鸡蛋三明治',
      ingredients: ['鸡蛋', '面包', '奶酪片'],
      difficulty: '简单',
      cookingTime: 10,
      calories: 320,
      steps: ['煎鸡蛋', '面包烤一下', '放上奶酪片', '夹入煎蛋', '切半装盘'],
      imageEmoji: '🥪',
      tags: ['早餐', '快手菜']
    },
    {
      id: 'recipe_010',
      name: '凉拌菠菜',
      ingredients: ['菠菜', '大蒜', '醋'],
      difficulty: '简单',
      cookingTime: 10,
      calories: 80,
      steps: ['菠菜焯水', '切段装盘', '蒜末铺上', '淋醋和酱油', '拌匀食用'],
      imageEmoji: '🥬',
      tags: ['午餐', '低卡']
    },
    {
      id: 'recipe_011',
      name: '白菜豆腐汤',
      ingredients: ['白菜', '豆腐', '姜'],
      difficulty: '简单',
      cookingTime: 15,
      calories: 120,
      steps: ['白菜切段', '豆腐切块', '姜片爆香', '加入白菜翻炒', '加水煮开放入豆腐', '调味出锅'],
      imageEmoji: '🥣',
      tags: ['晚餐', '清淡']
    },
    {
      id: 'recipe_012',
      name: '洋葱炒鸡蛋',
      ingredients: ['洋葱', '鸡蛋'],
      difficulty: '简单',
      cookingTime: 10,
      calories: 250,
      steps: ['洋葱切丝', '鸡蛋打散', '炒鸡蛋盛出', '炒洋葱至软', '加入鸡蛋翻炒'],
      imageEmoji: '🧅',
      tags: ['午餐', '快手菜']
    },
    {
      id: 'recipe_013',
      name: '烤三文鱼',
      ingredients: ['三文鱼', '柠檬'],
      difficulty: '中等',
      cookingTime: 25,
      calories: 300,
      steps: ['三文鱼抹盐腌制', '柠檬切片', '铺上柠檬片', '烤箱200度烤20分钟', '撒黑胡椒'],
      imageEmoji: '🐟',
      tags: ['晚餐', '健康']
    },
    {
      id: 'recipe_014',
      name: '红烧带鱼',
      ingredients: ['带鱼', '姜', '醋', '酱油'],
      difficulty: '中等',
      cookingTime: 30,
      calories: 350,
      steps: ['带鱼切段腌制', '裹粉煎至金黄', '加姜片和调料', '加水炖煮', '收汁出锅'],
      imageEmoji: '🐟',
      tags: ['晚餐', '家常']
    },
    {
      id: 'recipe_015',
      name: '咖喱牛肉饭',
      ingredients: ['牛肉', '土豆', '胡萝卜', '洋葱'],
      difficulty: '中等',
      cookingTime: 40,
      calories: 550,
      steps: ['牛肉切块焯水', '土豆胡萝卜切块', '洋葱炒香', '加入牛肉翻炒', '加水炖煮20分钟', '加入咖喱块煮化', '浇在米饭上'],
      imageEmoji: '🍛',
      tags: ['午餐', '硬菜']
    },
    {
      id: 'recipe_016',
      name: '青椒肉丝',
      ingredients: ['猪肉', '青椒', '大蒜'],
      difficulty: '简单',
      cookingTime: 15,
      calories: 380,
      steps: ['猪肉切丝腌制', '青椒切丝', '大火炒肉丝', '加入青椒翻炒', '调味出锅'],
      imageEmoji: '🫑',
      tags: ['午餐', '家常']
    },
    {
      id: 'recipe_017',
      name: '蘑菇鸡蛋汤',
      ingredients: ['蘑菇', '鸡蛋', '姜'],
      difficulty: '简单',
      cookingTime: 15,
      calories: 120,
      steps: ['蘑菇切片', '鸡蛋打散', '姜片爆香', '加水煮开', '放入蘑菇', '淋入蛋液', '调味出锅'],
      imageEmoji: '🍄',
      tags: ['晚餐', '清淡']
    },
    {
      id: 'recipe_018',
      name: '香蕉奶昔',
      ingredients: ['香蕉', '酸奶', '牛奶'],
      difficulty: '简单',
      cookingTime: 5,
      calories: 200,
      steps: ['香蕉去皮切段', '放入搅拌机', '加入酸奶和牛奶', '搅拌均匀', '倒入杯中'],
      imageEmoji: '🍌',
      tags: ['早餐', '饮品']
    },
    {
      id: 'recipe_019',
      name: '蒜蓉西兰花',
      ingredients: ['西兰花', '大蒜', '食用油'],
      difficulty: '简单',
      cookingTime: 10,
      calories: 80,
      steps: ['西兰花掰小朵焯水', '大蒜切末', '热锅凉油炒蒜末', '加入西兰花翻炒', '调味出锅'],
      imageEmoji: '🥦',
      tags: ['午餐', '低卡']
    },
    {
      id: 'recipe_020',
      name: '羊肉火锅',
      ingredients: ['羊肉卷', '白菜', '豆腐', '粉丝'],
      difficulty: '简单',
      cookingTime: 30,
      calories: 600,
      steps: ['准备火锅底料', '烧开汤底', '涮羊肉卷', '涮蔬菜和豆腐', '蘸料食用'],
      imageEmoji: '🍲',
      tags: ['晚餐', '聚餐']
    }
  ]
}

module.exports = {
  initRecipeData,
  getAllRecipes,
  getRecommendRecipes,
  getWeeklyMenu,
  regenerateDayMenu
}
