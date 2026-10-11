/**
 * 部门表单模型：字段规整与默认值（新增默认状态正常）
 */
export default class {
  constructor(model) {
    model = model || {}

    // 主键ID
    this.deptId = model.deptId || ''
    // 上级部门ID（?? 保住 0；新增时必选，默认空）
    this.parentId = model.parentId ?? ''
    // 部门名称
    this.deptName = model.deptName || ''
    // 排序（?? 保住 0 值）
    this.orderNum = model.orderNum ?? ''
    // 状态
    this.status = model.status || '0'
  }
}
