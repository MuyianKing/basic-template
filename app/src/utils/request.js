import apiDescriptors from '@api'
import { BASE_URL } from './app'
import Http from './request.class'

export const http = new Http(BASE_URL)

/**
 * 把单个接口描述符绑定为请求函数：GET 首参为 query，其余方法首参为 body
 */
function createRequest(descriptor) {
  const { method, url } = descriptor
  // 路径参数式 URL（如 /system/dept/{deptId}）：用首参中的同名字段替换占位符，首参本身仍按 GET=query / 其余=body 传递
  const hasPathParams = url.includes('{')
  const resolveUrl = params => (hasPathParams
    ? url.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(params?.[key] ?? ''))
    : url)
  if (method === 'get') {
    return (query, options) => http.get(resolveUrl(query), query, options)
  }
  if (http[method]) {
    return (data, options) => http[method](resolveUrl(data), data, options)
  }
  // Http 未封装的方法（put/delete 等）走统一 request
  return (data, options) => http.request({ method, url: resolveUrl(data), data, ...options })
}

/**
 * 递归遍历描述符树，把叶子 { method, url } 绑定为可调用的请求函数
 */
function bindApi(tree) {
  const bound = {}
  Object.entries(tree).forEach(([key, value]) => {
    if (value?.method && value?.url) {
      bound[key] = createRequest(value)
    } else if (value && typeof value === 'object') {
      bound[key] = bindApi(value)
    } else {
      bound[key] = value
    }
  })
  return bound
}

// 可调用的接口函数树，业务代码 import { api } from '@http' 直接调用
export const api = bindApi(apiDescriptors)

/**
 * 分页列表请求与数据规整：把 useList 的分页参数映射为 pageNum/pageSize 后调用接口函数，并把响应统一为 { count, data }
 * 兼容接口文档的两种返回结构：TableDataInfo{rows,total}（分页列表）与 AjaxResult{data}（全量列表，count 取列表长度）
 * @param {Function} apiFn - @http 函数树上的接口函数，如 api.dept.list
 * @param {object} [query] useList 请求参数
 * @param {number} [query.page] 页码，映射为后端的 pageNum
 * @param {number} [query.limit] 每页条数，映射为后端的 pageSize
 * @param {Function} [transform] - 数据转换函数，用于处理每行数据
 * @returns {object} { count, data } - 统一的分页数据格式
 */
export async function withPage(apiFn, { page, limit, ...params } = {}, transform) {
  const result = await apiFn({
    pageNum: page,
    pageSize: limit,
    ...params,
  })

  if (!result) {
    return { count: 0, data: [] }
  }

  const list = [result.rows, result.records, result.data].find(Array.isArray) || []

  if (typeof transform === 'function') {
    list.forEach((item, index) => {
      transform(item, index, list)
    })
  }
  return {
    count: result.total ?? list.length,
    data: list,
  }
}

export default http
