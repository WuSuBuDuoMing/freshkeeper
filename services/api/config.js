/**
 * @file API 环境配置
 * @description 管理不同环境下的 API 基础配置，支持开发/测试/生产环境切换
 * @module services/api/config
 */

/**
 * 环境配置对象
 * @type {Object}
 */
const ENV = {
  /** 开发环境 */
  development: {
    /** API 基础地址 */
    baseUrl: 'http://localhost:3000/api',
    /** 请求超时时间（毫秒） */
    timeout: 10000
  },
  /** 测试环境 */
  staging: {
    /** API 基础地址 */
    baseUrl: 'https://staging-api.fridge.example.com/api',
    /** 请求超时时间（毫秒） */
    timeout: 15000
  },
  /** 生产环境 */
  production: {
    /** API 基础地址 */
    baseUrl: 'https://api.fridge.example.com/api',
    /** 请求超时时间（毫秒） */
    timeout: 20000
  }
}

/**
 * 当前环境标识
 * 可通过构建脚本在打包时替换此值
 * @type {'development'|'staging'|'production'}
 */
const currentEnv = 'development'

/**
 * API 版本号
 * @type {string}
 */
const version = 'v1'

module.exports = {
  ...ENV[currentEnv],
  currentEnv,
  version
}
