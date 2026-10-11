/**
 * 菜单表单模型：字段规整与默认值（新增默认目录类型、非外链、缓存、正常状态）
 */
export default class {
  constructor(model) {
    model = model || {}

    // 主键ID
    this.menuId = model.menuId || ''
    // 上级菜单ID（?? 保住 0；0 即虚拟根节点「主类目」）
    this.parentId = model.parentId ?? ''
    // 菜单类型（M 目录 / C 菜单 / F 按钮）
    this.menuType = model.menuType || 'M'
    // 菜单名称
    this.menuName = model.menuName || ''
    // 显示排序（?? 保住 0 值）
    this.orderNum = model.orderNum ?? ''
    // 路由地址（目录/菜单）
    this.path = model.path || ''
    // 路由名称（菜单）
    this.routeName = model.routeName || ''
    // 权限字符（菜单/按钮）
    this.perms = model.perms || ''
    // 路由参数（菜单）
    this.query = model.query || ''
    // 是否外链（0 是 / 1 否）
    this.isFrame = model.isFrame || '1'
    // 是否缓存（0 缓存 / 1 不缓存）
    this.isCache = model.isCache || '0'
    // 菜单状态
    this.status = model.status || '0'
  }
}
