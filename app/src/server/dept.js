/**
 * 部门可复用业务逻辑：平铺列表组树（树形表格与上级部门选择共用）
 */
import { api, withPage } from '@http'
import { makeTree } from '@muyianking/utils'

/**
 * 平铺部门列表按 parentId 组树；搜索过滤后父节点可能不在结果中，这类节点（及 parentId 为 0 的根节点）按根处理
 * @param {Array} data 接口返回的平铺部门列表
 * @returns {Array} 树形部门列表
 */
export function buildDeptTree(data) {
  const ids = new Set(data.map(item => String(item.deptId)))
  return makeTree(data, {
    props: { label: 'deptName', value: 'deptId', parent: 'parentId' },
    extend_keys: ['orderNum', 'status', 'createTime'],
    // rootCheck 收到的是组树后的节点，字段名沿用原始数据（deptId/parentId），不是 value/parent
    rootCheck: item => item.deptId != null && !ids.has(String(item.parentId)),
  })
}

/**
 * 全量部门列表（树形）：取平铺列表后组树，返回 useList 的 server 约定结构 { count, data }
 * @param {object} [query] 查询参数（deptName/status 等）
 */
export async function getDeptList(query = {}) {
  const { count, data } = await withPage(api.dept.list, query)
  return { count, data: buildDeptTree(data) }
}

/**
 * 上级部门候选树：排除指定部门及其子部门（编辑时避免把自己或子孙选为上级）
 * @param {number|string} deptId 要排除的部门ID
 * @returns {Promise<Array>} 树形部门列表
 */
export async function getDeptTreeExclude(deptId) {
  const result = await api.dept.listExclude({ deptId })
  return buildDeptTree(result?.data || [])
}
