/**
 * @file 数据导出服务
 * @description 支持导出食材数据、采购清单为 CSV / JSON 格式，可保存到本地或分享
 * @module services/export-service
 */

/**
 * 导出食材列表为 CSV 字符串
 * 含 UTF-8 BOM 头，确保 Excel 正确识别中文编码
 * @returns {string} CSV 格式内容
 *
 * @example
 * const csv = exportService.exportFoodsToCSV()
 * exportService.saveFile(csv, '食材清单.csv', 'csv')
 */
function exportFoodsToCSV() {
  const foodService = require('./food-service')
  const foods = foodService.getAllFoods()

  const headers = ['名称', '分类', '数量', '单位', '存放位置', '购买日期', '过期日期', '状态', '备注']
  const rows = foods.map(f => [
    f.name,
    f.category,
    f.quantity,
    f.unit,
    f.storageArea || f.storageName || '',
    f.purchaseDate,
    f.expiryDate,
    f.status,
    f.notes || ''
  ])

  const bom = '﻿' // UTF-8 BOM for Excel
  const csv = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  return csv
}

/**
 * 导出采购清单为 CSV 字符串
 * @returns {string} CSV 格式内容
 *
 * @example
 * const csv = exportService.exportShoppingToCSV()
 * exportService.saveFile(csv, '采购清单.csv', 'csv')
 */
function exportShoppingToCSV() {
  const shoppingService = require('./shopping-service')
  const items = shoppingService.getAllShoppingItems()

  const headers = ['名称', '分类', '数量', '单位', '预估价格', '已购买', '来源']
  const rows = items.map(i => [
    i.name,
    i.category,
    i.quantity,
    i.unit,
    i.estimatedPrice,
    i.purchased ? '是' : '否',
    i.fromUsed ? '已用完补充' : '手动添加'
  ])

  const bom = '﻿'
  return bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

/**
 * 导出全部数据为 JSON 字符串
 * 包含食材、采购清单和菜谱数据
 * @returns {string} 格式化的 JSON 字符串
 *
 * @example
 * const json = exportService.exportAllToJSON()
 * exportService.saveFile(json, '冰箱数据.json', 'json')
 */
function exportAllToJSON() {
  const foodService = require('./food-service')
  const shoppingService = require('./shopping-service')
  const recipeService = require('./recipe-service')

  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    foods: foodService.getAllFoods(),
    shopping: shoppingService.getAllShoppingItems(),
    recipes: recipeService.getAllRecipes()
  }

  return JSON.stringify(data, null, 2)
}

/**
 * 保存文件到微信小程序本地存储
 * @param {string} content - 文件内容
 * @param {string} fileName - 文件名（含扩展名）
 * @param {string} [fileType='csv'] - 文件类型标识
 * @returns {Promise<string>} 保存后的文件完整路径
 *
 * @example
 * exportService.saveFile(csvContent, '食材清单.csv', 'csv')
 *   .then(path => console.log('文件已保存:', path))
 */
function saveFile(content, fileName, fileType = 'csv') {
  const fs = wx.getFileSystemManager()
  const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`

  return new Promise((resolve, reject) => {
    fs.writeFile({
      filePath,
      data: content,
      encoding: 'utf8',
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: `文件已保存到: ${fileName}`,
          showCancel: false,
          success: () => {
            // 尝试用 openDocument 打开预览
            wx.openDocument({
              filePath,
              showMenu: true,
              fail: () => {} // 打不开也不影响保存结果
            })
          }
        })
        resolve(filePath)
      },
      fail: reject
    })
  })
}

/**
 * 将数据复制到剪贴板（用于微信分享）
 * @param {string} data - 要复制的数据内容
 * @param {string} [title='数据'] - 提示标题
 *
 * @example
 * exportService.shareData(csvContent, '食材清单')
 */
function shareData(data, title) {
  wx.setClipboardData({
    data,
    success: () => {
      wx.showToast({
        title: '数据已复制到剪贴板',
        icon: 'success'
      })
    }
  })
}

module.exports = {
  exportFoodsToCSV,
  exportShoppingToCSV,
  exportAllToJSON,
  saveFile,
  shareData
}
