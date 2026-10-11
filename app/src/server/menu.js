/**
 * 菜单可复用业务逻辑：平铺列表组树（树形列表与上级菜单选择共用）
 */
import { api, withPage } from '@http'
import { makeTree } from '@muyianking/utils'

// 可作为上级菜单的类型：目录与菜单（按钮不能挂子级）
const PARENT_TYPES = ['M', 'C']

/**
 * 平铺菜单列表按 parentId 组树；搜索过滤后父节点可能不在结果中，这类节点（及 parentId 为 0 的根节点）按根处理
 * @param {Array} data 接口返回的平铺菜单列表
 * @returns {Array} 树形菜单列表
 */
export function buildMenuTree(data) {
  const ids = new Set(data.map(item => String(item.menuId)))
  return makeTree(data, {
    props: { label: 'menuName', value: 'menuId', parent: 'parentId' },
    extend_keys: ['parentId', 'menuType', 'orderNum', 'path', 'component', 'routeName', 'perms', 'query', 'isFrame', 'isCache', 'status'],
    // rootCheck 收到的是组树后的节点，字段名沿用原始数据（menuId/parentId），不是 value/parent
    rootCheck: item => item.menuId != null && !ids.has(String(item.parentId)),
  })
}

/**
 * 树形菜单节点转 el-table 懒加载节点：摘除 children 挂到 _children 并标记 hasChildren，
 * 子节点在表格行展开时经 :load 取出渲染（后端 /system/menu/list 忽略 parentId 过滤，子节点来自本地组好的树）
 * @param {object} item 组树后的菜单节点（含 children）
 * @returns {object} 不含 children 的懒加载节点
 */
export function toMenuLazyNode(item) {
  const { children, ...rest } = item
  return {
    ...rest,
    _children: children || [],
    hasChildren: Boolean(children && children.length),
  }
}

/**
 * 菜单列表（树形懒加载根节点）：取全量平铺列表后组树并转为懒加载节点，返回 useList 的 server 约定结构 { count, data }
 * 带 menuName/status 搜索条件时后端返回过滤后的平铺列表，直接平铺展示（父节点可能不在结果中，组树意义不大）
 * @param {object} [query] 查询参数（menuName/status 等）
 */
export async function getMenuList(query = {}) {
  const { count, data } = await withPage(api.menu.list, query)
  const filtered = Boolean(query.menuName || query.status)
  return { count, data: filtered ? data : buildMenuTree(data || []).map(toMenuLazyNode) }
}

/**
 * 上级菜单候选树（仅目录与菜单，虚拟根节点「主类目」由选择器补充）
 * @param {number|string} [menuId] 要排除的菜单ID：编辑时传自身 menuId，候选树排除自己及子菜单，避免把自己选为上级
 * @returns {Promise<Array>} 树形菜单列表
 */
export async function getMenuTree(menuId) {
  const { data } = await withPage(api.menu.list)
  const parent_map = new Map((data || []).map(item => [item.menuId, item.parentId]))
  const list = (data || []).filter((item) => {
    if (!PARENT_TYPES.includes(item.menuType)) {
      return false
    }
    if (menuId != null && String(item.menuId) === String(menuId)) {
      return false
    }
    // 沿父链判断是否在 menuId 子树内
    let parentId = item.parentId
    while (parentId) {
      if (menuId != null && String(parentId) === String(menuId)) {
        return false
      }
      parentId = parent_map.get(parentId)
    }
    return true
  })
  return buildMenuTree(list)
}
