export default {
  config: {
    prefix: '/system/dict/type',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 字典类型列表（分页，TableDataInfo{rows,total}）
    ['get', '/list'],
    // 新增字典类型（POST /system/dict/type）
    { add: ['post', ''] },
    // 修改字典类型（PUT /system/dict/type）
    { save: ['put', ''] },
    // 删除字典类型（DELETE /system/dict/type/{dictIds}，路径参数，多个逗号分隔）
    { remove: ['delete', '/{dictIds}'] },
    // 刷新字典缓存（DELETE /system/dict/type/refreshCache）
    { refreshCache: ['delete', '/refreshCache'] },
  ],
}
