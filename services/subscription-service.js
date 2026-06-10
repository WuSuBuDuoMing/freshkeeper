/**
 * @file 微信订阅消息服务
 * @description 管理消息订阅、推送权限和提醒调度
 * @module services/subscription-service
 */

/**
 * 订阅消息模板配置
 * 开发者需要在微信后台申请对应模板
 * @type {Object}
 */
const TEMPLATES = {
  /** 过期提醒模板 */
  expiryReminder: {
    id: '', // 过期提醒模板 ID，需在微信公众平台申请
    title: '食材过期提醒',
    fields: ['食材名称', '过期时间', '剩余天数', '处理建议']
  },
  /** 采购提醒模板 */
  shoppingReminder: {
    id: '', // 采购提醒模板 ID
    title: '采购清单提醒',
    fields: ['待购买数量', '预计花费', '最紧急食材', '提醒时间']
  },
  /** 周报模板 */
  weeklyReport: {
    id: '', // 周报模板 ID
    title: '冰箱周报',
    fields: ['本周食材数', '浪费数量', '节省金额', '健康评分']
  }
}

/**
 * 请求订阅消息授权
 * @param {string} templateKey - 模板 key（TEMPLATES 中的键名）
 * @returns {Promise<string>} 授权结果：accept / reject / ban
 */
function requestSubscribe(templateKey) {
  const template = TEMPLATES[templateKey]
  if (!template || !template.id) {
    console.warn(`[Subscription] 模板 ${templateKey} 未配置 ID，使用 mock 模式`)
    return Promise.resolve('accept')
  }

  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: [template.id],
      success: (res) => {
        const result = res[template.id] || 'reject'
        console.log(`[Subscription] ${templateKey} 授权结果:`, result)
        resolve(result)
      },
      fail: (err) => {
        console.error('[Subscription] 授权失败:', err)
        resolve('reject')
      }
    })
  })
}

/**
 * 批量请求订阅授权
 * @returns {Promise<Object>} 各模板授权结果，如 { expiryReminder: 'accept', ... }
 */
async function requestAllSubscriptions() {
  const keys = Object.keys(TEMPLATES).filter(k => TEMPLATES[k].id)
  if (keys.length === 0) {
    console.warn('[Subscription] 无已配置模板，使用 mock 模式')
    return { expiryReminder: 'accept', shoppingReminder: 'accept', weeklyReport: 'accept' }
  }

  return new Promise((resolve) => {
    wx.requestSubscribeMessage({
      tmplIds: keys.map(k => TEMPLATES[k].id),
      success: (res) => {
        const results = {}
        keys.forEach(k => {
          results[k] = res[TEMPLATES[k].id] || 'reject'
        })
        resolve(results)
      },
      fail: () => {
        const results = {}
        keys.forEach(k => { results[k] = 'reject' })
        resolve(results)
      }
    })
  })
}

/**
 * 发送到期提醒（服务端模拟）
 * 在真实场景中，这应该在服务端定时任务中调用
 * @param {Object} data - 提醒数据
 * @param {string} data.foodName - 食材名称
 * @param {number} data.daysLeft - 剩余天数
 * @returns {Promise<Object>} 发送结果
 */
async function sendExpiryNotification(data) {
  console.log('[Subscription] 发送到期提醒:', data)

  if (!TEMPLATES.expiryReminder.id) {
    // Mock 模式：直接显示本地通知
    wx.showModal({
      title: '食材过期提醒',
      content: `${data.foodName} 将在 ${data.daysLeft} 天后过期，请及时处理！`,
      showCancel: false
    })
    return { success: true, mock: true }
  }

  // 真实发送（需要后端调用）
  return { success: true, pendingServer: true }
}

/**
 * 发送采购提醒
 * @param {Object} data - 提醒数据
 * @param {number} data.pendingCount - 待购买数量
 * @param {number} data.estimatedCost - 预计花费
 * @returns {Promise<Object>} 发送结果
 */
async function sendShoppingNotification(data) {
  console.log('[Subscription] 发送采购提醒:', data)

  if (!TEMPLATES.shoppingReminder.id) {
    wx.showModal({
      title: '采购清单提醒',
      content: `您有 ${data.pendingCount} 项待购买，预计花费 ¥${data.estimatedCost}`,
      showCancel: false
    })
    return { success: true, mock: true }
  }
  return { success: true, pendingServer: true }
}

/**
 * 发送周报
 * @param {Object} data - 周报数据
 * @param {number} data.totalCount - 本周食材总数
 * @param {number} data.wastedCount - 浪费数量
 * @param {number} data.savedAmount - 节省金额
 * @returns {Promise<Object>} 发送结果
 */
async function sendWeeklyReport(data) {
  console.log('[Subscription] 发送周报:', data)

  if (!TEMPLATES.weeklyReport.id) {
    wx.showModal({
      title: '冰箱周报',
      content: `本周食材 ${data.totalCount} 样，浪费 ${data.wastedCount} 样，节省 ¥${data.savedAmount}`,
      showCancel: false
    })
    return { success: true, mock: true }
  }
  return { success: true, pendingServer: true }
}

/**
 * 提醒调度器
 * 根据食材过期情况自动触发提醒
 * @returns {Array<Object>} 提醒列表
 */
function scheduleReminders() {
  const foodService = require('./food-service')
  const foods = foodService.getAllFoods().filter(f => f.status !== 'used')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const reminders = []
  foods.forEach(food => {
    const expiry = new Date(food.expiryDate)
    const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
    const daysLeft = Math.ceil((expiryDay - today) / (1000 * 60 * 60 * 24))

    if (daysLeft === 1) {
      reminders.push({
        type: 'tomorrow',
        foodName: food.name,
        daysLeft: 1,
        action: '建议今天使用或处理'
      })
    } else if (daysLeft === 0) {
      reminders.push({
        type: 'today',
        foodName: food.name,
        daysLeft: 0,
        action: '今天到期，请尽快使用'
      })
    } else if (daysLeft < 0) {
      reminders.push({
        type: 'expired',
        foodName: food.name,
        daysLeft: daysLeft,
        action: '已过期，建议丢弃或标记用完'
      })
    }
  })

  return reminders
}

/**
 * 检查并发送所有待发送提醒
 * @returns {Promise<Object>} 汇总后的提醒信息
 */
async function checkAndSendReminders() {
  const reminders = scheduleReminders()

  if (reminders.length === 0) return []

  // 按优先级排序：已过期 > 今日过期 > 明天过期
  reminders.sort((a, b) => a.daysLeft - b.daysLeft)

  // 合并为一条汇总消息
  const summary = {
    expired: reminders.filter(r => r.type === 'expired'),
    today: reminders.filter(r => r.type === 'today'),
    tomorrow: reminders.filter(r => r.type === 'tomorrow')
  }

  const messages = []
  if (summary.today.length > 0) {
    messages.push(`${summary.today.length} 样食材今日过期`)
  }
  if (summary.tomorrow.length > 0) {
    messages.push(`${summary.tomorrow.length} 样食材明日过期`)
  }
  if (summary.expired.length > 0) {
    messages.push(`${summary.expired.length} 样食材已过期`)
  }

  return {
    reminders,
    summary,
    message: messages.join('\n'),
    totalCount: reminders.length
  }
}

/**
 * 获取订阅授权状态
 * @returns {Object} 各模板的授权状态
 */
function getSubscriptionStatus() {
  const storage = require('../utils/storage-utils')
  return storage.get('subscription_status', {
    expiryReminder: 'pending',
    shoppingReminder: 'pending',
    weeklyReport: 'pending'
  })
}

/**
 * 保存订阅授权状态
 * @param {Object} status - 授权状态对象
 */
function saveSubscriptionStatus(status) {
  const storage = require('../utils/storage-utils')
  storage.set('subscription_status', status)
}

module.exports = {
  TEMPLATES,
  requestSubscribe,
  requestAllSubscriptions,
  sendExpiryNotification,
  sendShoppingNotification,
  sendWeeklyReport,
  scheduleReminders,
  checkAndSendReminders,
  getSubscriptionStatus,
  saveSubscriptionStatus
}
