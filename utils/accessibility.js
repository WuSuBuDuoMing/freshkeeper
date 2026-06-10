/**
 * @file 无障碍工具
 * @description 提供字体大小、对比度、色盲模式等设置
 * @module utils/accessibility
 */

/**
 * 无障碍设置存储键
 * @type {string}
 */
const STORAGE_KEY = 'accessibility_settings'

/**
 * 默认无障碍设置
 * @type {Object}
 */
const DEFAULT_SETTINGS = {
  /** 字体大小：small | normal | large | xlarge */
  fontSize: 'normal',
  /** 高对比度模式 */
  highContrast: false,
  /** 色盲模式：none | protanopia | deuteranopia | tritanopia */
  colorBlindMode: 'none',
  /** 减少动画 */
  reduceMotion: false,
  /** 简化模式（减少视觉元素） */
  simplifyMode: false,
  /** 屏幕阅读器优化 */
  screenReader: false
}

/**
 * 字体大小映射（rpx）
 * @type {Object}
 */
const FONT_SIZE_MAP = {
  small: { body: 26, title: 30, h1: 36 },
  normal: { body: 28, title: 32, h1: 40 },
  large: { body: 32, title: 36, h1: 44 },
  xlarge: { body: 36, title: 40, h1: 48 }
}

/**
 * 当前无障碍设置
 * @type {Object}
 */
let settings = { ...DEFAULT_SETTINGS }

/**
 * 获取设置
 * @returns {Object}
 */
function getSettings() {
  return { ...settings }
}

/**
 * 更新设置
 * @param {Object} updates - 要更新的设置项
 */
function updateSettings(updates) {
  settings = { ...settings, ...updates }
  saveSettings()
  applySettings()
}

/**
 * 保存到缓存
 */
function saveSettings() {
  try {
    wx.setStorageSync(STORAGE_KEY, settings)
  } catch (e) {
    // 缓存写入失败时静默处理
  }
}

/**
 * 从缓存加载设置
 */
function loadSettings() {
  try {
    const saved = wx.getStorageSync(STORAGE_KEY)
    if (saved) {
      settings = { ...DEFAULT_SETTINGS, ...saved }
    }
  } catch (e) {
    // 缓存读取失败时使用默认设置
  }
}

/**
 * 应用设置到全局样式
 */
function applySettings() {
  const page = getCurrentPages().pop()
  if (!page) return

  // 字体大小
  const fontSizes = FONT_SIZE_MAP[settings.fontSize] || FONT_SIZE_MAP.normal
  const sysInfo = wx.getSystemInfoSync()
  const rpxRatio = sysInfo.windowWidth / 750

  page.setData({
    a11ySettings: settings,
    fontSizeStyle: [
      '--a11y-body-font: ' + (fontSizes.body * rpxRatio) + 'px;',
      '--a11y-title-font: ' + (fontSizes.title * rpxRatio) + 'px;',
      '--a11y-h1-font: ' + (fontSizes.h1 * rpxRatio) + 'px;'
    ].join(' ')
  })
}

/**
 * 获取 CSS 类名
 * @returns {string}
 */
function getCSSClasses() {
  var classes = []
  if (settings.highContrast) classes.push('high-contrast')
  if (settings.colorBlindMode !== 'none') classes.push('cb-' + settings.colorBlindMode)
  if (settings.reduceMotion) classes.push('reduce-motion')
  if (settings.simplifyMode) classes.push('simplify-mode')
  if (settings.screenReader) classes.push('sr-optimized')
  return classes.join(' ')
}

/**
 * 获取 ARIA 标签
 * @param {string} key - 语义 key
 * @returns {string}
 */
function getAriaLabel(key) {
  var labels = {
    'food-card': '食材卡片，点击查看详情',
    'expiry-badge': '过期状态标签',
    'delete-btn': '删除按钮',
    'add-btn': '添加按钮',
    'search-input': '搜索输入框',
    'tab-switch': '标签切换',
    'toggle-switch': '开关按钮'
  }
  return labels[key] || ''
}

module.exports = {
  DEFAULT_SETTINGS,
  FONT_SIZE_MAP,
  getSettings,
  updateSettings,
  loadSettings,
  applySettings,
  getCSSClasses,
  getAriaLabel
}
