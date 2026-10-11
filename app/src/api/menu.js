export default {
  config: {
    prefix: '/system/menu',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 菜单列表（全量平铺数据，支持 menuName/status 过滤，不分页；忽略 parentId 过滤）
    ['get', '/list'],
    // 新增菜单（POST /system/menu）
    { add: ['post', ''] },
    // 修改菜单（PUT /system/menu，省略的字段不会被置空）
    { save: ['put', ''] },
    // 删除菜单（DELETE /system/menu/{menuId}，路径参数）
    { remove: ['delete', '/{menuId}'] },
    // 角色菜单树（GET /system/menu/roleMenuTreeselect/{roleId}，返回 menus 树与 checkedKeys，供角色绑定菜单回显）
    { roleMenuTreeselect: ['get', '/roleMenuTreeselect/{roleId}'] },
  ],
}
