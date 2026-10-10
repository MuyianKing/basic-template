import { BASE_URL } from './app'
import Http from './request.class'

export const http = new Http(BASE_URL)

/**
 * 分页数据处理工具函数
 * @param {Function | object} resultOrFn - 数据或返回数据的异步函数
 * @param {Function} [transform] - 数据转换函数，用于处理每行数据
 * @returns {object} { count, data } - 统一的分页数据格式
 */
export async function withPage(resultOrFn, transform) {
  const result = typeof resultOrFn === 'function' ? await resultOrFn() : resultOrFn
  if (!result) {
    return { count: 0, data: [] }
  }
  const list = result.rows || []
  if (typeof transform === 'function') {
    list.forEach((item, index) => {
      transform(item, index, list)
    })
  }
  return {
    count: result.total || 0,
    data: list,
  }
}

export default http
