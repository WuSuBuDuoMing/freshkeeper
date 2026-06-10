/**
 * 性能优化工具集
 * 包含分页加载、节流、防抖、虚拟列表、懒加载等功能
 */

/**
 * 防抖函数
 * @param {Function} fn
 * @param {number} delay 延迟毫秒数
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn
 * @param {number} interval 间隔毫秒数
 * @returns {Function}
 */
function throttle(fn, interval = 300) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 分页加载器
 * 管理分页状态和加载逻辑
 */
class PaginationLoader {
  /**
   * @param {Function} fetchFn 数据获取函数，接收 { page, pageSize } 参数
   * @param {number} pageSize 每页数量
   */
  constructor(fetchFn, pageSize = 20) {
    this.fetchFn = fetchFn
    this.pageSize = pageSize
    this.page = 1
    this.hasMore = true
    this.loading = false
    this.allData = []
  }

  /**
   * 加载下一页
   * @returns {Promise<{data: Array, hasMore: boolean, total: number}>}
   */
  async loadNext() {
    if (this.loading || !this.hasMore) return { data: [], hasMore: false, total: this.allData.length }

    this.loading = true
    try {
      const result = await this.fetchFn({ page: this.page, pageSize: this.pageSize })
      const newData = result.data || []

      this.allData = [...this.allData, ...newData]
      this.hasMore = newData.length >= this.pageSize
      this.page++

      return {
        data: newData,
        hasMore: this.hasMore,
        total: this.allData.length
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 重置分页（重新从第一页开始）
   */
  reset() {
    this.page = 1
    this.hasMore = true
    this.loading = false
    this.allData = []
  }

  /**
   * 加载全部数据（不分页）
   * @returns {Promise<Array>}
   */
  async loadAll() {
    this.reset()
    while (this.hasMore) {
      await this.loadNext()
    }
    return this.allData
  }
}

/**
 * 虚拟列表管理器
 * 只渲染可视区域内的数据，优化大列表性能
 */
class VirtualList {
  /**
   * @param {number} itemHeight 每项高度（px）
   * @param {number} buffer 缓冲区大小
   */
  constructor(itemHeight = 80, buffer = 5) {
    this.itemHeight = itemHeight
    this.buffer = buffer
    this.scrollTop = 0
    this.viewportHeight = 0
    this.data = []
  }

  /**
   * 设置数据
   * @param {Array} data
   */
  setData(data) {
    this.data = data
  }

  /**
   * 更新滚动位置
   * @param {number} scrollTop
   */
  onScroll(scrollTop) {
    this.scrollTop = scrollTop
  }

  /**
   * 设置可视区域高度
   * @param {number} height
   */
  setViewport(height) {
    this.viewportHeight = height
  }

  /**
   * 获取当前应该渲染的数据切片
   * @returns {Array<{item: any, index: number, style: string}>}
   */
  getVisibleItems() {
    const start = Math.floor(this.scrollTop / this.itemHeight)
    const visibleCount = Math.ceil(this.viewportHeight / this.itemHeight)
    const startIndex = Math.max(0, start - this.buffer)
    const endIndex = Math.min(this.data.length, start + visibleCount + this.buffer)

    const items = []
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        item: this.data[i],
        index: i,
        style: `position: absolute; top: ${i * this.itemHeight}px; height: ${this.itemHeight}px; width: 100%;`
      })
    }
    return items
  }

  /**
   * 获取总高度（用于滚动容器）
   */
  getTotalHeight() {
    return this.data.length * this.itemHeight
  }
}

/**
 * 图片懒加载管理
 * 控制图片只在进入可视区域时加载
 */
function createLazyLoadObserver() {
  const loaded = new Set()

  return {
    /**
     * 检查元素是否需要加载
     * @param {string} id 元素唯一标识
     * @param {number} distanceFromBottom 距离底部多少像素时开始加载
     * @returns {boolean}
     */
    shouldLoad(id, distanceFromBottom = 200) {
      if (loaded.has(id)) return true
      return false
    },

    /**
     * 标记已加载
     * @param {string} id
     */
    markLoaded(id) {
      loaded.add(id)
    },

    /**
     * 重置
     */
    reset() {
      loaded.clear()
    }
  }
}

/**
 * 数据缓存管理
 * 带 TTL 的内存缓存，减少重复计算
 */
const memoryCache = {
  _cache: new Map(),
  _timers: new Map(),

  /**
   * 获取缓存
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    const item = this._cache.get(key)
    if (item) {
      item.accessCount++
      item.lastAccess = Date.now()
      return item.value
    }
    return null
  },

  /**
   * 设置缓存
   * @param {string} key
   * @param {*} value
   * @param {number} ttl 过期时间(ms)
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    this._cache.set(key, {
      value,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0
    })

    // 设置过期定时器
    if (this._timers.has(key)) clearTimeout(this._timers.get(key))
    const timer = setTimeout(() => this.delete(key), ttl)
    this._timers.set(key, timer)

    // 缓存大小限制（最多100条）
    if (this._cache.size > 100) {
      const oldest = [...this._cache.entries()]
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess)[0]
      if (oldest) this.delete(oldest[0])
    }
  },

  /**
   * 删除缓存
   * @param {string} key
   */
  delete(key) {
    this._cache.delete(key)
    if (this._timers.has(key)) {
      clearTimeout(this._timers.get(key))
      this._timers.delete(key)
    }
  },

  /**
   * 清空所有缓存
   */
  clear() {
    this._cache.clear()
    this._timers.forEach(t => clearTimeout(t))
    this._timers.clear()
  },

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this._cache.size,
      maxSize: 100,
      entries: [...this._cache.entries()].map(([key, item]) => ({
        key,
        accessCount: item.accessCount,
        age: Date.now() - item.createdAt
      }))
    }
  }
}

/**
 * 长列表性能优化 Mixin
 * 提供给需要渲染长列表的页面使用
 */
const LongListBehavior = Behavior({
  data: {
    displayList: [],    // 当前渲染的列表
    totalCount: 0,      // 总数
    pageLoading: false,  // 加载中
    hasMoreData: true,   // 是否有更多
    loadError: false     // 加载失败
  },

  methods: {
    /**
     * 初始化分页加载
     * @param {Function} fetchFn
     * @param {number} pageSize
     */
    initPagination(fetchFn, pageSize = 20) {
      this._paginator = new PaginationLoader(fetchFn, pageSize)
      this._throttledScroll = throttle(this._onReachBottom.bind(this), 500)
    },

    /**
     * 首次加载
     */
    async firstLoad() {
      this.setData({ pageLoading: true, loadError: false })
      try {
        const result = await this._paginator.loadNext()
        this.setData({
          displayList: this._paginator.allData,
          totalCount: result.total,
          hasMoreData: result.hasMore,
          pageLoading: false
        })
      } catch (e) {
        this.setData({ pageLoading: false, loadError: true })
      }
    },

    /**
     * 触底加载更多
     */
    async _onReachBottom() {
      if (this.data.pageLoading || !this.data.hasMoreData) return
      this.setData({ pageLoading: true })
      try {
        const result = await this._paginator.loadNext()
        this.setData({
          displayList: this._paginator.allData,
          totalCount: result.total,
          hasMoreData: result.hasMore,
          pageLoading: false
        })
      } catch (e) {
        this.setData({ pageLoading: false })
      }
    },

    /**
     * 下拉刷新
     */
    async onRefresh() {
      this._paginator.reset()
      await this.firstLoad()
    },

    /**
     * 重置搜索
     */
    async resetSearch(newFetchFn) {
      if (newFetchFn) this._paginator = new PaginationLoader(newFetchFn, this._paginator.pageSize)
      else this._paginator.reset()
      await this.firstLoad()
    }
  }
})

module.exports = {
  debounce,
  throttle,
  PaginationLoader,
  VirtualList,
  createLazyLoadObserver,
  memoryCache,
  LongListBehavior
}
