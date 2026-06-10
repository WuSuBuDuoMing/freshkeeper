/**
 * @file 家庭成员组件
 * @description 展示家庭成员信息，包含头像、名称、角色标签和最近活动记录
 * @module components/family-member
 */

const familyService = require('../../services/family-service')

/**
 * 角色显示配置
 * @type {Object}
 * @private
 */
const ROLE_MAP = {
  owner: { text: '管理员', color: '#FF6B35' },
  member: { text: '成员', color: '#4ECDC4' }
}

/**
 * 家庭成员组件
 * @class FamilyMember
 */
Component({
  /**
   * 组件属性
   * @type {Object}
   */
  properties: {
    /** 成员数据对象，包含 id/name/role/joinDate/avatar */
    member: {
      type: Object,
      value: {}
    },
    /** 是否显示最近活动 */
    showActivity: {
      type: Boolean,
      value: true
    },
    /** 是否显示操作按钮（如移除） */
    showActions: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   * @type {Object}
   */
  data: {
    /** 角色配置映射 */
    roleMap: ROLE_MAP,
    /** 该成员最近的活动记录 */
    recentActivity: null
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      if (this.properties.showActivity) {
        this._loadRecentActivity()
      }
    }
  },

  /**
   * 属性监听器
   */
  observers: {
    'member, showActivity': function (member, showActivity) {
      if (showActivity && member && member.name) {
        this._loadRecentActivity()
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 加载该成员最近的活动记录
     * @private
     */
    _loadRecentActivity() {
      const activities = familyService.getFamilyActivity()
      const memberName = this.properties.member.name
      const recent = activities.find(a => a.user === memberName)
      if (recent) {
        this.setData({ recentActivity: recent })
      }
    },

    /**
     * 获取角色显示文本
     * @param {string} role - 角色标识
     * @returns {string} 角色中文名称
     */
    getRoleText(role) {
      return ROLE_MAP[role] ? ROLE_MAP[role].text : '成员'
    },

    /**
     * 获取角色标签颜色
     * @param {string} role - 角色标识
     * @returns {string} 颜色值
     */
    getRoleColor(role) {
      return ROLE_MAP[role] ? ROLE_MAP[role].color : '#999999'
    },

    /**
     * 处理移除成员按钮点击
     */
    handleRemove() {
      const member = this.properties.member
      wx.showModal({
        title: '移除成员',
        content: `确定要移除 ${member.name} 吗？`,
        success: (res) => {
          if (res.confirm) {
            familyService.removeMember(member.id)
            this.triggerEvent('removed', { memberId: member.id })
            wx.showToast({
              title: '已移除',
              icon: 'success'
            })
          }
        }
      })
    }
  }
})
