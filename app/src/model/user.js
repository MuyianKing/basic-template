/**
 * 用户表单模型：字段规整与默认值（新增默认状态正常）
 */
export default class {
  constructor(model) {
    model = model || {}

    // 主键ID
    this.userId = model.userId || ''
    // 部门ID
    this.deptId = model.deptId ?? ''
    // 用户名称（登录账号）
    this.userName = model.userName || ''
    // 用户昵称
    this.nickName = model.nickName || ''
    // 手机号
    this.phonenumber = model.phonenumber || ''
    // 状态
    this.status = model.status || '0'
  }
}
