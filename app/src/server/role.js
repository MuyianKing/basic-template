/**
 * 角色可复用业务逻辑：菜单权限 id 的祖先补齐与读取（新增/修改角色、绑定菜单弹窗共用）
 */
import { api } from '@http'

/**
 * 按菜单树把给定菜单 id 的祖先节点补齐（去重）
 * 角色的菜单回显接口在父子联动模式（menuCheckStrictly）下会省略父节点，需按树结构补回来
 * @param {Array} menus 菜单树（TreeSelect 结构：{ id, label, children }）
 * @param {Array<number|string>} ids 已勾选/已入库的菜单 id
 * @returns {Array<number|string>} 补齐祖先后的菜单 id
 */
export function fillMenuAncestors(menus, ids) {
  const keySet = new Set(ids || [])
  const ancestors = new Set()
  const walk = (nodes, chain) => {
    nodes.forEach((node) => {
      const nextChain = [...chain, node.id]
      if (keySet.has(node.id)) {
        nextChain.slice(0, -1).forEach(id => ancestors.add(id))
      }
      if (node.children?.length) {
        walk(node.children, nextChain)
      }
    })
  }
  walk(menus || [], [])
  return [...new Set([...keySet, ...ancestors])]
}

/**
 * 取角色当前的菜单权限 id（含补齐的祖先节点）
 * 用于角色信息新增/修改时原样回传：若依后端按 menuIds 重建角色-菜单关联，缺省会报错
 * @param {number|string} roleId 角色ID
 * @returns {Promise<Array<number|string>|null>} 菜单 id 数组；请求失败返回 null
 */
export async function getRoleMenuIds(roleId) {
  const res = await api.menu.roleMenuTreeselect({ roleId })
  if (!res) {
    return null
  }
  return fillMenuAncestors(res.menus || [], res.checkedKeys || [])
}
