<script setup>
import { useSmartForm } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { isSuperAdminRole } from '@const/role'
import { api } from '@http'
import RoleModel from '@model/role'
import { getRoleMenuIds } from '@server/role'

defineOptions({
  name: 'MuRoleEditDialog',
})

const config = [
  {
    label: '角色名称',
    prop: 'roleName',
    rules: 'required,maxLength=30',
  },
  {
    label: '权限字符',
    prop: 'roleKey',
    rules: 'required,maxLength=100',
  },
  {
    label: '显示顺序',
    prop: 'roleSort',
    rules: 'required,integer',
  },
  {
    label: '状态',
    prop: 'status',
    comp: 'radio',
    compProps: {
      options: STATUS_OPTIONS,
    },
  },
]

/**
 * 保存角色：有 roleId 为修改，否则新增
 * 若依新增/修改角色会按 menuIds 重建角色-菜单关联，缺省会直接报错（menuIds 为 null）；
 * 修改时须原样回传当前菜单权限（回显接口会省略父节点，经 getRoleMenuIds 补齐祖先）
 * @param {*} model 表单数据（经 RoleModel 规整）
 */
async function handleSubmit(model) {
  // 超级管理员必须保留一个：内置超管角色不允许停用
  // （form-dialog 会以 throw 的 message 弹错，无需再手动提示）
  if (isSuperAdminRole(model) && model.status === '1') {
    throw new Error('超级管理员角色不允许停用')
  }
  let menuIds = []
  if (model.roleId) {
    menuIds = await getRoleMenuIds(model.roleId)
    // 菜单权限获取失败时必须中断：按空数组提交会清空该角色的菜单关联
    if (!menuIds) {
      throw new Error('保存失败')
    }
  }
  const result = model.roleId
    ? await api.role.save({ ...model, menuIds })
    : await api.role.add({ ...model, menuIds })
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 表单弹窗：字段规整与默认值在 RoleModel，行数据直接打开
const { SmartForm, open } = useSmartForm({ Model: RoleModel })

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出 -->
  <smart-form title="角色信息" :config :server="handleSubmit" />
</template>

<style scoped></style>
