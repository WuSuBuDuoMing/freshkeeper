/**
 * @file 家庭共享服务
 * @description 支持家庭组成员共享冰箱数据，包括创建家庭组、邀请码加入、成员管理等
 * @module services/family-service
 */

const storage = require('../utils/storage-utils')
const { generateId } = require('../utils/mock-utils')

/**
 * 家庭组数据存储键
 * @type {string}
 * @private
 */
const STORAGE_KEY = 'family_group'

/**
 * 创建家庭组
 * @param {string} creatorName - 创建者名称
 * @returns {Object} 新创建的家庭组信息
 *
 * @example
 * const family = familyService.createFamily('周先生')
 * // => { id: 'family_xxx', name: '周先生的冰箱', inviteCode: 'ABC123', ... }
 */
function createFamily(creatorName) {
  const family = {
    id: generateId('family'),
    name: `${creatorName}的冰箱`,
    creator: creatorName,
    inviteCode: generateInviteCode(),
    members: [{
      id: generateId('member'),
      name: creatorName,
      role: 'owner',
      joinDate: new Date().toISOString(),
      avatar: '👤'
    }],
    createdAt: new Date().toISOString()
  }
  storage.set(STORAGE_KEY, family)
  return family
}

/**
 * 生成邀请码（6位，排除易混淆字符）
 * @returns {string} 6位大写字母+数字邀请码
 * @private
 */
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * 通过邀请码加入家庭组
 * @param {string} inviteCode - 邀请码
 * @param {string} memberName - 新成员名称
 * @returns {Object} { success: boolean, family?: Object, error?: string }
 *
 * @example
 * const result = familyService.joinFamily('ABC123', '周太太')
 * // => { success: true, family: { ... } }
 */
function joinFamily(inviteCode, memberName) {
  const family = getFamilyInfo()
  if (!family) {
    return { success: false, error: '家庭组不存在' }
  }

  if (family.inviteCode !== inviteCode) {
    return { success: false, error: '邀请码无效' }
  }

  // 检查是否已是成员
  const existing = family.members.find(m => m.name === memberName)
  if (existing) {
    return { success: false, error: '该成员已存在' }
  }

  const newMember = {
    id: generateId('member'),
    name: memberName,
    role: 'member',
    joinDate: new Date().toISOString(),
    avatar: '👤'
  }

  family.members.push(newMember)
  storage.set(STORAGE_KEY, family)
  return { success: true, family }
}

/**
 * 获取家庭组信息
 * @returns {Object|null} 家庭组信息，不存在则返回 null
 *
 * @example
 * const family = familyService.getFamilyInfo()
 * if (family) {
 *   console.log(family.name, family.members.length)
 * }
 */
function getFamilyInfo() {
  return storage.get(STORAGE_KEY, null)
}

/**
 * 获取家庭成员列表
 * @returns {Array<Object>} 成员列表，每个成员包含 id/name/role/joinDate/avatar
 *
 * @example
 * const members = familyService.getMembers()
 * members.forEach(m => console.log(m.name, m.role))
 */
function getMembers() {
  const family = getFamilyInfo()
  return family ? family.members : []
}

/**
 * 移除家庭成员
 * @param {string} memberId - 要移除的成员 ID
 * @returns {boolean} 是否移除成功
 *
 * @example
 * familyService.removeMember('member_001')
 */
function removeMember(memberId) {
  const family = getFamilyInfo()
  if (!family) return false

  // 不允许移除 owner
  const member = family.members.find(m => m.id === memberId)
  if (member && member.role === 'owner') return false

  family.members = family.members.filter(m => m.id !== memberId)
  storage.set(STORAGE_KEY, family)
  return true
}

/**
 * 退出家庭组（当前用户离开）
 * @returns {boolean} 是否退出成功
 */
function leaveFamily() {
  storage.remove(STORAGE_KEY)
  return true
}

/**
 * 获取家庭活动记录（Mock 数据）
 * @returns {Array<Object>} 活动列表，每项包含 id/user/action/target/time
 *
 * @example
 * const activities = familyService.getFamilyActivity()
 * activities.forEach(a => console.log(`${a.user}${a.action}${a.target}`))
 */
function getFamilyActivity() {
  return [
    { id: 'act_1', user: '周先生', action: '添加了', target: '番茄 3个', time: '2小时前' },
    { id: 'act_2', user: '周太太', action: '标记用完', target: '牛奶', time: '3小时前' },
    { id: 'act_3', user: '周先生', action: '购买了', target: '鸡胸肉 500g', time: '昨天' },
    { id: 'act_4', user: '周太太', action: '生成了', target: '一周菜单', time: '昨天' },
    { id: 'act_5', user: '周先生', action: '删除了', target: '过期面包', time: '2天前' }
  ]
}

module.exports = {
  createFamily,
  joinFamily,
  getFamilyInfo,
  getMembers,
  removeMember,
  leaveFamily,
  getFamilyActivity,
  generateInviteCode
}
