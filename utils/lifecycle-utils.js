/**
 * @file lifecycle-utils.js
 * @description 页面生命周期管理工具
 */
const { Logger } = require('./error-handler')

const timers = new Map()
const listeners = new Map()

function startTimer(pageId, timerId, fn, interval) {
  const key = `${pageId}_${timerId}`
  if (timers.has(key)) clearInterval(timers.get(key))
  timers.set(key, setInterval(fn, interval))
}

function stopTimer(pageId, timerId) {
  const key = `${pageId}_${timerId}`
  if (timers.has(key)) { clearInterval(timers.get(key)); timers.delete(key) }
}

function stopAllTimers(pageId) {
  for (const [key, timer] of timers) {
    if (key.startsWith(pageId)) { clearInterval(timer); timers.delete(key) }
  }
}

function addEventListener(pageId, event, handler) {
  const key = `${pageId}_${event}`
  listeners.set(key, { event, handler })
}

function removeAllListeners(pageId) {
  for (const [key, entry] of listeners) {
    if (key.startsWith(pageId)) listeners.delete(key)
  }
}

function cleanup(pageId) {
  stopAllTimers(pageId)
  removeAllListeners(pageId)
  Logger.debug('Lifecycle', `Cleaned up page: ${pageId}`)
}

function measurePerformance(label) {
  const start = Date.now()
  return () => {
    const elapsed = Date.now() - start
    Logger.debug('Perf', `${label}: ${elapsed}ms`)
    return elapsed
  }
}

const LifecycleBehavior = Behavior({
  lifetimes: {
    attached() {
      this._pageId = `page_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    },
    detached() {
      if (this._pageId) cleanup(this._pageId)
    }
  },
  methods: {
    safeSetTimer(id, fn, interval) { startTimer(this._pageId, id, fn, interval) },
    safeClearTimer(id) { stopTimer(this._pageId, id) },
    measure(label) { return measurePerformance(label) }
  }
})

module.exports = { startTimer, stopTimer, stopAllTimers, addEventListener, removeAllListeners, cleanup, measurePerformance, LifecycleBehavior }
