/**
 * @file 营养进度条组件
 * @description 显示蛋白质、碳水化合物、脂肪和热量的进度条，直观展示每日营养摄入情况
 * @module components/nutrition-bar
 */

const nutritionService = require('../../services/nutrition-service')

/**
 * 营养进度条组件
 * @class NutritionBar
 */
Component({
  /**
   * 组件属性
   * @type {Object}
   */
  properties: {
    /** 当前摄入数据，包含 calories/protein/fat/carbs */
    current: {
      type: Object,
      value: { calories: 0, protein: 0, fat: 0, carbs: 0 }
    },
    /** 目标摄入数据，包含 calories/protein/fat/carbs */
    target: {
      type: Object,
      value: { calories: 2000, protein: 60, fat: 65, carbs: 300 }
    },
    /** 是否显示详细数值（数字+单位） */
    showDetail: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件数据
   * @type {Object}
   */
  data: {
    /** 各项营养的百分比（0-100） */
    percentages: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0
    },
    /** 进度条颜色配置 */
    colorMap: {
      calories: '#FF6B35',
      protein: '#4ECDC4',
      fat: '#FFE66D',
      carbs: '#95E1D3'
    },
    /** 各项标签 */
    labelMap: {
      calories: '热量',
      protein: '蛋白质',
      fat: '脂肪',
      carbs: '碳水'
    },
    /** 各项单位 */
    unitMap: {
      calories: 'kcal',
      protein: 'g',
      fat: 'g',
      carbs: 'g'
    }
  },

  /**
   * 属性监听器
   */
  observers: {
    'current, target': function (current, target) {
      this._updatePercentages(current, target)
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      this._updatePercentages(this.properties.current, this.properties.target)
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 计算各营养项的百分比
     * @param {Object} current - 当前摄入值
     * @param {Object} target - 目标值
     * @private
     */
    _updatePercentages(current, target) {
      const percentages = {}
      const keys = ['calories', 'protein', 'fat', 'carbs']

      keys.forEach(key => {
        const cur = current[key] || 0
        const tgt = target[key] || 1
        percentages[key] = Math.min(Math.round((cur / tgt) * 100), 100)
      })

      this.setData({ percentages })
    },

    /**
     * 获取进度条颜色（根据百分比变化）
     * 超过 90% 显示警告色
     * @param {string} type - 营养类型
     * @returns {string} 颜色值
     */
    getBarColor(type) {
      const pct = this.data.percentages[type] || 0
      if (pct > 100) return '#FF4757'
      if (pct > 90) return '#FFA502'
      return this.data.colorMap[type] || '#4ECDC4'
    }
  }
})
