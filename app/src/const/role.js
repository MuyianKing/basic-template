// 内置超级管理员角色（roleId=1），系统必须保留一个，不允许删除/停用
export const SUPER_ADMIN_ROLE_ID = 1

/**
 * 是否超级管理员角色：以行上的 admin 标记为准（后端 SysRole.admin），兜底内置 roleId
 * @param {{ admin?: boolean, roleId?: number|string }} row 角色行或表单模型
 * @returns {boolean} 是否超级管理员角色
 */
export function isSuperAdminRole(row) {
  return Boolean(row?.admin) || row?.roleId === SUPER_ADMIN_ROLE_ID
}
