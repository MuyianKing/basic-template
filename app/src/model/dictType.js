/**
 * 字典类型表单模型：字段规整与默认值（新增默认状态正常）
 */
export default class {
  constructor(model) {
    model = model || {}

    // 字典主键ID
    this.dictId = model.dictId || ''
    // 字典名称
    this.dictName = model.dictName || ''
    // 字典类型（键）
    this.dictType = model.dictType || ''
    // 状态
    this.status = model.status || '0'
  }
}
