/**
 * @file 无障碍 Behavior
 * @description 混入页面，自动应用无障碍设置和国际化
 * @module utils/a11y-behavior
 */

var accessibilityModule = require('./accessibility')
var i18nModule = require('./i18n')

/**
 * 无障碍 Behavior
 * 在页面的 behaviors 中混入，自动加载无障碍设置和语言设置
 *
 * 使用示例：
 * Page({
 *   behaviors: [A11yBehavior],
 *   // 页面可以使用 this.$t('key') 进行翻译
 *   // 页面 data 中自动包含 a11yClasses 和 a11ySettings
 * })
 */
var A11yBehavior = Behavior({
  /**
   * 组件数据
   * @type {Object}
   */
  data: {
    /** 无障碍 CSS 类名 */
    a11yClasses: '',
    /** 当前无障碍设置 */
    a11ySettings: {}
  },

  /**
   * 生命周期 - 组件进入页面节点树
   */
  lifetimes: {
    attached() {
      accessibilityModule.loadSettings()
      i18nModule.initLocale()
      this._applyA11y()
    },
    show() {
      this._applyA11y()
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 应用无障碍设置到页面数据
     * @private
     */
    _applyA11y() {
      var classes = accessibilityModule.getCSSClasses()
      var currentSettings = accessibilityModule.getSettings()
      this.setData({
        a11yClasses: classes,
        a11ySettings: currentSettings
      })
    },

    /**
     * 翻译方法，供页面 JS 和模板调用
     * @param {string} key - 翻译键值
     * @param {Object} [params] - 插值参数
     * @returns {string}
     */
    $t: function(key, params) {
      return i18nModule.t(key, params)
    }
  }
})

module.exports = { A11yBehavior }
