/**
 * 字典数据表单模型：字段规整与默认值（新增默认状态正常，dictType 由选中类型预置）
 */
export default class {
  constructor(model) {
    model = model || {}

    // 字典数据主键ID
    this.dictCode = model.dictCode || ''
    // 所属字典类型（键）
    this.dictType = model.dictType || ''
    // 字典标签
    this.dictLabel = model.dictLabel || ''
    // 字典键值
    this.dictValue = model.dictValue || ''
    // 显示排序（?? 保住 0 值）
    this.dictSort = model.dictSort ?? ''
    // 状态
    this.status = model.status || '0'
  }
}
