/**
 * @file Local Storage Utility - Namespaced wrapper around wx.setStorageSync.
 * @description Provides a unified storage API with automatic key namespacing (fridge_ prefix),
 *   error handling, and bulk operations for the FreshKeeper application.
 * @module utils/storage-utils
 * @version 2.9.0
 */

/** @private Key prefix to namespace all FreshKeeper storage keys */
const STORAGE_PREFIX = 'fridge_'

/**
 * Build the namespaced storage key.
 * All keys are prefixed with `fridge_` to avoid collisions with other mini programs.
 * @param {string} key - Raw key name
 * @returns {string} Namespaced key (e.g. 'fridge_foods')
 * @private
 */
function getKey(key) {
  return `${STORAGE_PREFIX}${key}`
}

/**
 * Retrieve a value from local storage.
 * Returns `defaultValue` when the key does not exist or an error occurs.
 * @param {string} key - Storage key (without prefix)
 * @param {*} [defaultValue=null] - Fallback value if key is not found
 * @returns {*} Stored value or defaultValue
 *
 * @example
 * const foods = storage.get('foods', [])
 * const count = storage.get('last_count', 0)
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
 * Write a value to local storage.
 * @param {string} key - Storage key (without prefix)
 * @param {*} value - Value to store (must be JSON-serializable)
 * @returns {boolean} true if write succeeded, false on error
 *
 * @example
 * storage.set('foods', foodArray)
 * storage.set('theme', 'dark')
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
 * Delete a single key from local storage.
 * @param {string} key - Storage key (without prefix)
 * @returns {boolean} true if deletion succeeded, false on error
 *
 * @example
 * storage.remove('temp_cache')
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
 * Clear ALL FreshKeeper storage keys (only those prefixed with `fridge_`).
 * Other mini program data is left untouched.
 * @returns {boolean} true if clear succeeded, false on error
 *
 * @example
 * storage.clear() // Removes all fridge_* keys
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
 * Get storage metadata (all keys, current size, and size limit).
 * @returns {{keys: string[], currentSize: number, limitSize: number}} Storage info object
 *
 * @example
 * const info = storage.getInfo()
 * console.log(`Using ${info.currentSize}KB of ${info.limitSize}KB`)
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
