/**
 * @file 字体大小选择组件
 * @description 提供4个字体大小选项（小/标准/大/特大），支持无障碍字体调节
 * @module components/font-size-picker
 */

const { FONT_SIZE_MAP, updateSettings, getSettings } = require('../../utils/accessibility')

/**
 * 字体大小选择组件
 * @class FontSizePicker
 */
Component({
  /**
   * 组件属性
   * @type {Object}
   */
  properties: {
    /** 当前选中的字体大小 */
    value: {
      type: String,
      value: 'normal'
    }
  },

  /**
   * 组件数据
   * @type {Object}
   */
  data: {
    /** 字体大小选项列表 */
    options: [
      { key: 'small', label: '小', preview: 26 },
      { key: 'normal', label: '标准', preview: 28 },
      { key: 'large', label: '大', preview: 32 },
      { key: 'xlarge', label: '特大', preview: 36 }
    ],
    /** 当前选中项 */
    currentValue: 'normal'
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      const settings = getSettings()
      this.setData({
        currentValue: this.properties.value || settings.fontSize
      })
    }
  },

  /**
   * 属性监听
   */
  observers: {
    'value': function(val) {
      if (val) {
        this.setData({ currentValue: val })
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 选择字体大小
     * @param {Object} e - 事件对象
     */
    handleSelect(e) {
      const key = e.currentTarget.dataset.key
      if (!key || key === this.data.currentValue) return

      this.setData({ currentValue: key })

      updateSettings({ fontSize: key })

      this.triggerEvent('change', { value: key })
    },

    /**
     * 获取预览文字样式
     * @param {number} size - 字体大小（rpx）
     * @returns {string}
     */
    getPreviewStyle(size) {
      return 'font-size: ' + size + 'rpx;'
    }
  }
})
