/**
 * @file AI Fridge Food Management Assistant - Mini Program Entry Point
 * @description WeChat Mini Program for managing fridge inventory, tracking expiry dates,
 *   building shopping lists, and providing AI-powered recipe recommendations.
 *   Uses mock data + local storage for offline-first operation.
 * @module app
 * @version 2.15.0
 */
const { initMockData } = require('./services/food-service')
const { getThemeMode } = require('./utils/theme-behavior')

App({
  /**
   * Lifecycle hook called when the Mini Program is first launched.
   * Initializes mock data, retrieves system info, and sets theme mode.
   */
  onLaunch() {
    // Initialize mock data on first launch
    initMockData()

    // Retrieve system information for responsive layout
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight || 20
    this.globalData.isIOS = systemInfo.platform === 'ios'

    // Apply saved theme preference
    const themeMode = getThemeMode()
    this.globalData.themeMode = themeMode
  },

  /** @type {Object} Global application data shared across all pages */
  globalData: {
    /** @type {Object|null} System information from wx.getSystemInfoSync() */
    systemInfo: null,
    /** @type {number} Status bar height in pixels */
    statusBarHeight: 20,
    /** @type {boolean} Whether the device runs iOS */
    isIOS: false,
    /** @type {'light'|'dark'} Current theme mode */
    themeMode: 'light',
    /** @type {Object|null} Current user info */
    userInfo: null,
    /** @type {string} Application version */
    version: '2.15.0'
  }
})
