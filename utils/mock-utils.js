/**
 * Mock 数据工具
 */

/**
 * 生成 mock ID
 * @param {string} prefix 前缀
 * @returns {string}
 */
function generateId(prefix = 'item') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 6)
  return `${prefix}_${timestamp}${random}`
}

/**
 * 生成指定范围的随机整数
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 从数组中随机选取一个
 * @param {Array} arr
 * @returns {*}
 */
function randomPick(arr) {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 从数组中随机选取 N 个（不重复）
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
function randomPickN(arr, n) {
  if (!arr || arr.length === 0) return []
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

/**
 * 生成随机日期字符串
 * @param {number} daysAgo 最多多少天前
 * @param {number} daysLater 最多多少天后
 * @returns {string} YYYY-MM-DD
 */
function randomDate(daysAgo = 30, daysLater = 0) {
  const d = new Date()
  const offset = randomInt(-daysAgo, daysLater)
  d.setDate(d.getDate() + offset)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 生成指定日期偏移的日期字符串
 * @param {number} offsetDays
 * @returns {string} YYYY-MM-DD
 */
function getDateOffset(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

module.exports = {
  generateId,
  randomInt,
  randomPick,
  randomPickN,
  randomDate,
  getDateOffset
}
