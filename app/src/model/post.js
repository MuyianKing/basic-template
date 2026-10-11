/**
 * 岗位表单模型：字段规整与默认值（新增默认状态正常）
 */
export default class {
  constructor(model) {
    model = model || {}

    // 主键ID
    this.postId = model.postId || ''
    // 岗位编码
    this.postCode = model.postCode || ''
    // 岗位名称
    this.postName = model.postName || ''
    // 岗位排序（?? 保住 0 值）
    this.postSort = model.postSort ?? ''
    // 状态
    this.status = model.status || '0'
  }
}
