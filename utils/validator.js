/**
 * 表单验证增强模块
 * 内置规则、自定义规则、链式验证、批量验证
 */

/**
 * 内置验证器
 */
const Validators = {
  /**
   * 非空验证
   */
  required(value) {
    return value !== null && value !== undefined && value !== ''
  },

  /**
   * 最小长度
   */
  minLength(min) {
    return (value) => String(value).length >= min
  },

  /**
   * 最大长度
   */
  maxLength(max) {
    return (value) => String(value).length <= max
  },

  /**
   * 正则匹配
   */
  pattern(regex) {
    return (value) => regex.test(value)
  },

  /**
   * 数字验证
   */
  number(value) {
    return !isNaN(Number(value)) && value !== ''
  },

  /**
   * 正数验证
   */
  positiveNumber(value) {
    return Number(value) > 0
  },

  /**
   * 日期格式验证
   */
  date(value) {
    return !isNaN(Date.parse(value))
  },

  /**
   * 未来日期验证
   */
  futureDate(value) {
    return new Date(value) > new Date()
  },

  /**
   * 过去日期验证
   */
  pastDate(value) {
    return new Date(value) < new Date()
  },

  /**
   * 数值范围验证
   */
  range(min, max) {
    return (value) => Number(value) >= min && Number(value) <= max
  },

  /**
   * 食材名称验证（中文、英文、空格，1-20字符）
   */
  foodName(value) {
    return /^[一-龥a-zA-Z\s]{1,20}$/.test(value)
  }
}

/**
 * 错误消息模板
 */
const Messages = {
  required: '请填写此字段',
  minLength: (n) => `至少需要${n}个字符`,
  maxLength: (n) => `最多${n}个字符`,
  number: '请输入有效数字',
  positiveNumber: '请输入正数',
  date: '请输入有效日期',
  futureDate: '请选择未来的日期',
  pastDate: '请选择过去的日期',
  foodName: '请输入有效的食材名称（1-20个字符）',
  expiryBeforePurchase: '过期日期不能早于购买日期'
}

/**
 * 创建验证器
 * @param {Array} rules 规则数组
 * @returns {Function} 验证函数
 */
function createValidator(rules) {
  return function validate(value, formData) {
    const errors = []
    for (const rule of rules) {
      const { type, params, message } = rule
      const validator = typeof type === 'function' ? type : Validators[type]

      if (validator) {
        const isValid = params ? validator(...params)(value) : validator(value)
        if (!isValid) {
          const errMsg = typeof message === 'function' ? message(params) : (message || Messages[type] || '验证失败')
          errors.push({ type, message: errMsg })
          break // 每个字段遇到第一个错误就停止
        }
      }
    }
    return { valid: errors.length === 0, errors }
  }
}

/**
 * 食材表单验证规则
 */
const FoodFormRules = {
  name: createValidator([
    { type: 'required', message: '请输入食材名称' },
    { type: 'foodName', message: '请输入1-20个字符的食材名称' }
  ]),
  quantity: createValidator([
    { type: 'required', message: '请输入数量' },
    { type: 'positiveNumber', message: '数量必须大于0' }
  ]),
  expiryDate: createValidator([
    { type: 'required', message: '请选择过期日期' },
    { type: 'date', message: '日期格式无效' }
  ])
}

/**
 * 验证整个表单
 * @param {object} formData 表单数据
 * @param {object} rulesMap 字段-验证函数映射
 * @returns {object} { valid: boolean, errors: { field: message } }
 */
function validateForm(formData, rulesMap) {
  const allErrors = {}
  let isValid = true

  Object.keys(rulesMap).forEach(field => {
    const validate = rulesMap[field]
    const result = validate(formData[field], formData)
    if (!result.valid) {
      allErrors[field] = result.errors[0].message
      isValid = false
    }
  })

  return { valid: isValid, errors: allErrors }
}

module.exports = {
  Validators,
  Messages,
  createValidator,
  FoodFormRules,
  validateForm
}
