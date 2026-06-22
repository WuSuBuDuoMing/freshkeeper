/**
 * @file Nutrition Tracking Service
 * @description Tracks food nutritional information and daily intake, providing
 *   nutrition analysis, weekly reports, and dietary advice. Uses a built-in
 *   nutrition database for common Chinese ingredients.
 * @module services/nutrition-service
 * @version 2.15.0
 */

const storage = require('../utils/storage-utils')

/**
 * 营养数据库（Mock）
 * 每项包含热量(kcal)、蛋白质(g)、脂肪(g)、碳水(g)、膳食纤维(g) 和参考单位
 * @type {Object<string, Object>}
 */
const NUTRITION_DB = {
  '鸡蛋': { calories: 72, protein: 6.3, fat: 5, carbs: 0.6, fiber: 0, unit: '个(50g)' },
  '番茄': { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2, unit: '个(150g)' },
  '鸡胸肉': { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, unit: '100g' },
  '牛肉': { calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0, unit: '100g' },
  '米饭': { calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4, unit: '100g' },
  '西兰花': { calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6, unit: '100g' },
  '苹果': { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4, unit: '个(200g)' },
  '牛奶': { calories: 42, protein: 3.4, fat: 1, carbs: 5, fiber: 0, unit: '100ml' },
  '面包': { calories: 265, protein: 9, fat: 3.2, carbs: 49, fiber: 2.7, unit: '100g' },
  '虾': { calories: 99, protein: 20.4, fat: 1.7, carbs: 0.2, fiber: 0, unit: '100g' },
  '豆腐': { calories: 76, protein: 8, fat: 4.8, carbs: 1.9, fiber: 0.3, unit: '100g' },
  '面条': { calories: 138, protein: 4.5, fat: 0.6, carbs: 27, fiber: 1.2, unit: '100g' },
  '香蕉': { calories: 89, protein: 1.1, fat: 0.3, carbs: 23, fiber: 2.6, unit: '根(120g)' },
  '五花肉': { calories: 395, protein: 14, fat: 37, carbs: 0, fiber: 0, unit: '100g' },
  '菠菜': { calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, unit: '100g' }
}

/**
 * 每日营养摄入记录存储键
 * @type {string}
 * @private
 */
const DAILY_LOG_KEY = 'nutrition_daily_log'

/**
 * 获取食材营养信息
 * @param {string} foodName - 食材名称
 * @returns {Object|null} 营养信息对象，未找到返回 null
 *
 * @example
 * const info = nutritionService.getNutritionInfo('鸡胸肉')
 * // => { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, unit: '100g' }
 */
function getNutritionInfo(foodName) {
  return NUTRITION_DB[foodName] || null
}

/**
 * 计算一道菜的总营养成分
 * @param {Array<{name: string, amount: number}>} ingredients - 食材列表，amount 单位为克
 * @returns {Object} 总营养信息，含各项详情
 *
 * @example
 * const result = nutritionService.calculateRecipeNutrition([
 *   { name: '鸡胸肉', amount: 200 },
 *   { name: '西兰花', amount: 100 }
 * ])
 * // => { calories: 364, protein: 64.8, ..., details: [...] }
 */
function calculateRecipeNutrition(ingredients) {
  let totalCalories = 0
  let totalProtein = 0
  let totalFat = 0
  let totalCarbs = 0
  let totalFiber = 0
  const details = []

  ingredients.forEach(ing => {
    const nutrition = getNutritionInfo(ing.name)
    if (nutrition) {
      const multiplier = (ing.amount || 100) / 100
      totalCalories += nutrition.calories * multiplier
      totalProtein += nutrition.protein * multiplier
      totalFat += nutrition.fat * multiplier
      totalCarbs += nutrition.carbs * multiplier
      totalFiber += nutrition.fiber * multiplier
      details.push({ name: ing.name, ...nutrition })
    }
  })

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    details
  }
}

/**
 * 记录一餐饮食摄入
 * @param {string} date - 日期，格式 YYYY-MM-DD
 * @param {Object} meal - 餐食信息
 * @param {string} meal.name - 餐次名称（如"早餐""午餐"）
 * @param {Array} [meal.foods] - 食材列表
 * @param {Object} [meal.nutrition] - 该餐营养数据
 *
 * @example
 * nutritionService.logMeal('2026-06-08', {
 *   name: '午餐',
 *   foods: [{ name: '鸡胸肉', amount: 150 }],
 *   nutrition: { calories: 248, protein: 46.5, fat: 5.4, carbs: 0 }
 * })
 */
function logMeal(date, meal) {
  const logs = storage.get(DAILY_LOG_KEY, {})
  if (!logs[date]) logs[date] = []
  logs[date].push({
    id: `meal_${Date.now()}`,
    ...meal,
    timestamp: new Date().toISOString()
  })
  storage.set(DAILY_LOG_KEY, logs)
}

/**
 * 获取某日的总摄入汇总
 * @param {string} date - 日期，格式 YYYY-MM-DD
 * @returns {Object} 包含 meals 列表、total 汇总和 targets 推荐值
 *
 * @example
 * const daily = nutritionService.getDailyIntake('2026-06-08')
 * console.log(daily.total.calories, '/', daily.targets.calories)
 */
function getDailyIntake(date) {
  const logs = storage.get(DAILY_LOG_KEY, {})
  const meals = logs[date] || []

  let totalCalories = 0
  let totalProtein = 0
  let totalFat = 0
  let totalCarbs = 0

  meals.forEach(meal => {
    if (meal.nutrition) {
      totalCalories += meal.nutrition.calories || 0
      totalProtein += meal.nutrition.protein || 0
      totalFat += meal.nutrition.fat || 0
      totalCarbs += meal.nutrition.carbs || 0
    }
  })

  return {
    date,
    meals,
    total: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10
    },
    targets: {
      calories: 2000,
      protein: 60,
      fat: 65,
      carbs: 300
    }
  }
}

/**
 * 获取近 7 天营养周报
 * @returns {Array<Object>} 每天一条记录，含 date/label/weekday/calories/protein/fat/carbs
 *
 * @example
 * const report = nutritionService.getWeeklyNutritionReport()
 * report.forEach(d => console.log(`${d.label} ${d.weekday}: ${d.calories}kcal`))
 */
function getWeeklyNutritionReport() {
  const report = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const daily = getDailyIntake(dateStr)
    report.push({
      date: dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      weekday: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      ...daily.total
    })
  }
  return report
}

/**
 * 获取营养饮食建议
 * @returns {Array<Object>} 建议列表，每项含 type/text/icon
 *
 * @example
 * const advice = nutritionService.getNutritionAdvice()
 * advice.forEach(a => console.log(`${a.icon} ${a.text}`))
 */
function getNutritionAdvice() {
  return [
    { type: 'protein', text: '蛋白质摄入偏低，建议增加鸡胸肉、鱼虾等高蛋白食材', icon: '💪' },
    { type: 'fiber', text: '膳食纤维不足，建议多吃蔬菜水果', icon: '🥦' },
    { type: 'variety', text: '食材种类丰富，保持均衡饮食！', icon: '👍' },
    { type: 'hydration', text: '记得多喝水，每天至少 8 杯', icon: '💧' }
  ]
}

module.exports = {
  NUTRITION_DB,
  getNutritionInfo,
  calculateRecipeNutrition,
  logMeal,
  getDailyIntake,
  getWeeklyNutritionReport,
  getNutritionAdvice
}
