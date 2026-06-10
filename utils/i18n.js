/**
 * @file 国际化(i18n)工具
 * @description 支持多语言切换，当前支持简体中文和英文
 * @module utils/i18n
 */

/**
 * 语言包
 * @type {Object}
 */
const locales = {
  'zh-CN': {
    // 通用
    'common.confirm': '确认',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.add': '添加',
    'common.search': '搜索',
    'common.loading': '加载中...',
    'common.empty': '暂无数据',
    'common.retry': '重试',
    'common.back': '返回',
    'common.success': '操作成功',
    'common.error': '操作失败',
    'common.yes': '是',
    'common.no': '否',

    // 首页
    'home.greeting': '你好',
    'home.foodCount': '你的冰箱有 {count} 样食材',
    'home.addFood': '添加食材',
    'home.expiryReminder': '过期提醒',
    'home.recipeRecommend': '菜谱推荐',
    'home.shoppingList': '采购清单',
    'home.dataOverview': '数据概览',
    'home.totalFoods': '食材总数',
    'home.expiringSoon': '即将过期',
    'home.expired': '已过期',
    'home.wasteEstimate': '浪费估算',
    'home.todayTasks': '今日待处理',
    'home.todayRecipe': '今日推荐菜谱',
    'home.recentFoods': '最近添加',
    'home.moreFeatures': '更多功能',

    // 食材
    'food.name': '食材名称',
    'food.category': '分类',
    'food.quantity': '数量',
    'food.unit': '单位',
    'food.storageArea': '存放位置',
    'food.purchaseDate': '购买日期',
    'food.expiryDate': '过期日期',
    'food.notes': '备注',
    'food.normal': '正常',
    'food.expiringSoon': '即将过期',
    'food.expired': '已过期',
    'food.used': '已用完',
    'food.markUsed': '标记已用完',
    'food.addToShopping': '加入采购清单',

    // 分类
    'category.all': '全部',
    'category.vegetable': '蔬菜',
    'category.fruit': '水果',
    'category.meat': '肉类',
    'category.seafood': '海鲜',
    'category.eggDairy': '蛋奶',
    'category.beverage': '饮料',
    'category.seasoning': '调料',
    'category.staple': '主食',
    'category.other': '其他',

    // 过期
    'expiry.todayExpire': '今日过期',
    'expiry.threeDayExpire': '3天内过期',
    'expiry.sevenDayExpire': '7天内过期',
    'expiry.alreadyExpired': '已过期',
    'expiry.daysLeft': '{days}天后过期',
    'expiry.expiredDaysAgo': '已过期{days}天',

    // 菜谱
    'recipe.recommend': '推荐菜谱',
    'recipe.time': '烹饪时间',
    'recipe.difficulty': '难度',
    'recipe.calories': '热量',
    'recipe.steps': '烹饪步骤',
    'recipe.reason': '推荐理由',
    'recipe.ingredients': '食材',
    'recipe.missing': '缺少食材',
    'recipe.refresh': '刷新推荐',

    // 采购
    'shopping.pending': '待购买',
    'shopping.purchased': '已购买',
    'shopping.estimated': '预计花费',
    'shopping.addItem': '添加采购项',
    'shopping.clearPurchased': '清空已购买',

    // 统计
    'stats.monthlyReport': '月度报告',
    'stats.categoryDistribution': '食材分类占比',
    'stats.wasteStats': '浪费统计',
    'stats.mostPurchased': '最常购买',
    'stats.savingTips': '省钱建议',

    // 个人中心
    'profile.title': '个人中心',
    'profile.cookingDays': '做饭天数',
    'profile.storageUsed': '缓存',
    'profile.version': '版本',
    'profile.darkMode': '暗黑模式',
    'profile.clearData': '清除数据',
    'profile.share': '分享给朋友',

    // 过期天数
    'days.today': '今天',
    'days.tomorrow': '明天',
    'days.yesterday': '昨天',
    'days.daysLater': '{days}天后',
    'days.daysAgo': '{days}天前'
  },

  'en': {
    // Common
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.empty': 'No data',
    'common.retry': 'Retry',
    'common.back': 'Back',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Home
    'home.greeting': 'Hello',
    'home.foodCount': 'You have {count} items in your fridge',
    'home.addFood': 'Add Food',
    'home.expiryReminder': 'Expiry Alert',
    'home.recipeRecommend': 'Recipes',
    'home.shoppingList': 'Shopping List',
    'home.dataOverview': 'Overview',
    'home.totalFoods': 'Total Foods',
    'home.expiringSoon': 'Expiring Soon',
    'home.expired': 'Expired',
    'home.wasteEstimate': 'Waste Estimate',
    'home.todayTasks': 'Today\'s Tasks',
    'home.todayRecipe': 'Today\'s Recipe',
    'home.recentFoods': 'Recently Added',
    'home.moreFeatures': 'More Features',

    // Food
    'food.name': 'Food Name',
    'food.category': 'Category',
    'food.quantity': 'Quantity',
    'food.unit': 'Unit',
    'food.storageArea': 'Storage Area',
    'food.purchaseDate': 'Purchase Date',
    'food.expiryDate': 'Expiry Date',
    'food.notes': 'Notes',
    'food.normal': 'Fresh',
    'food.expiringSoon': 'Expiring',
    'food.expired': 'Expired',
    'food.used': 'Used',
    'food.markUsed': 'Mark as Used',
    'food.addToShopping': 'Add to Shopping List',

    // Category
    'category.all': 'All',
    'category.vegetable': 'Vegetable',
    'category.fruit': 'Fruit',
    'category.meat': 'Meat',
    'category.seafood': 'Seafood',
    'category.eggDairy': 'Egg & Dairy',
    'category.beverage': 'Beverage',
    'category.seasoning': 'Seasoning',
    'category.staple': 'Staple',
    'category.other': 'Other',

    // Expiry
    'expiry.todayExpire': 'Expire Today',
    'expiry.threeDayExpire': 'Expire in 3 Days',
    'expiry.sevenDayExpire': 'Expire in 7 Days',
    'expiry.alreadyExpired': 'Already Expired',
    'expiry.daysLeft': 'Expires in {days} days',
    'expiry.expiredDaysAgo': 'Expired {days} days ago',

    // Recipe
    'recipe.recommend': 'Recommended Recipes',
    'recipe.time': 'Cooking Time',
    'recipe.difficulty': 'Difficulty',
    'recipe.calories': 'Calories',
    'recipe.steps': 'Cooking Steps',
    'recipe.reason': 'Recommendation Reason',
    'recipe.ingredients': 'Ingredients',
    'recipe.missing': 'Missing Ingredients',
    'recipe.refresh': 'Refresh',

    // Shopping
    'shopping.pending': 'To Buy',
    'shopping.purchased': 'Purchased',
    'shopping.estimated': 'Estimated Cost',
    'shopping.addItem': 'Add Item',
    'shopping.clearPurchased': 'Clear Purchased',

    // Stats
    'stats.monthlyReport': 'Monthly Report',
    'stats.categoryDistribution': 'Category Distribution',
    'stats.wasteStats': 'Waste Statistics',
    'stats.mostPurchased': 'Most Purchased',
    'stats.savingTips': 'Saving Tips',

    // Profile
    'profile.title': 'Profile',
    'profile.cookingDays': 'Cooking Days',
    'profile.storageUsed': 'Storage',
    'profile.version': 'Version',
    'profile.darkMode': 'Dark Mode',
    'profile.clearData': 'Clear Data',
    'profile.share': 'Share',

    // Days
    'days.today': 'Today',
    'days.tomorrow': 'Tomorrow',
    'days.yesterday': 'Yesterday',
    'days.daysLater': 'In {days} days',
    'days.daysAgo': '{days} days ago'
  }
}

/**
 * 当前语言
 * @type {string}
 */
let currentLocale = 'zh-CN'

/**
 * 获取翻译文本
 * @param {string} key - 翻译键值
 * @param {object} [params={}] - 插值参数
 * @returns {string}
 */
function t(key, params = {}) {
  const dict = locales[currentLocale] || locales['zh-CN']
  let text = dict[key] || locales['zh-CN'][key] || key

  // 参数插值 {param}
  Object.keys(params).forEach(k => {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k])
  })

  return text
}

/**
 * 设置语言
 * @param {string} locale - 语言标识
 */
function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale
    try {
      wx.setStorageSync('app_locale', locale)
    } catch (e) {
      // 缓存写入失败时静默处理
    }
  }
}

/**
 * 获取当前语言
 * @returns {string}
 */
function getLocale() {
  return currentLocale
}

/**
 * 初始化语言设置（从缓存或系统语言）
 */
function initLocale() {
  try {
    const saved = wx.getStorageSync('app_locale')
    if (saved && locales[saved]) {
      currentLocale = saved
      return
    }
  } catch (e) {
    // 缓存读取失败时使用默认语言
  }

  // 跟随系统语言
  try {
    const sysInfo = wx.getSystemInfoSync()
    const lang = (sysInfo.language || '').toLowerCase()
    if (lang.startsWith('zh')) {
      currentLocale = 'zh-CN'
    } else {
      currentLocale = 'en'
    }
  } catch (e) {
    currentLocale = 'zh-CN'
  }
}

/**
 * 获取所有可用语言
 * @returns {Array<{key: string, name: string, flag: string}>}
 */
function getAvailableLocales() {
  return [
    { key: 'zh-CN', name: '简体中文', flag: '\u{1F1E8}\u{1F1F3}' },
    { key: 'en', name: 'English', flag: '\u{1F1FA}\u{1F1F8}' }
  ]
}

module.exports = {
  t,
  setLocale,
  getLocale,
  initLocale,
  getAvailableLocales,
  locales
}
