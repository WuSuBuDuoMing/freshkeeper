/**
 * 暗黑模式 Behavior
 */

const STORAGE_KEY = 'theme_mode'

/**
 * 获取当前主题模式
 * @returns {'light'|'dark'}
 */
function getThemeMode() {
  try {
    const mode = wx.getStorageSync(STORAGE_KEY)
    if (mode === 'dark' || mode === 'light') return mode
    // 跟随系统
    const res = wx.getSystemInfoSync()
    return res.theme === 'dark' ? 'dark' : 'light'
  } catch (e) {
    return 'light'
  }
}

/**
 * 设置主题模式
 * @param {'light'|'dark'} mode
 */
function setThemeMode(mode) {
  try {
    wx.setStorageSync(STORAGE_KEY, mode)
  } catch (e) {
    console.error('setThemeMode error:', e)
  }
}

/**
 * 暗黑模式 Behavior，供页面/组件使用
 * 使用方式：Page(Behaviors({ ... }, ThemeBehavior))
 */
const ThemeBehavior = Behavior({
  data: {
    isDark: false
  },

  lifetimes: {
    attached() {
      this._applyTheme()
    },
    show() {
      this._applyTheme()
    }
  },

  pageLifetimes: {
    show() {
      this._applyTheme()
    }
  },

  methods: {
    _applyTheme() {
      const mode = getThemeMode()
      const isDark = mode === 'dark'
      this.setData({ isDark })
      // 同步到全局
      const app = getApp()
      if (app) app.globalData.themeMode = mode
    },

    /**
     * 切换主题
     */
    toggleTheme() {
      const current = this.data.isDark ? 'dark' : 'light'
      const next = current === 'dark' ? 'light' : 'dark'
      setThemeMode(next)
      this.setData({ isDark: next === 'dark' })
      const app = getApp()
      if (app) app.globalData.themeMode = next
    }
  }
})

module.exports = {
  getThemeMode,
  setThemeMode,
  ThemeBehavior
}
