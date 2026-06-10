/**
 * 本地存储工具
 */

const STORAGE_PREFIX = 'fridge_'

/**
 * 生成存储键
 * @param {string} key
 * @returns {string}
 */
function getKey(key) {
  return `${STORAGE_PREFIX}${key}`
}

/**
 * 获取存储数据
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
function get(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(getKey(key))
    return value !== '' ? value : defaultValue
  } catch (e) {
    console.error('[Storage] get error:', key, e)
    return defaultValue
  }
}

/**
 * 设置存储数据
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
function set(key, value) {
  try {
    wx.setStorageSync(getKey(key), value)
    return true
  } catch (e) {
    console.error('[Storage] set error:', key, e)
    return false
  }
}

/**
 * 删除存储数据
 * @param {string} key
 * @returns {boolean}
 */
function remove(key) {
  try {
    wx.removeStorageSync(getKey(key))
    return true
  } catch (e) {
    console.error('[Storage] remove error:', key, e)
    return false
  }
}

/**
 * 清空所有本项目存储
 */
function clear() {
  try {
    const res = wx.getStorageInfoSync()
    res.keys.forEach(k => {
      if (k.startsWith(STORAGE_PREFIX)) {
        wx.removeStorageSync(k)
      }
    })
    return true
  } catch (e) {
    console.error('[Storage] clear error:', e)
    return false
  }
}

/**
 * 获取存储信息
 * @returns {object}
 */
function getInfo() {
  try {
    return wx.getStorageInfoSync()
  } catch (e) {
    return { keys: [], currentSize: 0, limitSize: 0 }
  }
}

module.exports = {
  get,
  set,
  remove,
  clear,
  getInfo
}
