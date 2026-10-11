export default {
  config: {
    prefix: '/system/post',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 岗位列表（分页，TableDataInfo{rows,total}）
    ['get', '/list'],
    // 新增岗位（POST /system/post）
    { add: ['post', ''] },
    // 修改岗位（PUT /system/post）
    { save: ['put', ''] },
    // 删除岗位（DELETE /system/post/{postId}，路径参数）
    { remove: ['delete', '/{postId}'] },
  ],
}
