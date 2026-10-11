import api from '@api'
import { BASE_URL } from '@app'
import http from '@http'

/**
 * 把若依上传接口的返回项归一化为 MuUpload / MuFile 使用的 { id, name, path } 结构
 * /common/upload 返回 { fileName, newFileName, url, originalFilename }，url 为绝对地址
 * @param {object} item 上传接口返回项
 * @param {string} [name] 多文件接口拿不到对象形式的原始文件名时兜底
 */
function normalizeUploadItem(item, name = '') {
  const path = item.url || (item.fileName ? BASE_URL + item.fileName : '')
  return {
    id: item.newFileName || path,
    name: item.originalFilename || name || item.newFileName || path,
    path,
  }
}

/**
 * 拆开多文件上传接口返回的逗号拼接字符串
 * @param {string} value 如 '/profile/a.txt,/profile/b.txt'
 */
function splitJoined(value) {
  return (value || '').split(',').filter(Boolean)
}

/**
 * 上传文件
 * @param {File|Array} files File类型的数组或File对象
 * @param {object} params
 * @param {Function} [params.onProgress] 上传进度回调（axios onUploadProgress）
 * @returns {Promise<Array<{id: string, name: string, path: string}>>} 归一化后的上传结果
 */
export async function uploadFile(files, params = {}) {
  // 一个文件转成统一的数组
  if (files instanceof File) {
    files = [files]
  }

  // 文件格式错误
  if (!(Array.isArray(files))) {
    throw new TypeError('上传文件格式错误')
  }

  // 没有文件
  if (files.length === 0) {
    return []
  }

  const data = new FormData()
  for (const item of files) {
    data.append(files.length > 1 ? 'files' : 'file', item)
  }

  // 多文件走 /common/uploads，返回逗号拼接的字段；单文件走 /common/upload，返回对象
  const multi = files.length > 1
  const result = await http.upload(data, {
    url: multi ? api.common.uploads.url : api.common.upload.url,
    onProgress: params.onProgress,
  })

  if (multi) {
    const urls = splitJoined(result.urls)
    return splitJoined(result.newFileNames).map((newFileName, index) => normalizeUploadItem({
      newFileName,
      fileName: splitJoined(result.fileNames)[index],
      url: urls[index],
      originalFilename: splitJoined(result.originalFilenames)[index],
    }, files[index]?.name))
  }
  return [normalizeUploadItem(result)]
}

/**
 * 上传（差量）：列表里有 File 的项重新上传，字符串/数字项视为已上传的资源 id 原样保留
 * @param {Array|object} medias
 *
 * Object{
 *  file：如果是File类型表示需要重新上传，如果是字符串或数字表示不需要上传
 * }
 * @returns {Promise<Array<string|number>>} 上传后的资源 id 列表（新上传的为 newFileName）与保留的旧 id 拼接
 */
export async function uploadObject(medias, params = {}) {
  if (!(Array.isArray(medias))) {
    medias = [medias.file]
  } else {
    medias = medias.map(media => media.file)
  }

  // 需要上传的文件
  const files = medias.filter(item => item instanceof File)
  // 上传
  const uploaded = await uploadFile(files, params)

  // 不需要上传的文件
  const ids = medias.filter(item => !(item instanceof File))
  return uploaded.map(item => item.id).concat(ids)
}
