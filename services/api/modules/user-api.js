/**
 * @file 用户 API 模块
 * @description 封装用户相关的接口调用（登录、用户信息、设置、统计）
 *   当前使用 Mock 数据实现，接口定义完整，方便后续替换为真实后端
 * @module services/api/modules/user-api
 */

const { get, post, put } = require('../request')

// ======================== Mock 数据 ========================

/**
 * Mock 用户信息
 * @type {Object}
 * @private
 */
let MOCK_USER = {
  id: 'user_001',
  openId: 'mock_openid_123456',
  unionId: '',
  nickname: '冰箱小管家',
  avatar: '/assets/mock/avatar.png',
  phone: '',
  gender: 0,
  city: '北京',
  province: '北京',
  settings: {
    expiryReminder: true,         // 过期提醒
    reminderDays: 3,               // 提前几天提醒
    darkMode: false,               // 深色模式
    notificationEnabled: true,     // 推送通知
    defaultStorage: 'fridge',      // 默认存储位置
    language: 'zh-CN'              // 语言
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z'
}

/**
 * Mock 统计数据
 * @type {Object}
 * @private
 */
const MOCK_STATS = {
  totalFoods: 15,
  freshFoods: 10,
  expiringFoods: 3,
  expiredFoods: 2,
  categoryStats: [
    { category: '蔬菜', count: 5, percentage: 33 },
    { category: '肉类', count: 3, percentage: 20 },
    { category: '蛋类', count: 2, percentage: 13 },
    { category: '乳制品', count: 2, percentage: 13 },
    { category: '水果', count: 2, percentage: 13 },
    { category: '其他', count: 1, percentage: 8 }
  ],
  monthlyConsumption: [
    { month: '2026-01', count: 45 },
    { month: '2026-02', count: 38 },
    { month: '2026-03', count: 52 },
    { month: '2026-04', count: 41 },
    { month: '2026-05', count: 56 },
    { month: '2026-06', count: 23 }
  ],
  wasteStats: {
    totalCount: 8,
    totalCost: 35.60,
    mostWasted: '绿叶蔬菜'
  },
  shoppingStats: {
    totalTrips: 12,
    totalSpent: 580.50,
    averagePerTrip: 48.38
  }
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
 * 微信登录
 * 调用 wx.login 获取 code，发送到后端换取 token 和用户信息
 *
 * @returns {Promise<{token: string, userInfo: Object, isNewUser: boolean}>}
 *   - token: 登录凭证（存入 localStorage，后续请求自动携带）
 *   - userInfo: 用户基本信息
 *   - isNewUser: 是否为新用户
 *
 * @example
 * userApi.login().then(({ token, userInfo }) => {
 *   console.log('登录成功', userInfo.nickname)
 * })
 */
async function login() {
  await simulateDelay(500, 1500)

  // 模拟 wx.login 获取 code
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (loginRes.code) {
          // 模拟后端返回
          const mockToken = `mock_token_${Date.now()}`
          const isNewUser = false

          // 存储 token
          wx.setStorageSync('token', mockToken)
          wx.setStorageSync('userInfo', deepClone(MOCK_USER))

          resolve({
            token: mockToken,
            userInfo: deepClone(MOCK_USER),
            isNewUser
          })
        } else {
          reject({
            code: 10001,
            message: '微信登录失败：无法获取 code'
          })
        }
      },
      fail() {
        reject({
          code: 10001,
          message: '微信登录失败：网络错误'
        })
      }
    })

    // ---- 替换为真实后端时取消注释 ----
    // wx.login({
    //   success(loginRes) {
    //     if (loginRes.code) {
    //       post('user/login', { code: loginRes.code }, { withToken: false })
    //         .then(result => {
    //           wx.setStorageSync('token', result.token)
    //           wx.setStorageSync('userInfo', result.userInfo)
    //           resolve(result)
    //         })
    //         .catch(reject)
    //     } else {
    //       reject({ code: 10001, message: '微信登录失败' })
    //     }
    //   },
    //   fail: reject
    // })
  })
}

/**
 * 获取用户信息
 * 从后端获取最新的用户信息（非本地缓存）
 *
 * @returns {Promise<Object>} 用户信息对象
 *
 * @example
 * userApi.getUserProfile().then(profile => {
 *   console.log(profile.nickname, profile.settings)
 * })
 */
async function getUserProfile() {
  await simulateDelay()

  return deepClone(MOCK_USER)

  // ---- 替换为真实后端时取消注释 ----
  // return get('user/profile', null, { useCache: true, cacheTtl: 60000 })
}

/**
 * 更新用户设置
 *
 * @param {Object} data - 设置数据（支持部分更新）
 * @param {boolean} [data.expiryReminder] - 是否开启过期提醒
 * @param {number} [data.reminderDays] - 提前几天提醒
 * @param {boolean} [data.darkMode] - 是否开启深色模式
 * @param {boolean} [data.notificationEnabled] - 是否开启推送通知
 * @param {string} [data.defaultStorage] - 默认存储位置
 * @param {string} [data.language] - 语言
 * @param {string} [data.nickname] - 昵称
 * @param {string} [data.avatar] - 头像 URL
 * @returns {Promise<Object>} 更新后的完整设置
 *
 * @example
 * userApi.updateSettings({ darkMode: true, reminderDays: 5 })
 */
async function updateSettings(data) {
  await simulateDelay(300, 600)

  // 合并更新
  if (data.settings) {
    MOCK_USER.settings = { ...MOCK_USER.settings, ...data.settings }
  }
  if (data.nickname !== undefined) MOCK_USER.nickname = data.nickname
  if (data.avatar !== undefined) MOCK_USER.avatar = data.avatar

  MOCK_USER.updatedAt = new Date().toISOString()

  // 同步到本地缓存
  wx.setStorageSync('userInfo', deepClone(MOCK_USER))

  return deepClone(MOCK_USER.settings)

  // ---- 替换为真实后端时取消注释 ----
  // return put('user/settings', data, { showLoading: true })
}

/**
 * 获取统计数据
 * 返回冰箱食材的使用统计（分类、消耗趋势、浪费统计、采购统计）
 *
 * @returns {Promise<Object>} 统计数据
 *
 * @example
 * userApi.getStats().then(stats => {
 *   console.log('总食材数:', stats.totalFoods)
 *   console.log('浪费金额:', stats.wasteStats.totalCost)
 * })
 */
async function getStats() {
  await simulateDelay()

  return deepClone(MOCK_STATS)

  // ---- 替换为真实后端时取消注释 ----
  // return get('user/stats', null, { useCache: true, cacheTtl: 300000 })
}

module.exports = {
  login,
  getUserProfile,
  updateSettings,
  getStats
}
