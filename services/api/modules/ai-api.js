/**
 * @file AI 服务 API 模块
 * @description 封装 AI 相关的接口调用（对话、食材识别、菜单生成）
 *   当前使用 Mock 数据实现，接口定义完整，方便后续替换为真实后端
 *   流式输出通过 RequestTask 的 onChunkReceived 实现
 * @module services/api/modules/ai-api
 */

const config = require('../config')

// ======================== Mock 数据 ========================

/**
 * Mock AI 对话预设回复
 * @type {Object}
 * @private
 */
const MOCK_AI_REPLIES = {
  default: '我是您的冰箱智能助手！可以帮您分析食材搭配、推荐菜谱、提供营养建议。请问有什么可以帮助您的？',
  recipes: '根据您冰箱里的食材，我为您推荐以下菜谱：\n\n1. **西红柿炒鸡蛋** - 简单快手，酸甜可口\n2. **青椒肉丝** - 色彩鲜艳，营养均衡\n3. **红烧豆腐** - 外焦里嫩，适合下饭\n\n需要我详细说明某道菜的做法吗？',
  nutrition: '这些食材的营养搭配很不错！\n\n- 西红柿富含维生素C和番茄红素\n- 鸡蛋提供优质蛋白质\n- 豆腐含有丰富的植物蛋白和钙\n\n建议搭配一些绿叶蔬菜，营养会更全面。',
  storage: '关于冰箱存储，我有以下建议：\n\n1. **冷藏室**（2-8度）：适合蔬菜、水果、乳制品\n2. **冷冻室**（-18度以下）：适合肉类长期储存\n3. 鸡蛋最好放在冷藏室中层\n4. 牛奶开封后请在3天内饮用',
  expiry: '您有以下食材需要注意保质期：\n\n- 牛奶：还有3天过期，建议尽快饮用\n- 豆腐：明天到期，建议今天使用\n\n需要我推荐一些消耗这些食材的菜谱吗？'
}

/**
 * Mock 食材识别结果
 * @type {Array<Object>}
 * @private
 */
const MOCK_RECOGNITION_RESULTS = [
  [
    { name: '西红柿', confidence: 0.96, category: 'vegetable', categoryName: '蔬菜' },
    { name: '鸡蛋', confidence: 0.92, category: 'egg', categoryName: '蛋类' },
    { name: '青椒', confidence: 0.85, category: 'vegetable', categoryName: '蔬菜' }
  ],
  [
    { name: '苹果', confidence: 0.94, category: 'fruit', categoryName: '水果' },
    { name: '香蕉', confidence: 0.91, category: 'fruit', categoryName: '水果' }
  ],
  [
    { name: '猪肉', confidence: 0.88, category: 'meat', categoryName: '肉类' },
    { name: '豆腐', confidence: 0.90, category: 'bean', categoryName: '豆制品' },
    { name: '白菜', confidence: 0.87, category: 'vegetable', categoryName: '蔬菜' }
  ]
]

/**
 * Mock 生成的菜单
 * @type {Object}
 * @private
 */
const MOCK_GENERATED_MENU = {
  title: '本周推荐菜单',
  basedOn: '根据您的饮食偏好和冰箱库存生成',
  days: [
    {
      day: '周一',
      breakfast: { meal: '牛奶燕麦粥', reason: '简单营养，5分钟搞定' },
      lunch: { meal: '西红柿炒鸡蛋 + 米饭', reason: '利用现有食材，美味又省时' },
      dinner: { meal: '青椒肉丝 + 清炒时蔬 + 米饭', reason: '荤素搭配，营养均衡' }
    },
    {
      day: '周二',
      breakfast: { meal: '煎蛋三明治', reason: '鸡蛋消耗，早餐必备' },
      lunch: { meal: '红烧豆腐 + 炒青菜 + 米饭', reason: '豆腐需要尽快食用' },
      dinner: { meal: '蛋花汤 + 凉拌黄瓜', reason: '清淡晚餐，助消化' }
    },
    {
      day: '周三',
      breakfast: { meal: '酸奶水果杯', reason: '乳制品和水果补充' },
      lunch: { meal: '猪肉白菜饺子', reason: '周末包好速冻的' },
      dinner: { meal: '西红柿鸡蛋面', reason: '简单快手，不浪费食材' }
    },
    {
      day: '周四',
      breakfast: { meal: '小米粥 + 蒸蛋', reason: '养胃早餐' },
      lunch: { meal: '青椒豆腐丝 + 米饭', reason: '食材组合创新' },
      dinner: { meal: '清蒸鱼 + 蔬菜沙拉', reason: '高蛋白低脂' }
    },
    {
      day: '周五',
      breakfast: { meal: '全麦面包 + 牛奶', reason: '简单快速' },
      lunch: { meal: '西红柿牛腩 + 米饭', reason: '周末大菜提前准备' },
      dinner: { meal: '蔬菜火锅', reason: '消耗剩余蔬菜' }
    },
    {
      day: '周六',
      breakfast: { meal: '法式吐司', reason: '周末慢享早餐' },
      lunch: { meal: '蛋炒饭 + 紫菜汤', reason: '消化剩饭' },
      dinner: { meal: '烤鸡翅 + 沙拉', reason: '周末犒劳一下' }
    },
    {
      day: '周日',
      breakfast: { meal: '皮蛋瘦肉粥', reason: '周末经典早粥' },
      lunch: { meal: '红烧排骨 + 西兰花 + 米饭', reason: '丰盛午餐' },
      dinner: { meal: '面条/馄饨', reason: '清理冰箱库存' }
    }
  ],
  estimatedCost: 180,
  tips: '本周建议优先消耗：豆腐（保质期临近）、青椒（已存放3天）'
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
 * 根据用户消息选择最接近的预设回复
 * @param {Array<Object>} messages - 对话消息列表
 * @returns {string} 匹配的回复内容
 * @private
 */
function matchReply(messages) {
  const lastMsg = messages[messages.length - 1]
  const content = (lastMsg.content || '').toLowerCase()

  if (content.includes('菜') || content.includes('做') || content.includes('食谱')) {
    return MOCK_AI_REPLIES.recipes
  }
  if (content.includes('营养') || content.includes('搭配') || content.includes('健康')) {
    return MOCK_AI_REPLIES.nutrition
  }
  if (content.includes('保存') || content.includes('存储') || content.includes('放')) {
    return MOCK_AI_REPLIES.storage
  }
  if (content.includes('过期') || content.includes('保质') || content.includes('快过')) {
    return MOCK_AI_REPLIES.expiry
  }
  return MOCK_AI_REPLIES.default
}

// ======================== API 接口 ========================

/**
 * AI 对话接口（支持流式输出）
 * 向 AI 发送对话消息，接收流式回复
 *
 * @param {Array<Object>} messages - 对话消息列表
 * @param {string} messages[].role - 角色（user/assistant/system）
 * @param {string} messages[].content - 消息内容
 * @param {Object} [options] - 额外配置
 * @param {Function} [options.onChunk] - 流式输出回调，每收到一块内容时调用
 *   签名：(chunk: string, fullText: string) => void
 * @param {Function} [options.onComplete] - 输出完成时的回调
 *   签名：(fullText: string) => void
 * @param {Function} [options.onError] - 出错时的回调
 *   签名：(error: Object) => void
 * @returns {Promise<string>} 完整的 AI 回复文本
 *
 * @example
 * // 流式输出
 * aiApi.chatCompletion(
 *   [{ role: 'user', content: '冰箱里的食材怎么搭配' }],
 *   {
 *     onChunk: (chunk, full) => { updateUI(full) },
 *     onComplete: (full) => { console.log('回复完成:', full) }
 *   }
 * )
 */
function chatCompletion(messages, options = {}) {
  const { onChunk, onComplete, onError } = options

  return new Promise((resolve, reject) => {
    // 获取回复文本
    const reply = matchReply(messages)

    // 模拟流式输出（逐字输出）
    let index = 0
    let fullText = ''
    const chars = reply.split('')

    const timer = setInterval(() => {
      if (index < chars.length) {
        // 每次输出 1-3 个字符（模拟真实流式效果）
        const chunkSize = Math.floor(Math.random() * 3) + 1
        const chunk = chars.slice(index, index + chunkSize).join('')
        fullText += chunk
        index += chunkSize

        if (onChunk) {
          onChunk(chunk, fullText)
        }
      } else {
        clearInterval(timer)
        if (onComplete) {
          onComplete(fullText)
        }
        resolve(fullText)
      }
    }, 50)

    // 超时保护
    setTimeout(() => {
      clearInterval(timer)
      if (fullText) {
        if (onComplete) onComplete(fullText)
        resolve(fullText)
      }
    }, 30000)

    // ---- 替换为真实后端时取消注释 ----
    // 使用 wx.request + onChunkReceived 实现真正的流式输出：
    //
    // const task = wx.request({
    //   url: `${config.baseUrl}/ai/chat`,
    //   method: 'POST',
    //   data: { messages, stream: true },
    //   enableChunked: true,  // 关键：开启分块传输
    //   header: {
    //     'Authorization': `Bearer ${wx.getStorageSync('token')}`,
    //     'Content-Type': 'application/json'
    //   },
    //   success(res) {
    //     if (onComplete) onComplete(fullText)
    //     resolve(fullText)
    //   },
    //   fail(err) {
    //     if (onError) onError(err)
    //     reject(err)
    //   }
    // })
    //
    // task.onChunkReceived(function(res) {
    //   const text = new TextDecoder().decode(res.data)
    //   // 解析 SSE 格式: data: {...}
    //   const lines = text.split('\n')
    //   for (const line of lines) {
    //     if (line.startsWith('data: ')) {
    //       try {
    //         const parsed = JSON.parse(line.slice(6))
    //         const chunk = parsed.choices?.[0]?.delta?.content || ''
    //         fullText += chunk
    //         if (onChunk) onChunk(chunk, fullText)
    //       } catch(e) { /* ignore parse errors */ }
    //     }
    //   }
    // })
  })
}

/**
 * 食材识别
 * 通过图片识别食材，返回识别结果列表
 *
 * @param {string|ArrayBuffer} imageData - 图片数据
 *   可以是本地临时文件路径（wx.chooseMedia 获取）或 ArrayBuffer
 * @returns {Promise<Array<Object>>} 识别结果列表
 *   - name: 食材名称
 *   - confidence: 置信度（0-1）
 *   - category: 分类代码
 *   - categoryName: 分类中文名
 *
 * @example
 * // 通过 wx.chooseMedia 获取图片后识别
 * wx.chooseMedia({
 *   count: 1,
 *   mediaType: ['image'],
 *   success(res) {
 *     const filePath = res.tempFiles[0].tempFilePath
 *     aiApi.recognizeFood(filePath).then(results => {
 *       results.forEach(item => {
 *         console.log(`${item.name} (置信度: ${item.confidence})`)
 *       })
 *     })
 *   }
 * })
 */
async function recognizeFood(imageData) {
  // 模拟 AI 识别耗时
  await simulateDelay(1000, 3000)

  // 随机返回一组识别结果
  const randomIndex = Math.floor(Math.random() * MOCK_RECOGNITION_RESULTS.length)
  const results = MOCK_RECOGNITION_RESULTS[randomIndex].map(item => ({ ...item }))

  return results

  // ---- 替换为真实后端时取消注释 ----
  // // 使用 upload 将图片发送到后端
  // const { upload } = require('../request')
  // return upload('ai/recognize', imageData, 'image', {}, {
  //   showLoading: true,
  //   loadingText: 'AI 正在识别食材...'
  // })
}

/**
 * 生成菜单
 * 根据用户偏好和冰箱库存，AI 生成一周菜单推荐
 *
 * @param {Object} [preferences] - 用户偏好
 * @param {string} [preferences.dietaryType] - 饮食类型（regular/vegetarian/low-carb/low-fat）
 * @param {Array<string>} [preferences.allergies] - 过敏食物列表
 * @param {string} [preferences.taste] - 口味偏好（清淡/重口/辣/甜）
 * @param {number} [preferences.mealsPerDay=3] - 每天几餐
 * @param {number} [preferences.budget] - 每周预算（元）
 * @param {number} [preferences.cookingSkill] - 厨艺水平（1-5，1最简单）
 * @returns {Promise<Object>} 生成的菜单
 *   - title: 菜单标题
 *   - basedOn: 生成依据说明
 *   - days: 7天菜单数组
 *   - estimatedCost: 预估总费用
 *   - tips: 温馨提示
 *
 * @example
 * aiApi.generateMenu({
 *   dietaryType: 'regular',
 *   taste: '清淡',
 *   budget: 200,
 *   cookingSkill: 2
 * })
 */
async function generateMenu(preferences = {}) {
  // 模拟 AI 生成耗时
  await simulateDelay(2000, 5000)

  return {
    ...MOCK_GENERATED_MENU,
    basedOn: `根据您的饮食偏好（${preferences.taste || '均衡'}）和冰箱库存自动生成`
  }

  // ---- 替换为真实后端时取消注释 ----
  // return post('ai/generate-menu', preferences, {
  //   showLoading: true,
  //   loadingText: 'AI 正在生成菜单...',
  //   timeout: 60000  // AI 推理可能需要较长时间
  // })
}

module.exports = {
  chatCompletion,
  recognizeFood,
  generateMenu
}
