import { api } from '@http'

// 字典选项缓存：key 为 dictType，value 为选项 Promise，同一字典类型只请求一次
const dictCache = new Map()

/**
 * 按字典类型取字典选项（{label, value}，只含正常状态项），结果进程内缓存
 * @param {string} dictType 字典类型 key，如 sys_normal_disable
 * @returns {Promise<Array>} 选项列表，请求失败或 dictType 为空时返回 []
 */
export async function getDictOptions(dictType) {
  if (!dictType) {
    return []
  }
  if (!dictCache.has(dictType)) {
    const promise = (async () => {
      const result = await api.dictData.listByType({ dictType })
      return (result?.data || [])
        .filter(item => item.status === '0')
        .map(item => ({ label: item.dictLabel, value: item.dictValue }))
    })()
    // 请求失败不缓存，下次使用时重试
    promise.catch(() => dictCache.delete(dictType))
    dictCache.set(dictType, promise)
  }
  return dictCache.get(dictType).catch(() => [])
}

/**
 * 清空字典选项缓存（字典数据变更后调用，下次取值会重新请求）
 */
export function clearDictOptions() {
  dictCache.clear()
}
