import { error } from '@muyianking/ui'
import { isTruth, readBlobAsJSON } from '@muyianking/utils'

import axios from 'axios'

class RespError extends Error {
  constructor(error) {
    super(error.error)
    this.error = error.error || ''
    this.errno = error.errno || ''
  }
}

// 成功响应码：若依 200 与项目历史约定 1；后端成功时返回字符串 '200'，失败返回数字 500/401，统一按数值比较
const SUCCESS_CODES = [200, 1]

/**
 * 解析响应数据，处理Blob类型转JSON的情况
 */
async function parseResponseData(data) {
  if (data instanceof Blob && data.type === 'application/json') {
    return await readBlobAsJSON(data)
  }
  return data
}

export class Http {
  constructor(baseURL, params = {}) {
    this.instance = axios.create()

    /* 默认超时时间 */
    this.instance.defaults.timeout = params.timeout || 60000 * 5

    // 根路径
    this.instance.defaults.baseURL = baseURL

    // 过滤器
    this.interceptors = params.interceptors || {}

    this.setInterceptors()
  }

  /**
   * 统一请求方法，处理noError逻辑
   */
  async request(config, noError) {
    if (noError) {
      return this.instance(config)
    }
    try {
      return await this.instance(config)
    } catch (e) {
      error(e)
      return null
    }
  }

  setInterceptors() {
    // 添加请求拦截器
    this.instance.interceptors.request.use((config) => {
      if (typeof this.interceptors.request === 'function') {
        return this.interceptors.request(config)
      }

      const user = useUserStore()
      if (isTruth(user.token)) {
        // 若依后端要求 Authorization: Bearer <token>（见 docs/api-docs.json securitySchemes）
        config.headers.Authorization = `Bearer ${user.token}`
      }
      return config
    })

    // 添加响应拦截器
    this.instance.interceptors.response.use(async (response) => {
      const data = await parseResponseData(response.data)

      if (typeof this.interceptors.response?.success === 'function') {
        return this.interceptors.response.success(data)
      }

      const errno = Number(data.code)
      if (data.code !== undefined && !SUCCESS_CODES.includes(errno)) {
        if (errno === -2 || errno === 401) {
          window.location.href = '#/login'
          return Promise.reject(new RespError({
            errno,
            error: '登录信息失效',
          }))
        } else {
          return Promise.reject(new RespError({
            errno,
            error: data.msg,
          }))
        }
      } else {
        if (response.config.keepHeader) {
          return Promise.resolve({
            data,
            headers: response.headers,
          })
        } else {
          return Promise.resolve(data)
        }
      }
    }, async (err) => {
      if (typeof this.interceptors.response?.error === 'function') {
        return this.interceptors.response.error(err)
      }

      let resp_error = null

      if (err.response && err.response.data) {
        const data = await parseResponseData(err.response.data)

        resp_error = new RespError({
          errno: data.status || data.code,
          error: data.error || data.msg,
        })
      } else {
        resp_error = new RespError({
          errno: err?.response?.status || 999,
          error: err?.response?.statusText || err?.message || '程序出错或网络连接失败',
        })
      }

      // 认证失败：直接跳到登录
      if (resp_error.errno === '-2') {
        if (!window.location.href.includes('#/login')) {
          window.location.href = `#/login?msg=${encodeURIComponent(resp_error.error)}`
          setTimeout(() => {
            window.location.reload()
          }, 500)
        }
      }

      return Promise.reject(resp_error)
    })
  }

  async post(url, data, options) {
    const { noError, ..._options } = options || {}

    data = data || {}

    const headers = { 'Content-Type': 'application/json', ..._options?.headers }

    return this.request({
      method: 'post',
      url,
      data,
      ..._options,
      headers,
    }, noError)
  }

  async get(url, params = {}, options) {
    const { noError, ..._options } = options || {}

    return this.request({
      method: 'get',
      url,
      params,
      ..._options,
    }, noError)
  }

  /**
   * 上传
   * @param {FormData} data
   * @param {object} params
   */
  upload(data, params = {}) {
    if (!data) {
      return Promise.reject(new Error('文件不合法'))
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: params.timeout || (24 * 3600 * 1000),
    }

    // 上传进度配置
    if (params.onProgress && typeof params.onProgress === 'function') {
      config.onUploadProgress = params.onProgress
    }

    return this.instance.post(params.url, data, config)
  }

  /**
   * 下载文件
   * @param {string} url 下载地址
   * @param {object} params 参数
   * @param {string} method 请求方式
   * @param {object} options axios配置参数
   */
  async download(url, params, method, options) {
    method = (method || 'POST').toLowerCase()

    let result = null
    if (method === 'get') {
      result = await this.instance.get(url, {
        timeout: 60000,
        ...options,
        params,
        responseType: 'blob',
      })
    } else {
      result = await this.instance.post(url, params, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'blob',
        keepHeader: true,
      })
    }

    const blobFile = new Blob([result.data])
    const download_url = URL.createObjectURL(blobFile)

    let file_name = decodeURI(result.headers['content-disposition'])?.split('filename=')
    file_name = file_name.at(-1)

    return {
      url: download_url,
      file_name,
    }
  }
}

export default Http
