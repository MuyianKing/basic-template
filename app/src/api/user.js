export default {
  config: {
    prefix: '/system/user',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 用户列表（分页，TableDataInfo{rows,total}）
    ['get', '/list'],
    // 新增用户（POST /system/user）
    { add: ['post', ''] },
    // 修改用户（PUT /system/user）
    { save: ['put', ''] },
    // 删除用户（DELETE /system/user/{userIds}，路径参数，支持逗号分隔批量）
    { remove: ['delete', '/{userIds}'] },
    // 重置用户密码（PUT /system/user/resetPwd）
    ['put', '/resetPwd'],
    // 给用户分配角色（PUT /system/user/authRole，query 参数：userId + roleIds 逗号分隔）
    ['put', '/authRole'],
    // 用户已分配角色信息（GET /system/user/authRole/{userId}，路径参数；返回 user + roles 全量角色，flag 标记已分配）
    { getAuthRole: ['get', '/authRole/{userId}'] },
    // 个人中心：当前用户资料（GET /system/user/profile，返回 { data: 用户, roleGroup, postGroup }）
    { profile: ['get', '/profile'] },
    // 个人中心：修改资料（PUT /system/user/profile；与 GET 同路径，元组推导 key 冲突，须显式命名）
    { updateProfile: ['put', '/profile'] },
    // 个人中心：修改密码（PUT /system/user/profile/updatePwd，body: { oldPassword, newPassword }）
    { updatePwd: ['put', '/profile/updatePwd'] },
    // 个人中心：上传头像（POST /system/user/profile/avatar，multipart 字段 avatarfile，返回 imgUrl）
    { uploadAvatar: ['post', '/profile/avatar'] },
  ],
}
