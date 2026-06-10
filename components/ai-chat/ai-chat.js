/**
 * AI 对话组件
 * 支持流式输出的聊天界面
 */
const aiEngine = require('../../services/ai-recipe-engine')

Component({
  properties: {
    /** 冰箱食材列表 */
    foods: { type: Array, value: [] },
    /** 是否自动聚焦输入框 */
    autoFocus: { type: Boolean, value: true }
  },

  data: {
    /** 聊天消息列表 */
    messages: [],
    /** 输入框内容 */
    inputValue: '',
    /** 是否正在生成中 */
    generating: false,
    /** 是否已展开 */
    expanded: false,
    /** 滚动定位 ID */
    scrollToId: '',
    /** 快捷操作选项 */
    quickActions: [
      { key: 'recommend', label: '智能推荐', icon: '🤖' },
      { key: 'expiring', label: '临期食材菜谱', icon: '⏰' },
      { key: 'healthy', label: '低卡健康', icon: '🥗' },
      { key: 'quick', label: '10分钟快手', icon: '⚡' }
    ]
  },

  methods: {
    /**
     * 展开/收起聊天面板
     */
    togglePanel() {
      this.setData({ expanded: !this.data.expanded })
      if (!this.data.expanded && this.data.messages.length === 0) {
        this._addAIMessage(
          '你好！我是 AI 菜谱助手 🧑‍🍳\n\n告诉我你冰箱里有什么食材，我来帮你推荐菜谱！\n\n你也可以点击下方快捷按钮直接开始。'
        )
      }
    },

    /**
     * 快捷操作点击
     * @param {object} e 事件对象
     */
    onQuickAction(e) {
      const { key } = e.currentTarget.dataset
      if (this.data.generating) return

      const actionMap = {
        recommend: '请根据我冰箱里的食材推荐菜谱',
        expiring: '请用我冰箱里即将过期的食材推荐菜谱',
        healthy: '请推荐低卡健康的菜谱',
        quick: '请推荐10分钟内能做好的快手菜'
      }

      const text = actionMap[key] || '请推荐菜谱'
      this._sendMessage(text)
    },

    /**
     * 输入框内容变化
     * @param {object} e 事件对象
     */
    onInputChange(e) {
      this.setData({ inputValue: e.detail.value })
    },

    /**
     * 发送消息
     */
    onSend() {
      const text = this.data.inputValue.trim()
      if (!text || this.data.generating) return
      this._sendMessage(text)
    },

    /**
     * 内部：发送用户消息并触发 AI 回复
     * @param {string} text 用户消息文本
     */
    async _sendMessage(text) {
      // 添加用户消息
      const userMsg = {
        id: 'msg_' + Date.now(),
        role: 'user',
        content: text,
        timestamp: this._formatTime(new Date())
      }
      const messages = [...this.data.messages, userMsg]
      this.setData({ messages: messages, inputValue: '', generating: true })
      this._scrollToBottom()

      // 添加 AI 占位消息
      const aiMsgId = 'msg_' + Date.now() + '_ai'
      const aiMsg = {
        id: aiMsgId,
        role: 'ai',
        content: '',
        loading: true,
        timestamp: this._formatTime(new Date())
      }
      this.setData({
        messages: [...this.data.messages, aiMsg]
      })
      this._scrollToBottom()

      try {
        const prompt = this._buildChatPrompt(text)
        const foods = this.data.foods.length > 0 ? this.data.foods : this._getDefaultFoods()

        // 使用流式输出
        let fullContent = ''
        await aiEngine.callAIStream(prompt, (chunk) => {
          fullContent += chunk
          const idx = this.data.messages.findIndex(m => m.id === aiMsgId)
          if (idx !== -1) {
            const msgs = [...this.data.messages]
            msgs[idx] = { ...msgs[idx], content: fullContent, loading: false }
            this.setData({ messages: msgs })
            this._scrollToBottom()
          }
        })

        // 尝试解析 JSON 菜谱并格式化展示
        const recipes = this._tryParseRecipes(fullContent)
        if (recipes.length > 0) {
          const formatted = this._formatRecipesAsText(recipes)
          const idx = this.data.messages.findIndex(m => m.id === aiMsgId)
          if (idx !== -1) {
            const msgs = [...this.data.messages]
            msgs[idx] = {
              ...msgs[idx],
              content: formatted,
              recipes: recipes,
              loading: false
            }
            this.setData({ messages: msgs })
          }
        }

        this.triggerEvent('recipesgenerated', { recipes: recipes })
      } catch (err) {
        const idx = this.data.messages.findIndex(m => m.id === aiMsgId)
        if (idx !== -1) {
          const msgs = [...this.data.messages]
          msgs[idx] = {
            ...msgs[idx],
            content: '抱歉，生成菜谱时出现了错误，请稍后重试。',
            loading: false,
            isError: true
          }
          this.setData({ messages: msgs })
        }
        console.error('[AI Chat] generate error:', err)
      } finally {
        this.setData({ generating: false })
      }
    },

    /**
     * 构建对话 prompt
     * @param {string} userText 用户输入
     * @returns {string}
     */
    _buildChatPrompt(userText) {
      const foods = this.data.foods
      if (foods.length === 0) {
        return '用户说：' + userText +
          '\n\n请根据对话内容推荐菜谱（JSON 格式，包含 name, ingredients, difficulty, cookingTime, calories, steps, reason, tags 字段）。'
      }

      const foodList = foods.map(f => f.name + '(' + f.quantity + f.unit + ')').join('、')
      let prompt = '现有冰箱食材：' + foodList + '\n\n'
      prompt += '用户说：' + userText + '\n\n'
      prompt += '请推荐 3 道菜谱，以 JSON 格式回复：\n'
      prompt += '[{"name":"菜名","ingredients":["食材"],"missingIngredients":["缺少的"],"difficulty":"简单","cookingTime":10,"calories":180,"steps":["步骤"],"reason":"推荐理由","tags":["标签"]}]'
      return prompt
    },

    /**
     * 获取默认食材（测试用）
     * @returns {Array}
     */
    _getDefaultFoods() {
      return [
        { name: '番茄', quantity: 3, unit: '个' },
        { name: '鸡蛋', quantity: 6, unit: '个' },
        { name: '西兰花', quantity: 1, unit: '棵' },
        { name: '猪肉', quantity: 300, unit: 'g' }
      ]
    },

    /**
     * 尝试从文本中解析 JSON 菜谱
     * @param {string} text
     * @returns {Array}
     */
    _tryParseRecipes(text) {
      try {
        const parsed = JSON.parse(text)
        if (Array.isArray(parsed)) return parsed
      } catch (e) {
        const match = text.match(/\[[\s\S]*?\]/)
        if (match) {
          try {
            const parsed = JSON.parse(match[0])
            if (Array.isArray(parsed)) return parsed
          } catch (e2) {
            // 解析失败
          }
        }
      }
      return []
    },

    /**
     * 格式化菜谱为展示文本
     * @param {Array} recipes
     * @returns {string}
     */
    _formatRecipesAsText(recipes) {
      return recipes.map((r, i) => {
        let text = '【' + (i + 1) + '】' + r.name + '\n'
        text += '难度：' + r.difficulty + ' | 时间：' + r.cookingTime + '分钟 | 热量：' + r.calories + '卡\n'
        if (r.ingredients) text += '食材：' + r.ingredients.join('、') + '\n'
        if (r.steps) {
          text += '步骤：\n'
          r.steps.forEach((s, j) => { text += '  ' + (j + 1) + '. ' + s + '\n' })
        }
        if (r.reason) text += '推荐理由：' + r.reason + '\n'
        return text
      }).join('\n')
    },

    /**
     * 重新生成上次的回复
     */
    onRegenerate() {
      if (this.data.generating) return
      const msgs = this.data.messages
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'user') {
          this.setData({ messages: msgs.slice(0, i + 1) })
          this._sendMessage(msgs[i].content)
          return
        }
      }
    },

    /**
     * 复制 AI 最后一条消息
     */
    onCopyLast() {
      const msgs = this.data.messages
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'ai' && msgs[i].content) {
          wx.setClipboardData({
            data: msgs[i].content,
            success: () => {
              wx.showToast({ title: '已复制', icon: 'success' })
            }
          })
          return
        }
      }
    },

    /**
     * 添加 AI 消息（内部方法）
     * @param {string} content 消息内容
     */
    _addAIMessage(content) {
      const msg = {
        id: 'msg_' + Date.now(),
        role: 'ai',
        content: content,
        loading: false,
        timestamp: this._formatTime(new Date())
      }
      this.setData({ messages: [...this.data.messages, msg] })
    },

    /**
     * 滚动到底部
     */
    _scrollToBottom() {
      this.setData({ scrollToId: 'msg_bottom' })
    },

    /**
     * 格式化时间
     * @param {Date} date
     * @returns {string}
     */
    _formatTime(date) {
      const h = date.getHours().toString().padStart(2, '0')
      const m = date.getMinutes().toString().padStart(2, '0')
      return h + ':' + m
    }
  }
})
