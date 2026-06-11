/**
 * AI 冰箱食材管理助手 - 小程序入口
 * 帮助用户管理冰箱食材、过期提醒、采购清单和 AI 菜谱推荐
 */
const { initMockData } = require('./services/food-service')
const { getThemeMode } = require('./utils/theme-behavior')

App({
  onLaunch() {
    // 初始化 mock 数据
    initMockData()

    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20
    this.globalData.isIOS = systemInfo.platform === 'ios'

    // 获取主题模式
    const themeMode = getThemeMode()
    this.globalData.themeMode = themeMode
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 20,
    isIOS: false,
    themeMode: 'light', // light | dark
    userInfo: null,
    version: '2.1.0'
  }
})
