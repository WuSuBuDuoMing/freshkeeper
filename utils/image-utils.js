/**
 * 图片工具函数
 * 封装拍照、相册选择、压缩、预览等功能
 */

/**
 * 从相册选择图片
 * @param {number} count 可选数量
 * @returns {Promise<Array>} 图片路径列表
 */
function chooseFromAlbum(count = 1) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['album'],
      sizeType: ['compressed'],
      success: (res) => resolve(res.tempFiles.map(f => f.tempFilePath)),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 拍照
 * @returns {Promise<Array>} 图片路径列表
 */
function takePhoto() {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      sizeType: ['compressed'],
      camera: 'back',
      success: (res) => resolve(res.tempFiles.map(f => f.tempFilePath)),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 选择图片（弹出操作菜单：拍照/相册）
 * @param {number} count
 * @returns {Promise<Array>}
 */
function chooseImage(count = 1) {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: async (res) => {
        try {
          if (res.tapIndex === 0) {
            const paths = await takePhoto()
            resolve(paths)
          } else {
            const paths = await chooseFromAlbum(count)
            resolve(paths)
          }
        } catch (e) {
          reject(e)
        }
      },
      fail: () => reject({ errMsg: '用户取消选择' })
    })
  })
}

/**
 * 压缩图片
 * @param {string} src 图片路径
 * @param {number} quality 压缩质量 1-100
 * @returns {Promise<string>} 压缩后的路径
 */
function compressImage(src, quality = 80) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 获取图片信息
 * @param {string} src 图片路径
 * @returns {Promise<object>} 图片信息
 */
function getImageInfo(src) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success: resolve,
      fail: reject
    })
  })
}

/**
 * 预览图片
 * @param {string} current 当前图片URL
 * @param {Array<string>} urls 所有图片URL列表
 */
function previewImage(current, urls) {
  wx.previewImage({ current, urls: urls || [current] })
}

/**
 * 上传图片到服务器
 * @param {string} filePath 本地临时文件路径
 * @param {string} url 上传地址
 * @param {string} name 文件字段名
 * @param {object} formData 额外表单数据
 * @returns {Promise<object>} 上传结果
 */
function uploadImage(filePath, url, name = 'file', formData = {}) {
  return new Promise((resolve, reject) => {
    const task = wx.uploadFile({
      url,
      filePath,
      name,
      formData,
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          resolve(data)
        } catch (e) {
          resolve({ url: filePath })
        }
      },
      fail: reject
    })
    // 支持取消
    return task
  })
}

/**
 * 批量上传图片
 * @param {Array<string>} filePaths
 * @param {string} url
 * @returns {Promise<Array>}
 */
async function batchUploadImages(filePaths, url) {
  const results = []
  for (const path of filePaths) {
    try {
      const res = await uploadImage(path, url)
      results.push({ success: true, data: res })
    } catch (e) {
      results.push({ success: false, error: e })
    }
  }
  return results
}

/**
 * 将图片转为 Base64
 * @param {string} filePath
 * @returns {Promise<string>}
 */
function imageToBase64(filePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (res) => resolve(`data:image/png;base64,${res.data}`),
      fail: reject
    })
  })
}

/**
 * 保存图片到相册
 * @param {string} filePath
 * @returns {Promise<void>}
 */
function saveImageToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: resolve,
      fail: reject
    })
  })
}

module.exports = {
  chooseFromAlbum,
  takePhoto,
  chooseImage,
  compressImage,
  getImageInfo,
  previewImage,
  uploadImage,
  batchUploadImages,
  imageToBase64,
  saveImageToAlbum
}
