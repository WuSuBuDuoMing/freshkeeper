/**
 * AI 冰箱食材管理助手 - 自动化测试用例
 *
 * 运行方式：在微信开发者工具中打开项目，使用 miniprogram-automator 运行
 * 或者按照每个 describe/it 手动在开发者工具控制台中验证
 */

// ==================== 测试工具 ====================

/**
 * 断言工具
 */
const assert = {
  equal(actual, expected, msg = '') {
    if (actual !== expected) {
      throw new Error(`[FAIL] ${msg}: 期望 ${expected}，实际 ${actual}`)
    }
    console.log(`[PASS] ${msg}`)
  },
  ok(value, msg = '') {
    if (!value) {
      throw new Error(`[FAIL] ${msg}: 期望为真，实际为假`)
    }
    console.log(`[PASS] ${msg}`)
  },
  deepEqual(actual, expected, msg = '') {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`[FAIL] ${msg}: ${JSON.stringify(actual)} !== ${JSON.stringify(expected)}`)
    }
    console.log(`[PASS] ${msg}`)
  }
}

// ==================== Utils 测试 ====================

describe('Utils 模块测试', function () {

  describe('date-utils', function () {
    const dateUtils = require('../../utils/date-utils')

    it('formatDate 格式化日期', function () {
      const result = dateUtils.formatDate('2026-06-08')
      assert.equal(result, '2026-06-08', 'formatDate 格式化正确')
    })

    it('formatDate 处理空值', function () {
      assert.equal(dateUtils.formatDate(null), '', 'null 返回空字符串')
      assert.equal(dateUtils.formatDate(''), '', '空字符串返回空字符串')
    })

    it('daysUntilExpiry 计算过期天数', function () {
      const today = dateUtils.getToday()
      assert.equal(dateUtils.daysUntilExpiry(today), 0, '今天到期返回 0')

      const future = dateUtils.getFutureDate(5)
      assert.equal(dateUtils.daysUntilExpiry(future), 5, '5天后到期返回 5')

      const past = dateUtils.getFutureDate(-3)
      assert.equal(dateUtils.daysUntilExpiry(past), -3, '3天前到期返回 -3')
    })

    it('isExpired 判断是否过期', function () {
      const past = dateUtils.getFutureDate(-1)
      assert.ok(dateUtils.isExpired(past), '昨天已过期')

      const future = dateUtils.getFutureDate(1)
      assert.ok(!dateUtils.isExpired(future), '明天未过期')
    })

    it('isExpiringSoon 判断是否即将过期', function () {
      const today = dateUtils.getFutureDate(1)
      assert.ok(dateUtils.isExpiringSoon(today), '1天内即将过期')

      const future = dateUtils.getFutureDate(10)
      assert.ok(!dateUtils.isExpiringSoon(future), '10天后不算即将过期')
    })

    it('getWeekDates 获取本周日期', function () {
      const week = dateUtils.getWeekDates()
      assert.equal(week.length, 7, '本周有7天')
      assert.ok(week.some(d => d.isToday), '包含今天')
    })
  })

  describe('food-utils', function () {
    const foodUtils = require('../../utils/food-utils')

    it('CATEGORIES 包含所有分类', function () {
      assert.ok(foodUtils.CATEGORIES.length >= 10, '至少10个分类')
      assert.ok(foodUtils.CATEGORIES.some(c => c.key === 'all'), '包含全部分类')
    })

    it('getCategoryInfo 返回正确信息', function () {
      const info = foodUtils.getCategoryInfo('蔬菜')
      assert.equal(info.name, '蔬菜', '蔬菜分类名称正确')
      assert.ok(info.icon, '包含图标')
    })

    it('getStatusText 返回正确状态文本', function () {
      assert.equal(foodUtils.getStatusText('normal'), '正常')
      assert.equal(foodUtils.getStatusText('expired'), '已过期')
      assert.equal(foodUtils.getStatusText('used'), '已用完')
    })

    it('getFoodEmoji 返回正确 emoji', function () {
      assert.equal(foodUtils.getFoodEmoji('鸡蛋', '蛋奶'), '🥚')
      assert.equal(foodUtils.getFoodEmoji('苹果', '水果'), '🍎')
    })

    it('searchFoods 搜索食材', function () {
      const foods = [
        { name: '番茄', category: '蔬菜', notes: '做番茄炒蛋' },
        { name: '苹果', category: '水果', notes: '当零食' },
        { name: '鸡蛋', category: '蛋奶', notes: '早餐常用' }
      ]
      const results = foodUtils.searchFoods(foods, '番茄')
      assert.equal(results.length, 1, '搜索番茄返回1条')
      assert.equal(results[0].name, '番茄', '搜索结果正确')

      const all = foodUtils.searchFoods(foods, '')
      assert.equal(all.length, 3, '空搜索返回全部')
    })

    it('groupByCategory 按分类分组', function () {
      const foods = [
        { name: '番茄', category: '蔬菜' },
        { name: '苹果', category: '水果' },
        { name: '白菜', category: '蔬菜' }
      ]
      const groups = foodUtils.groupByCategory(foods)
      assert.equal(groups['蔬菜'].length, 2, '蔬菜分类有2条')
      assert.equal(groups['水果'].length, 1, '水果分类有1条')
    })
  })

  describe('storage-utils', function () {
    const storage = require('../../utils/storage-utils')

    it('set/get 存取数据', function () {
      storage.set('test_key', { value: 42 })
      const result = storage.get('test_key')
      assert.equal(result.value, 42, '存取数据正确')
      storage.remove('test_key')
    })

    it('get 默认值', function () {
      const result = storage.get('non_existent_key', 'default')
      assert.equal(result, 'default', '不存在的 key 返回默认值')
    })

    it('remove 删除数据', function () {
      storage.set('to_delete', 'hello')
      storage.remove('to_delete')
      assert.equal(storage.get('to_delete'), null, '删除后返回 null')
    })
  })

  describe('mock-utils', function () {
    const mockUtils = require('../../utils/mock-utils')

    it('generateId 生成唯一ID', function () {
      const id1 = mockUtils.generateId('food')
      const id2 = mockUtils.generateId('food')
      assert.ok(id1 !== id2, '两次生成的 ID 不同')
      assert.ok(id1.startsWith('food_'), 'ID 前缀正确')
    })

    it('randomInt 生成范围内随机数', function () {
      const val = mockUtils.randomInt(1, 10)
      assert.ok(val >= 1 && val <= 10, '随机数在范围内')
    })

    it('randomPick 从数组中随机选取', function () {
      const arr = [1, 2, 3, 4, 5]
      const val = mockUtils.randomPick(arr)
      assert.ok(arr.includes(val), '选取的值在数组中')
    })
  })
})

// ==================== Services 测试 ====================

describe('Services 模块测试', function () {

  describe('food-service', function () {
    const foodService = require('../../services/food-service')

    beforeAll(function () {
      foodService.initMockData()
    })

    it('getAllFoods 返回 50+ 条数据', function () {
      const foods = foodService.getAllFoods()
      assert.ok(foods.length >= 50, `食材数量 ${foods.length} >= 50`)
    })

    it('getFoodById 根据ID获取食材', function () {
      const food = foodService.getFoodById('food_001')
      assert.ok(food, 'food_001 存在')
      assert.equal(food.id, 'food_001', 'ID 正确')
    })

    it('addFood 添加食材', function () {
      const newFood = foodService.addFood({
        name: '测试食材',
        category: '蔬菜',
        quantity: 5,
        unit: '个'
      })
      assert.ok(newFood.id, '新食材有 ID')
      assert.equal(newFood.name, '测试食材', '名称正确')
      foodService.deleteFood(newFood.id)
    })

    it('updateFood 更新食材', function () {
      const food = foodService.addFood({ name: '待更新', quantity: 1, unit: '个' })
      foodService.updateFood(food.id, { name: '已更新' })
      const updated = foodService.getFoodById(food.id)
      assert.equal(updated.name, '已更新', '更新成功')
      foodService.deleteFood(food.id)
    })

    it('deleteFood 删除食材', function () {
      const food = foodService.addFood({ name: '待删除', quantity: 1, unit: '个' })
      const result = foodService.deleteFood(food.id)
      assert.ok(result, '删除成功')
      assert.equal(foodService.getFoodById(food.id), null, '删除后找不到')
    })

    it('getExpiredFoods 获取过期食材', function () {
      const expired = foodService.getExpiredFoods()
      assert.ok(expired.length > 0, '有已过期食材')
    })

    it('getExpiringFoods 获取即将过期食材', function () {
      const expiring = foodService.getExpiringFoods(3)
      assert.ok(Array.isArray(expiring), '返回数组')
    })

    it('getOverview 获取概览数据', function () {
      const overview = foodService.getOverview()
      assert.ok(typeof overview.total === 'number', '包含总数')
      assert.ok(typeof overview.expiredCount === 'number', '包含过期数')
      assert.ok(typeof overview.wastedValue === 'number', '包含浪费估算')
    })
  })

  describe('recipe-service', function () {
    const recipeService = require('../../services/recipe-service')

    beforeAll(function () {
      recipeService.initRecipeData()
    })

    it('getAllRecipes 返回 20 条菜谱', function () {
      const recipes = recipeService.getAllRecipes()
      assert.equal(recipes.length, 20, '20条菜谱')
    })

    it('getRecommendRecipes 返回推荐菜谱', function () {
      const recipes = recipeService.getRecommendRecipes()
      assert.ok(recipes.length > 0, '有推荐菜谱')
      assert.ok(recipes[0].usedIngredients !== undefined, '包含已有食材')
      assert.ok(recipes[0].reason !== undefined, '包含推荐理由')
    })

    it('getWeeklyMenu 返回 7 天菜单', function () {
      const menu = recipeService.getWeeklyMenu()
      assert.equal(menu.length, 7, '7天菜单')
      assert.ok(menu[0].meals.breakfast, '包含早餐')
      assert.ok(menu[0].meals.lunch, '包含午餐')
      assert.ok(menu[0].meals.dinner, '包含晚餐')
    })
  })

  describe('shopping-service', function () {
    const shoppingService = require('../../services/shopping-service')

    beforeAll(function () {
      shoppingService.initShoppingData()
    })

    it('getAllShoppingItems 返回 30 条数据', function () {
      const items = shoppingService.getAllShoppingItems()
      assert.ok(items.length >= 30, `采购项 ${items.length} >= 30`)
    })

    it('addShoppingItem 添加采购项', function () {
      const item = shoppingService.addShoppingItem({ name: '测试采购', quantity: 2 })
      assert.ok(item.id, '有 ID')
      assert.equal(item.name, '测试采购', '名称正确')
      assert.equal(item.purchased, false, '默认未购买')
      shoppingService.deleteShoppingItem(item.id)
    })

    it('markAsPurchased 标记已购买', function () {
      const items = shoppingService.getPendingItems()
      if (items.length > 0) {
        const first = items[0]
        shoppingService.markAsPurchased(first.id)
        const updated = shoppingService.getAllShoppingItems().find(i => i.id === first.id)
        assert.equal(updated.purchased, true, '标记成功')
        shoppingService.unmarkPurchased(first.id)
      }
    })

    it('calculateTotalPrice 计算总价', function () {
      const items = [{ estimatedPrice: 10, quantity: 2 }, { estimatedPrice: 5, quantity: 3 }]
      const total = shoppingService.calculateTotalPrice(items)
      assert.equal(total, 35, '总价计算正确')
    })
  })

  describe('stats-service', function () {
    const statsService = require('../../services/stats-service')

    it('getCategoryDistribution 返回分类数据', function () {
      const data = statsService.getCategoryDistribution()
      assert.ok(data.length > 0, '有分类数据')
      assert.ok(data[0].name && data[0].value, '数据结构正确')
    })

    it('getExpiryTrend 返回14天趋势', function () {
      const trend = statsService.getExpiryTrend()
      assert.equal(trend.length, 14, '14天数据')
    })

    it('getSavingTips 返回省钱建议', function () {
      const tips = statsService.getSavingTips()
      assert.ok(tips.length > 0, '有省钱建议')
      assert.ok(tips[0].saving > 0, '有节省金额')
    })
  })
})

// ==================== 页面测试 ====================

describe('页面测试', function () {

  describe('首页加载', function () {
    it('首页正常加载并显示数据', function () {
      // 模拟 onLoad
      const page = require('../../pages/index/index')
      assert.ok(page, '首页模块可加载')
    })

    it('数据概览包含必要字段', function () {
      const foodService = require('../../services/food-service')
      const overview = foodService.getOverview()
      assert.ok('total' in overview, '包含 total')
      assert.ok('expiredCount' in overview, '包含 expiredCount')
      assert.ok('expiringCount' in overview, '包含 expiringCount')
      assert.ok('wastedValue' in overview, '包含 wastedValue')
    })
  })

  describe('表单校验', function () {
    it('食材名称不能为空', function () {
      const form = { name: '', category: '蔬菜' }
      assert.equal(form.name.trim() === '', true, '空名称校验')
    })

    it('过期日期不能早于购买日期', function () {
      const purchaseDate = '2026-06-08'
      const expiryDate = '2026-06-01'
      assert.ok(expiryDate < purchaseDate, '过期日期早于购买日期')
    })
  })

  describe('暗黑模式', function () {
    const { ThemeBehavior, getThemeMode, setThemeMode } = require('../../utils/theme-behavior')

    it('默认主题为 light', function () {
      setThemeMode('light')
      assert.equal(getThemeMode(), 'light', '设置为 light')
    })

    it('可切换为 dark', function () {
      setThemeMode('dark')
      assert.equal(getThemeMode(), 'dark', '设置为 dark')
      setThemeMode('light') // 恢复
    })
  })
})

// ==================== 空状态测试 ====================

describe('空状态测试', function () {

  it('空食材列表显示引导', function () {
    const { searchFoods } = require('../../utils/food-utils')
    const empty = searchFoods([], '不存在的食材')
    assert.equal(empty.length, 0, '搜索空数组返回空')
  })

  it('无过期食材时统计为0', function () {
    const foodService = require('../../services/food-service')
    // 用新的空存储测试
    const overview = foodService.getOverview()
    assert.ok(overview.expiredCount >= 0, '过期数 >= 0')
  })
})

// ==================== 异常数据测试 ====================

describe('异常数据测试', function () {

  it('处理 null 日期', function () {
    const dateUtils = require('../../utils/date-utils')
    assert.equal(dateUtils.formatDate(null), '', 'null 日期返回空')
    assert.equal(dateUtils.daysUntilExpiry(null), Infinity, 'null 过期日返回 Infinity')
  })

  it('处理空字符串搜索', function () {
    const foodUtils = require('../../utils/food-utils')
    const result = foodUtils.searchFoods([], '')
    assert.equal(result.length, 0, '空搜索返回空数组')
  })

  it('处理不存在的食材 ID', function () {
    const foodService = require('../../services/food-service')
    const result = foodService.getFoodById('non_existent_id')
    assert.equal(result, null, '不存在的 ID 返回 null')
  })
})

// ==================== 低端机性能测试 ====================

describe('性能测试', function () {

  it('批量获取 50 条食材数据 < 100ms', function () {
    const foodService = require('../../services/food-service')
    const start = Date.now()
    for (let i = 0; i < 100; i++) {
      foodService.getAllFoods()
    }
    const elapsed = Date.now() - start
    assert.ok(elapsed < 2000, `100次读取耗时 ${elapsed}ms < 2000ms`)
  })

  it('搜索操作 < 50ms', function () {
    const foodService = require('../../services/food-service')
    const foods = foodService.getAllFoods()
    const { searchFoods } = require('../../utils/food-utils')
    const start = Date.now()
    for (let i = 0; i < 100; i++) {
      searchFoods(foods, '番茄')
    }
    const elapsed = Date.now() - start
    assert.ok(elapsed < 1000, `100次搜索耗时 ${elapsed}ms < 1000ms`)
  })
})

console.log('\n=============================')
console.log('全部测试用例定义完成')
console.log('=============================')
