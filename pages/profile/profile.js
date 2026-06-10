/**
 * 个人中心页
 */
const { ThemeBehavior, getThemeMode, setThemeMode } = require('../../utils/theme-behavior')
const storage = require('../../utils/storage-utils')

Page(Behaviors({
  mixins: [ThemeBehavior],

  data: {
    version: '1.0.0',
    storageUsed: '0',
    foodCount: 0,
    menuCount: 0,
    cookingDays: 21,
    isDark: false
  },

  onLoad() {
    this._loadInfo()
  },

  onShow() {
    this._loadInfo()
    this.setData({ isDark: this.data.isDark })
  },

  _loadInfo() {
    const info = storage.getInfo()
    const app = getApp()
    const themeMode = getThemeMode()

    this.setData({
      storageUsed: info.currentSize || '0',
      version: app.globalData.version || '1.0.0',
      isDark: themeMode === 'dark'
    })
  },

  onToggleTheme(e) {
    this.toggleTheme()
    const mode = getThemeMode()
    wx.showToast({ title: `已切换为${mode === 'dark' ? '暗黑' : '明亮'}模式`, icon: 'none' })
  },

  onClearData() {
    wx.showModal({
      title: '确认', content: '将清除所有本地数据，此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          storage.clear()
          wx.showToast({ title: '数据已清除', icon: 'success' })
        }
      }
    })
  },

  onGoExpiry() { wx.navigateTo({ url: '/pages/expiry/expiry' }) },
  onGoShopping() { wx.navigateTo({ url: '/pages/shopping/shopping' }) },
  onGoStats() { wx.navigateTo({ url: '/pages/stats/stats' }) },
  onGoWeeklyMenu() { wx.navigateTo({ url: '/pages/weekly-menu/weekly-menu' }) },

  onShareAppMessage() {
    return {
      title: 'AI 冰箱食材管理助手',
      path: '/pages/index/index'
    }
  }
}))
