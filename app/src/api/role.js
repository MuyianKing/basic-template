export default {
  config: {
    prefix: '/system/role',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 角色列表（分页，TableDataInfo{rows,total}）
    ['get', '/list'],
    // 新增角色（POST /system/role）
    { add: ['post', ''] },
    // 修改角色（PUT /system/role）
    { save: ['put', ''] },
    // 删除角色（DELETE /system/role/{roleId}，路径参数）
    { remove: ['delete', '/{roleId}'] },
    // 角色详情（GET /system/role/{roleId}），绑定菜单弹窗用它取完整角色数据回传
    { detail: ['get', '/{roleId}'] },
    // 已分配用户列表（分页，GET /system/role/authUser/allocatedList）
    ['get', '/authUser/allocatedList'],
    // 未分配用户列表（分页，GET /system/role/authUser/unallocatedList）
    ['get', '/authUser/unallocatedList'],
    // 取消单个授权（PUT /system/role/authUser/cancel，body: SysUserRole{userId, roleId}）
    ['put', '/authUser/cancel'],
    // 批量取消授权（PUT /system/role/authUser/cancelAll，query: roleId、userIds）
    ['put', '/authUser/cancelAll'],
    // 批量添加用户授权（PUT /system/role/authUser/selectAll，query: roleId、userIds）
    ['put', '/authUser/selectAll'],
  ],
}
