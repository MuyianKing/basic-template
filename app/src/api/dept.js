export default {
  config: {
    prefix: '/system/dept',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 部门列表（全量树形数据，不分页）
    ['get', '/list'],
    // 新增部门（POST /system/dept）
    { add: ['post', ''] },
    // 修改部门（PUT /system/dept）
    { save: ['put', ''] },
    // 删除部门（DELETE /system/dept/{deptId}，路径参数）
    { remove: ['delete', '/{deptId}'] },
    // 部门列表（排除指定部门及其子部门，GET /system/dept/list/exclude/{deptId}，路径参数；选择上级部门用）
    { listExclude: ['get', '/list/exclude/{deptId}'] },
  ],
}
