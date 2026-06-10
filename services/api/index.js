/**
 * @file API 统一入口
 * @description 汇总导出所有 API 模块，业务层只需从此文件引入即可
 * @module services/api
 *
 * @example
 * // 在页面中使用
 * const { foodApi, recipeApi, shoppingApi, userApi, aiApi } = require('../../services/api')
 *
 * // 或者单独引入需要的模块
 * const { getFoodList } = require('../../services/api/modules/food-api')
 */

const config = require('./config')
const request = require('./request')
const interceptors = require('./interceptors')

// API 模块
const foodApi = require('./modules/food-api')
const recipeApi = require('./modules/recipe-api')
const shoppingApi = require('./modules/shopping-api')
const userApi = require('./modules/user-api')
const aiApi = require('./modules/ai-api')

module.exports = {
  // --- 配置与底层工具 ---
  config,
  request,
  interceptors,

  // --- 业务 API 模块 ---
  foodApi,
  recipeApi,
  shoppingApi,
  userApi,
  aiApi
}
