/**
 * 角色表单模型：字段规整与默认值（新增默认状态正常）
 */
export default class {
  constructor(model) {
    model = model || {}

    // 主键ID
    this.roleId = model.roleId || ''
    // 角色名称
    this.roleName = model.roleName || ''
    // 权限字符
    this.roleKey = model.roleKey || ''
    // 显示顺序（?? 保住 0 值）
    this.roleSort = model.roleSort ?? ''
    // 状态
    this.status = model.status || '0'
    // 父子联动（后端缺省即写 false：所有角色保存必须显式带上该字段，否则会被静默关闭）
    this.menuCheckStrictly = model.menuCheckStrictly ?? true
  }
}
