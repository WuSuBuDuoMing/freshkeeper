/**
 * @file Date Utility Functions
 * @description Comprehensive date formatting, calculation, and comparison utilities
 *   for the FreshKeeper application. Handles expiry date calculations, relative time
 *   display, week date generation, and locale-aware Chinese date formatting.
 * @module utils/date-utils
 * @version 2.12.0
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期为中文显示
 * @param {Date|string} date
 * @returns {string} 如 "6月8日"
 */
function formatDateCN(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 格式化日期为完整中文
 * @param {Date|string} date
 * @returns {string} 如 "2026年6月8日"
 */
function formatDateFull(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

/**
 * 格式化为相对时间
 * @param {Date|string} date
 * @returns {string} 如 "3天前"、"明天"
 */
function formatRelativeTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.floor((target - today) / (1000 * 60 * 60 * 24))

  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === -1) return '昨天'
  if (diff > 1 && diff <= 7) return `${diff}天后`
  if (diff < -1 && diff >= -7) return `${Math.abs(diff)}天前`
  if (diff > 7) return `${diff}天后`
  return `${Math.abs(diff)}天前`
}

/**
 * 计算距离过期还剩几天
 * @param {string} expiryDate YYYY-MM-DD
 * @returns {number} 正数为剩余天数，负数为已过期天数
 */
function daysUntilExpiry(expiryDate) {
  if (!expiryDate) return Infinity
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const expiry = new Date(expiryDate)
  const expiryDay = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate())
  return Math.ceil((expiryDay - today) / (1000 * 60 * 60 * 24))
}

/**
 * 判断食材是否已过期
 * @param {string} expiryDate YYYY-MM-DD
 * @returns {boolean}
 */
function isExpired(expiryDate) {
  return daysUntilExpiry(expiryDate) < 0
}

/**
 * 判断食材是否即将过期（3天内）
 * @param {string} expiryDate YYYY-MM-DD
 * @returns {boolean}
 */
function isExpiringSoon(expiryDate) {
  const days = daysUntilExpiry(expiryDate)
  return days >= 0 && days <= 3
}

/**
 * 判断食材是否在7天内过期
 * @param {string} expiryDate YYYY-MM-DD
 * @returns {boolean}
 */
function isExpiryWeek(expiryDate) {
  const days = daysUntilExpiry(expiryDate)
  return days >= 0 && days <= 7
}

/**
 * 获取食材新鲜度状态
 * @param {string} expiryDate YYYY-MM-DD
 * @returns {'expired'|'expiring_soon'|'fresh'}
 */
function getFreshnessStatus(expiryDate) {
  const days = daysUntilExpiry(expiryDate)
  if (days < 0) return 'expired'
  if (days <= 3) return 'expiring_soon'
  return 'fresh'
}

/**
 * 获取过期状态对应的中文
 * @param {string} status
 * @returns {string}
 */
function getExpiryStatusText(status) {
  const map = {
    expired: '已过期',
    expiring_soon: '即将过期',
    fresh: '新鲜'
  }
  return map[status] || '未知'
}

/**
 * 获取过期状态对应的颜色 class
 * @param {string} status
 * @returns {string}
 */
function getExpiryStatusColor(status) {
  const map = {
    expired: 'danger',
    expiring_soon: 'warning',
    fresh: 'primary'
  }
  return map[status] || 'info'
}

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD
 */
function getToday() {
  return formatDate(new Date())
}

/**
 * 获取 N 天后的日期字符串
 * @param {number} n
 * @returns {string} YYYY-MM-DD
 */
function getFutureDate(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return formatDate(d)
}

/**
 * 获取本周一到周日的日期数组
 * @returns {Array<{date: string, weekday: string, isToday: boolean}>}
 */
function getWeekDates() {
  const now = new Date()
  const dayOfWeek = now.getDay() || 7 // 周日为7
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek + 1)

  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const result = []
  const todayStr = getToday()

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = formatDate(d)
    result.push({
      date: dateStr,
      weekday: weekdays[i],
      short: weekdays[i].replace('周', ''),
      isToday: dateStr === todayStr,
      month: d.getMonth() + 1,
      day: d.getDate()
    })
  }

  return result
}

/**
 * 计算两个日期之间的天数差
 * @param {string} date1 YYYY-MM-DD
 * @param {string} date2 YYYY-MM-DD
 * @returns {number}
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = Math.abs(d2 - d1)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 获取月份名
 * @param {number} month 1-12
 * @returns {string}
 */
function getMonthName(month) {
  const names = ['', '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月']
  return names[month] || ''
}

/**
 * 获取最近 N 个月的日期列表
 * @param {number} n
 * @returns {Array<{date: string, label: string}>}
 */
function getRecentMonths(n = 6) {
  const result = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      date: formatDate(d),
      label: `${d.getMonth() + 1}月`
    })
  }
  return result
}

module.exports = {
  formatDate,
  formatDateCN,
  formatDateFull,
  formatRelativeTime,
  daysUntilExpiry,
  isExpired,
  isExpiringSoon,
  isExpiryWeek,
  getFreshnessStatus,
  getExpiryStatusText,
  getExpiryStatusColor,
  getToday,
  getFutureDate,
  getWeekDates,
  daysBetween,
  getMonthName,
  getRecentMonths
}
