export default {
  config: {
    prefix: '/system/dict/data',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 字典数据列表（分页，TableDataInfo{rows,total}，query 支持 dictType/dictLabel/status）
    ['get', '/list'],
    // 按字典类型取字典数据（全量，GET /system/dict/data/type/{dictType}，路径参数，AjaxResult{data: SysDictData[]}）
    { listByType: ['get', '/type/{dictType}'] },
    // 新增字典数据（POST /system/dict/data）
    { add: ['post', ''] },
    // 修改字典数据（PUT /system/dict/data）
    { save: ['put', ''] },
    // 删除字典数据（DELETE /system/dict/data/{dictCodes}，路径参数，多个逗号分隔）
    { remove: ['delete', '/{dictCodes}'] },
  ],
}
