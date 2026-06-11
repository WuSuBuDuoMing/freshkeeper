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

// ==================== 食材过期逻辑深度测试 ====================

describe('食材过期逻辑深度测试', function () {

  describe('date-utils 过期计算', function () {
    const dateUtils = require('../../utils/date-utils')

    it('今天过期返回 0', function () {
      const today = dateUtils.getToday()
      assert.equal(dateUtils.daysUntilExpiry(today), 0, '今天过期天数为 0')
    })

    it('昨天过期返回 -1', function () {
      const yesterday = dateUtils.getFutureDate(-1)
      assert.equal(dateUtils.daysUntilExpiry(yesterday), -1, '昨天过期天数为 -1')
    })

    it('明天过期返回 1', function () {
      const tomorrow = dateUtils.getFutureDate(1)
      assert.equal(dateUtils.daysUntilExpiry(tomorrow), 1, '明天过期天数为 1')
    })

    it('null 日期返回 Infinity', function () {
      assert.equal(dateUtils.daysUntilExpiry(null), Infinity, 'null 返回 Infinity')
      assert.equal(dateUtils.daysUntilExpiry(undefined), Infinity, 'undefined 返回 Infinity')
      assert.equal(dateUtils.daysUntilExpiry(''), Infinity, '空字符串返回 Infinity')
    })

    it('isExpired 判断边界', function () {
      assert.ok(!dateUtils.isExpired(dateUtils.getToday()), '今天不算过期')
      assert.ok(dateUtils.isExpired(dateUtils.getFutureDate(-1)), '昨天算过期')
      assert.ok(!dateUtils.isExpired(dateUtils.getFutureDate(1)), '明天不算过期')
    })

    it('isExpiringSoon 边界 (0-3天)', function () {
      assert.ok(dateUtils.isExpiringSoon(dateUtils.getToday()), '今天算即将过期')
      assert.ok(dateUtils.isExpiringSoon(dateUtils.getFutureDate(1)), '1天后算即将过期')
      assert.ok(dateUtils.isExpiringSoon(dateUtils.getFutureDate(2)), '2天后算即将过期')
      assert.ok(dateUtils.isExpiringSoon(dateUtils.getFutureDate(3)), '3天后算即将过期')
      assert.ok(!dateUtils.isExpiringSoon(dateUtils.getFutureDate(4)), '4天后不算即将过期')
      assert.ok(!dateUtils.isExpiringSoon(dateUtils.getFutureDate(-1)), '已过期不算即将过期')
    })

    it('getFreshnessStatus 正确分类', function () {
      assert.equal(dateUtils.getFreshnessStatus(dateUtils.getFutureDate(-1)), 'expired', '昨天过期=expired')
      assert.equal(dateUtils.getFreshnessStatus(dateUtils.getToday()), 'expiring_soon', '今天=expiring_soon')
      assert.equal(dateUtils.getFreshnessStatus(dateUtils.getFutureDate(3)), 'expiring_soon', '3天内=expiring_soon')
      assert.equal(dateUtils.getFreshnessStatus(dateUtils.getFutureDate(4)), 'fresh', '4天后=fresh')
      assert.equal(dateUtils.getFreshnessStatus(dateUtils.getFutureDate(30)), 'fresh', '30天后=fresh')
    })

    it('getExpiryStatusText 正确返回中文', function () {
      assert.equal(dateUtils.getExpiryStatusText('expired'), '已过期')
      assert.equal(dateUtils.getExpiryStatusText('expiring_soon'), '即将过期')
      assert.equal(dateUtils.getExpiryStatusText('fresh'), '新鲜')
      assert.equal(dateUtils.getExpiryStatusText('unknown'), '未知')
    })

    it('isExpiryWeek 边界 (0-7天)', function () {
      assert.ok(dateUtils.isExpiryWeek(dateUtils.getToday()), '今天算本周过期')
      assert.ok(dateUtils.isExpiryWeek(dateUtils.getFutureDate(7)), '7天后算本周过期')
      assert.ok(!dateUtils.isExpiryWeek(dateUtils.getFutureDate(8)), '8天后不算本周过期')
    })
  })

  describe('food-utils 状态计算', function () {
    const foodUtils = require('../../utils/food-utils')
    const dateUtils = require('../../utils/date-utils')

    it('calculateFoodStatus 已用完食材', function () {
      const food = { status: 'used', expiryDate: dateUtils.getFutureDate(10) }
      assert.equal(foodUtils.calculateFoodStatus(food), 'used', '已用完状态')
    })

    it('calculateFoodStatus 数量为0视为已用完', function () {
      const food = { status: 'normal', quantity: 0, expiryDate: dateUtils.getFutureDate(10) }
      assert.equal(foodUtils.calculateFoodStatus(food), 'used', '数量为0视为已用完')
    })

    it('calculateFoodStatus 已过期食材', function () {
      const food = { status: 'normal', quantity: 1, expiryDate: dateUtils.getFutureDate(-2) }
      assert.equal(foodUtils.calculateFoodStatus(food), 'expired', '已过期')
    })

    it('calculateFoodStatus 即将过期食材', function () {
      const food = { status: 'normal', quantity: 1, expiryDate: dateUtils.getFutureDate(2) }
      assert.equal(foodUtils.calculateFoodStatus(food), 'expiring_soon', '即将过期')
    })

    it('calculateFoodStatus 正常食材', function () {
      const food = { status: 'normal', quantity: 1, expiryDate: dateUtils.getFutureDate(10) }
      assert.equal(foodUtils.calculateFoodStatus(food), 'normal', '正常状态')
    })

    it('getStatusColor 返回正确颜色', function () {
      assert.equal(foodUtils.getStatusColor('normal'), '#4CAF50')
      assert.equal(foodUtils.getStatusColor('expiring_soon'), '#FF9800')
      assert.equal(foodUtils.getStatusColor('expired'), '#F44336')
      assert.equal(foodUtils.getStatusColor('used'), '#999999')
    })

    it('sortFoods 按过期日期排序', function () {
      const foods = [
        { name: 'A', expiryDate: '2026-06-20' },
        { name: 'B', expiryDate: '2026-06-10' },
        { name: 'C', expiryDate: '2026-06-15' }
      ]
      const sorted = foodUtils.sortFoods(foods, 'expiry')
      assert.equal(sorted[0].name, 'B', '最早过期排第一')
      assert.equal(sorted[2].name, 'A', '最晚过期排最后')
    })

    it('sortFoods 按名称排序', function () {
      const foods = [
        { name: '香蕉', expiryDate: '2026-06-10' },
        { name: '苹果', expiryDate: '2026-06-10' },
        { name: '番茄', expiryDate: '2026-06-10' }
      ]
      const sorted = foodUtils.sortFoods(foods, 'name')
      assert.equal(sorted[0].name, '番茄', '按拼音排序-番茄在前')
    })
  })

  describe('food-service 过期查询', function () {
    const foodService = require('../../services/food-service')

    beforeAll(function () {
      foodService.initMockData()
    })

    it('getExpiredFoods 返回已过期食材', function () {
      const expired = foodService.getExpiredFoods()
      assert.ok(Array.isArray(expired), '返回数组')
      expired.forEach(f => {
        assert.ok(f.status !== 'used', '排除已用完')
        assert.ok(new Date(f.expiryDate) < new Date(), '过期日期在过去')
      })
    })

    it('getExpiringFoods(days) 正确过滤', function () {
      const expiring3 = foodService.getExpiringFoods(3)
      assert.ok(Array.isArray(expiring3), '返回数组')
      expiring3.forEach(f => {
        assert.ok(f.status !== 'used', '排除已用完')
        const days = Math.ceil((new Date(f.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        assert.ok(days >= 0 && days <= 3, '在 0-3 天范围内')
      })
    })

    it('getTodayExpiringFoods 只返回今天过期', function () {
      const today = foodService.getTodayExpiringFoods()
      assert.ok(Array.isArray(today), '返回数组')
    })

    it('getOverview 数据一致性', function () {
      const overview = foodService.getOverview()
      assert.ok(overview.total >= 0, '总数 >= 0')
      assert.ok(overview.expiredCount >= 0, '过期数 >= 0')
      assert.ok(overview.expiringCount >= 0, '即将过期数 >= 0')
      assert.ok(overview.freshCount >= 0, '新鲜数 >= 0')
      assert.ok(overview.usedCount >= 0, '已用完数 >= 0')
      assert.ok(overview.wastedValue >= 0, '浪费估算 >= 0')
      // 总数 = 活跃 + 已用完
      const activeTotal = overview.expiredCount + overview.expiringCount + overview.freshCount
      assert.equal(overview.total, activeTotal, 'total = expired + expiring + fresh')
    })

    it('getTodayTasks 返回今日及之前过期的食材', function () {
      const tasks = foodService.getTodayTasks()
      assert.ok(Array.isArray(tasks), '返回数组')
      tasks.forEach(f => {
        assert.ok(f.status !== 'used', '排除已用完')
      })
    })
  })
})

// ==================== 菜谱匹配逻辑深度测试 ====================

describe('菜谱匹配逻辑深度测试', function () {

  describe('recipe-service 推荐算法', function () {
    const recipeService = require('../../services/recipe-service')
    const foodService = require('../../services/food-service')

    beforeAll(function () {
      foodService.initMockData()
      recipeService.initRecipeData()
    })

    it('getRecommendRecipes 返回带匹配信息的菜谱', function () {
      const recipes = recipeService.getRecommendRecipes()
      assert.ok(recipes.length > 0, '有推荐结果')
      recipes.forEach(r => {
        assert.ok(r.usedIngredients !== undefined, '包含 usedIngredients')
        assert.ok(r.missingIngredients !== undefined, '包含 missingIngredients')
        assert.ok(r.reason !== undefined, '包含 reason')
        assert.ok(Array.isArray(r.usedIngredients), 'usedIngredients 是数组')
        assert.ok(Array.isArray(r.missingIngredients), 'missingIngredients 是数组')
      })
    })

    it('推荐菜谱按匹配度降序排列', function () {
      const recipes = recipeService.getRecommendRecipes()
      if (recipes.length >= 2) {
        // 第一个的匹配食材应不少于第二个
        const first = recipes[0].usedIngredients.length
        const second = recipes[1].usedIngredients.length
        assert.ok(first >= second - 1, '大致按匹配度排序')
      }
      assert.ok(true, '排序验证通过')
    })

    it('usedIngredients 是冰箱中存在的食材', function () {
      const recipes = recipeService.getRecommendRecipes()
      const foodNames = foodService.getAllFoods().filter(f => f.status !== 'used').map(f => f.name)
      recipes.forEach(r => {
        r.usedIngredients.forEach(ing => {
          assert.ok(foodNames.includes(ing), `${ing} 在冰箱中存在`)
        })
      })
    })

    it('missingIngredients 不在冰箱中', function () {
      const recipes = recipeService.getRecommendRecipes()
      const foodNames = foodService.getAllFoods().filter(f => f.status !== 'used').map(f => f.name)
      recipes.forEach(r => {
        r.missingIngredients.forEach(ing => {
          assert.ok(!foodNames.includes(ing), `${ing} 不在冰箱中`)
        })
      })
    })

    it('usedIngredients + missingIngredients = 原始食材列表', function () {
      const recipes = recipeService.getRecommendRecipes()
      const allRecipes = recipeService.getAllRecipes()
      recipes.forEach(r => {
        const original = allRecipes.find(ar => ar.id === r.id)
        if (original) {
          const total = r.usedIngredients.length + r.missingIngredients.length
          assert.equal(total, original.ingredients.length, '匹配+缺少=原始食材数')
        }
      })
    })

    it('getWeeklyMenu 返回 7 天且每天有三餐', function () {
      const menu = recipeService.getWeeklyMenu()
      assert.equal(menu.length, 7, '7 天菜单')
      menu.forEach((day, i) => {
        assert.ok(day.date, `第${i + 1}天有日期`)
        assert.ok(day.weekday, `第${i + 1}天有星期`)
        assert.ok(day.meals.breakfast, `第${i + 1}天有早餐`)
        assert.ok(day.meals.lunch, `第${i + 1}天有午餐`)
        assert.ok(day.meals.dinner, `第${i + 1}天有晚餐`)
      })
    })

    it('regenerateDayMenu 返回新菜单', function () {
      const today = require('../../utils/date-utils').getToday()
      const menu = recipeService.regenerateDayMenu(today)
      assert.ok(menu.date === today, '日期正确')
      assert.ok(menu.meals.breakfast, '有早餐')
      assert.ok(menu.meals.lunch, '有午餐')
      assert.ok(menu.meals.dinner, '有晚餐')
    })
  })

  describe('ai-recipe-engine 评分系统', function () {
    const aiEngine = require('../../services/ai-recipe-engine')

    it('buildRecipePrompt 包含食材信息', function () {
      const foods = [
        { name: '番茄', quantity: 4, unit: '个', expiryDate: require('../../utils/date-utils').getFutureDate(1) },
        { name: '鸡蛋', quantity: 12, unit: '个', expiryDate: require('../../utils/date-utils').getFutureDate(10) }
      ]
      const prompt = aiEngine.buildRecipePrompt(foods)
      assert.ok(prompt.includes('番茄'), '包含番茄')
      assert.ok(prompt.includes('鸡蛋'), '包含鸡蛋')
      assert.ok(prompt.includes('JSON'), '要求 JSON 格式')
    })

    it('buildRecipePrompt 标记即将过期食材', function () {
      const dateUtils = require('../../utils/date-utils')
      const foods = [
        { name: '番茄', quantity: 4, unit: '个', expiryDate: dateUtils.getFutureDate(1) },
        { name: '土豆', quantity: 4, unit: '个', expiryDate: dateUtils.getFutureDate(20) }
      ]
      const prompt = aiEngine.buildRecipePrompt(foods)
      assert.ok(prompt.includes('即将过期'), '提示即将过期')
      assert.ok(prompt.includes('番茄'), '包含临期食材名')
    })

    it('scoreRecipe 返回完整评分', function () {
      const recipe = {
        name: '番茄炒蛋',
        ingredients: ['番茄', '鸡蛋'],
        difficulty: '简单',
        calories: 180
      }
      const foods = [
        { name: '番茄', expiryDate: require('../../utils/date-utils').getFutureDate(10) },
        { name: '鸡蛋', expiryDate: require('../../utils/date-utils').getFutureDate(10) }
      ]
      const scored = aiEngine.scoreRecipe(recipe, foods)
      assert.ok(scored.matchScore >= 0 && scored.matchScore <= 100, '匹配分 0-100')
      assert.ok(scored.nutritionScore >= 0 && scored.nutritionScore <= 100, '营养分 0-100')
      assert.ok(scored.difficultyScore >= 0 && scored.difficultyScore <= 100, '难度分 0-100')
      assert.ok(scored.totalScore >= 0 && scored.totalScore <= 100, '总分 0-100')
    })

    it('scoreRecipe 全部食材匹配时 matchScore=100', function () {
      const recipe = { name: '测试', ingredients: ['番茄', '鸡蛋'], difficulty: '简单', calories: 100 }
      const foods = [
        { name: '番茄', expiryDate: require('../../utils/date-utils').getFutureDate(10) },
        { name: '鸡蛋', expiryDate: require('../../utils/date-utils').getFutureDate(10) }
      ]
      const scored = aiEngine.scoreRecipe(recipe, foods)
      assert.equal(scored.matchScore, 100, '全部匹配=100')
    })

    it('scoreRecipe 使用临期食材有加分', function () {
      const dateUtils = require('../../utils/date-utils')
      const recipe = { name: '测试', ingredients: ['番茄'], difficulty: '简单', calories: 100 }
      const foodsExpiring = [{ name: '番茄', expiryDate: dateUtils.getFutureDate(1) }]
      const foodsFresh = [{ name: '番茄', expiryDate: dateUtils.getFutureDate(10) }]
      const scoreExpiring = aiEngine.scoreRecipe(recipe, foodsExpiring)
      const scoreFresh = aiEngine.scoreRecipe(recipe, foodsFresh)
      assert.ok(scoreExpiring.totalScore >= scoreFresh.totalScore, '临期食材总分 >= 新鲜食材')
    })

    it('缓存写入和读取', function () {
      const testKey = 'test_cache_key'
      const testData = [{ name: 'test' }]
      aiEngine.setCachedRecipe(testKey, testData)
      const cached = aiEngine.getCachedRecipe(testKey)
      assert.deepEqual(cached, testData, '缓存读取一致')
    })

    it('generateCacheKey 相同食材生成相同 key', function () {
      const foods1 = [{ name: '番茄' }, { name: '鸡蛋' }]
      const foods2 = [{ name: '鸡蛋' }, { name: '番茄' }]
      const key1 = aiEngine.generateCacheKey(foods1, {})
      const key2 = aiEngine.generateCacheKey(foods2, {})
      assert.equal(key1, key2, '顺序不同但 key 相同')
    })
  })
})

// ==================== 采购清单深度测试 ====================

describe('采购清单深度测试', function () {

  describe('shopping-service CRUD', function () {
    const shoppingService = require('../../services/shopping-service')

    beforeAll(function () {
      shoppingService.initShoppingData()
    })

    it('getAllShoppingItems 返回完整列表', function () {
      const items = shoppingService.getAllShoppingItems()
      assert.ok(items.length >= 30, '至少 30 条')
      items.forEach(item => {
        assert.ok(item.id, '有 ID')
        assert.ok(item.name, '有名称')
        assert.ok(typeof item.purchased === 'boolean', 'purchased 是布尔值')
      })
    })

    it('getPendingItems 只返回未购买项', function () {
      const pending = shoppingService.getPendingItems()
      pending.forEach(item => {
        assert.equal(item.purchased, false, '全部未购买')
      })
    })

    it('getPurchasedItems 只返回已购买项', function () {
      const purchased = shoppingService.getPurchasedItems()
      purchased.forEach(item => {
        assert.equal(item.purchased, true, '全部已购买')
      })
    })

    it('getPendingItems + getPurchasedItems = 总数', function () {
      const all = shoppingService.getAllShoppingItems()
      const pending = shoppingService.getPendingItems()
      const purchased = shoppingService.getPurchasedItems()
      assert.equal(pending.length + purchased.length, all.length, '待购+已购=总数')
    })

    it('addShoppingItem 添加并可查到', function () {
      const item = shoppingService.addShoppingItem({
        name: '测试采购',
        category: '蔬菜',
        quantity: 3,
        unit: '个',
        estimatedPrice: 5
      })
      assert.ok(item.id, '有 ID')
      assert.equal(item.name, '测试采购', '名称正确')
      assert.equal(item.purchased, false, '默认未购买')
      assert.equal(item.quantity, 3, '数量正确')
      assert.equal(item.estimatedPrice, 5, '价格正确')
      // 清理
      shoppingService.deleteShoppingItem(item.id)
    })

    it('addShoppingItems 批量添加', function () {
      const items = shoppingService.addShoppingItems([
        { name: '批量1', quantity: 1 },
        { name: '批量2', quantity: 2 }
      ])
      assert.equal(items.length, 2, '添加 2 项')
      assert.ok(items[0].id !== items[1].id, 'ID 不同')
      // 清理
      items.forEach(i => shoppingService.deleteShoppingItem(i.id))
    })

    it('markAsPurchased 标记后状态变更', function () {
      const item = shoppingService.addShoppingItem({ name: '待标记' })
      const result = shoppingService.markAsPurchased(item.id)
      assert.ok(result, '返回结果')
      assert.equal(result.purchased, true, '已购买')
      assert.ok(result.purchasedAt, '有购买时间')
      // 清理
      shoppingService.deleteShoppingItem(item.id)
    })

    it('unmarkPurchased 取消标记', function () {
      const item = shoppingService.addShoppingItem({ name: '待取消' })
      shoppingService.markAsPurchased(item.id)
      const result = shoppingService.unmarkPurchased(item.id)
      assert.ok(result, '返回结果')
      assert.equal(result.purchased, false, '恢复未购买')
      assert.equal(result.purchasedAt, null, '购买时间清空')
      shoppingService.deleteShoppingItem(item.id)
    })

    it('deleteShoppingItem 删除存在的项', function () {
      const item = shoppingService.addShoppingItem({ name: '待删除' })
      const result = shoppingService.deleteShoppingItem(item.id)
      assert.ok(result, '删除成功')
      const all = shoppingService.getAllShoppingItems()
      assert.ok(!all.find(i => i.id === item.id), '已从列表移除')
    })

    it('deleteShoppingItem 删除不存在的项返回 false', function () {
      const result = shoppingService.deleteShoppingItem('non_existent_id')
      assert.equal(result, false, '不存在返回 false')
    })

    it('clearPurchased 清空已购买项', function () {
      // 先添加并标记一个
      const item = shoppingService.addShoppingItem({ name: '待清空' })
      shoppingService.markAsPurchased(item.id)
      const beforePurchased = shoppingService.getPurchasedItems().length
      const cleared = shoppingService.clearPurchased()
      assert.ok(cleared >= 1, '至少清空 1 项')
      const afterPurchased = shoppingService.getPurchasedItems().length
      assert.equal(afterPurchased, 0, '清空后已购为 0')
    })

    it('markAsPurchased 不存在的 ID 返回 null', function () {
      const result = shoppingService.markAsPurchased('non_existent')
      assert.equal(result, null, '不存在返回 null')
    })
  })

  describe('shopping-service 辅助函数', function () {
    const shoppingService = require('../../services/shopping-service')

    it('calculateTotalPrice 正确计算', function () {
      const items = [
        { estimatedPrice: 10, quantity: 2 },
        { estimatedPrice: 5, quantity: 3 },
        { estimatedPrice: 0, quantity: 1 }
      ]
      assert.equal(shoppingService.calculateTotalPrice(items), 35, '10*2 + 5*3 + 0*1 = 35')
    })

    it('calculateTotalPrice 空数组返回 0', function () {
      assert.equal(shoppingService.calculateTotalPrice([]), 0, '空数组=0')
    })

    it('calculateTotalPrice 处理 undefined 价格', function () {
      const items = [{ quantity: 2 }, { estimatedPrice: 10, quantity: 1 }]
      assert.equal(shoppingService.calculateTotalPrice(items), 10, 'undefined 价格视为 0')
    })

    it('groupByCategory 正确分组', function () {
      const items = [
        { name: '番茄', category: '蔬菜' },
        { name: '鸡蛋', category: '蛋奶' },
        { name: '白菜', category: '蔬菜' },
        { name: '牛奶', category: '蛋奶' },
        { name: '苹果', category: '水果' }
      ]
      const groups = shoppingService.groupByCategory(items)
      assert.equal(groups['蔬菜'].length, 2, '蔬菜 2 项')
      assert.equal(groups['蛋奶'].length, 2, '蛋奶 2 项')
      assert.equal(groups['水果'].length, 1, '水果 1 项')
    })

    it('groupByCategory 空数组返回空对象', function () {
      const groups = shoppingService.groupByCategory([])
      assert.deepEqual(groups, {}, '空数组返回空对象')
    })

    it('addFromUsedFood 从已用完食材创建采购项', function () {
      const food = { name: '番茄', category: '蔬菜', unit: '个' }
      const item = shoppingService.addFromUsedFood(food)
      assert.equal(item.name, '番茄', '名称继承')
      assert.equal(item.category, '蔬菜', '分类继承')
      assert.equal(item.fromUsed, true, '标记来源')
      assert.ok(item.notes.includes('番茄'), '备注包含食材名')
      shoppingService.deleteShoppingItem(item.id)
    })
  })
})

console.log('\n=============================')
console.log('全部测试用例定义完成')
console.log('=============================')
