/**
 * @file food-recognition.js
 * @description 食材识别服务 - 支持拍照识别食材并自动录入冰箱
 * @module services/food-recognition
 */

const imageUtils = require('../utils/image-utils')
const { generateId, getDateOffset } = require('../utils/mock-utils')

/**
 * 识别服务配置
 * useRealAPI 切换为 true 后接入真实视觉识别 API
 */
const CONFIG = {
  useRealAPI: false,
  apiEndpoint: '',
  apiKey: '',
  confidence: 0.6
}

/**
 * Mock 食材数据库
 * 模拟识别结果时从这里随机选取
 */
const MOCK_FOOD_DB = [
  { name: '番茄', category: '蔬菜', unit: '个', defaultExpiryDays: 7, emoji: '🍅' },
  { name: '鸡蛋', category: '蛋奶', unit: '个', defaultExpiryDays: 14, emoji: '🥚' },
  { name: '苹果', category: '水果', unit: '个', defaultExpiryDays: 10, emoji: '🍎' },
  { name: '香蕉', category: '水果', unit: '把', defaultExpiryDays: 5, emoji: '🍌' },
  { name: '鸡胸肉', category: '肉类', unit: '克', defaultExpiryDays: 3, emoji: '🍗' },
  { name: '西兰花', category: '蔬菜', unit: '颗', defaultExpiryDays: 5, emoji: '🥦' },
  { name: '牛奶', category: '蛋奶', unit: '瓶', defaultExpiryDays: 7, emoji: '🥛' },
  { name: '豆腐', category: '蔬菜', unit: '块', defaultExpiryDays: 2, emoji: '🧈' },
  { name: '虾', category: '海鲜', unit: '克', defaultExpiryDays: 3, emoji: '🦐' },
  { name: '牛肉', category: '肉类', unit: '克', defaultExpiryDays: 3, emoji: '🥩' },
  { name: '面包', category: '主食', unit: '袋', defaultExpiryDays: 3, emoji: '🍞' },
  { name: '土豆', category: '蔬菜', unit: '个', defaultExpiryDays: 14, emoji: '🥔' },
  { name: '胡萝卜', category: '蔬菜', unit: '根', defaultExpiryDays: 10, emoji: '🥕' },
  { name: '黄瓜', category: '蔬菜', unit: '根', defaultExpiryDays: 5, emoji: '🥒' },
  { name: '橙子', category: '水果', unit: '个', defaultExpiryDays: 10, emoji: '🍊' },
  { name: '葡萄', category: '水果', unit: '串', defaultExpiryDays: 5, emoji: '🍇' },
  { name: '五花肉', category: '肉类', unit: '克', defaultExpiryDays: 3, emoji: '🥩' },
  { name: '面条', category: '主食', unit: '袋', defaultExpiryDays: 30, emoji: '🍜' },
  { name: '酱油', category: '调料', unit: '瓶', defaultExpiryDays: 180, emoji: '🫙' },
  { name: '酸奶', category: '蛋奶', unit: '杯', defaultExpiryDays: 14, emoji: '🧃' }
]

/**
 * 识别图片中的食材
 * @param {string} imagePath 图片路径
 * @returns {Promise<Array>} 识别结果列表
 */
async function recognizeFood(imagePath) {
  if (CONFIG.useRealAPI) {
    return await callRecognitionAPI(imagePath)
  }
  return await mockRecognition()
}

/**
 * 调用真实识别 API
 * @param {string} imagePath
 * @returns {Promise<Array>}
 */
async function callRecognitionAPI(imagePath) {
  const base64 = await imageUtils.imageToBase64(imagePath)
  return new Promise((resolve, reject) => {
    wx.request({
      url: CONFIG.apiEndpoint,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.apiKey}`
      },
      data: { image: base64, features: ['LABEL_DETECTION'], maxResults: 10 },
      success: (res) => {
        try {
          const labels = res.data.responses[0]?.labelAnnotations || []
          const foods = labels
            .map(label => {
              const matched = MOCK_FOOD_DB.find(f =>
                f.name.includes(label.description) || label.description.includes(f.name)
              )
              return matched ? { ...matched, confidence: label.score } : null
            })
            .filter(Boolean)
            .filter(f => f.confidence >= CONFIG.confidence)
          resolve(foods)
        } catch (e) { reject(e) }
      },
      fail: reject
    })
  })
}

/**
 * Mock 识别（随机返回 2-4 个食材）
 * @returns {Promise<Array>}
 */
async function mockRecognition() {
  await new Promise(r => setTimeout(r, 1200))
  const count = 2 + Math.floor(Math.random() * 3)
  const shuffled = [...MOCK_FOOD_DB].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(f => ({
    ...f,
    selected: true,
    confidence: Math.round((0.7 + Math.random() * 0.3) * 100) / 100
  }))
}

/**
 * 批量识别多张图片并去重
 * @param {Array<string>} imagePaths
 * @returns {Promise<Array>}
 */
async function batchRecognize(imagePaths) {
  const allResults = []
  for (const path of imagePaths) {
    const results = await recognizeFood(path)
    allResults.push(...results)
  }
  const seen = new Set()
  return allResults.filter(item => {
    if (seen.has(item.name)) return false
    seen.add(item.name)
    return true
  })
}

/**
 * 将识别结果转为食材表单数据（可直接传给 foodService.addFood）
 * @param {object} recognized
 * @returns {object}
 */
function toFoodForm(recognized) {
  const today = getDateOffset(0)
  const expiry = getDateOffset(recognized.defaultExpiryDays || 7)
  return {
    name: recognized.name,
    category: recognized.category,
    quantity: 1,
    unit: recognized.unit,
    storageArea: '冷藏区',
    purchaseDate: today,
    expiryDate: expiry,
    notes: `拍照识别添加 (置信度 ${(recognized.confidence * 100).toFixed(0)}%)`
  }
}

module.exports = {
  CONFIG,
  MOCK_FOOD_DB,
  recognizeFood,
  batchRecognize,
  toFoodForm
}
