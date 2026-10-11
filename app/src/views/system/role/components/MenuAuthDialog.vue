<script setup>
import { api } from '@http'
import { success } from '@muyianking/ui'
import { fillMenuAncestors } from '@server/role'

defineOptions({
  name: 'MuRoleMenuAuthDialog',
})

const show = ref(false)
// 当前角色（来自角色详情接口，保存时整体回传）
const role = ref({})
const roleName = ref('')
const treeRef = ref()
// 菜单树（TreeSelect：{ id, label, children }）
const menus = ref([])
const saving = ref(false)
// 父子联动（保存到角色的 menuCheckStrictly）：开启时后端回显省略父节点、树按级联推导；关闭时回显完整集合、各节点独立勾选
const menuCheckStrictly = ref(true)
// 树勾选是否父子不联动；回显时临时开启，避免父节点勾选自动带出全部子节点
const checkStrictly = ref(true)

async function load(roleId) {
  const [detail, treeRes] = await Promise.all([
    api.role.detail({ roleId }),
    api.menu.roleMenuTreeselect({ roleId }),
  ])
  if (!detail?.data || !treeRes) {
    return
  }
  role.value = detail.data
  menus.value = treeRes.menus || []
  menuCheckStrictly.value = !!detail.data.menuCheckStrictly
  // 必须先把树切到角色自身的联动模式再设置勾选：
  // - 联动模式：后端回显为叶子集合，el-tree 会在设置叶子时自下而上推导父节点状态
  // - 独立模式：后端回显为完整集合，各节点按原样设置
  // 顺序错误的后果：先在严格模式设 key 再切联动，父节点状态不会重算（父节点显示未勾选）
  checkStrictly.value = !menuCheckStrictly.value
  await nextTick()
  treeRef.value?.setCheckedKeys(treeRes.checkedKeys || [])
}

// 切换父子联动：按当前勾选在新模式下重新应用，保持父子状态一致
// - 切到联动模式：只设置叶子节点，父节点由树级联推导
// - 切到独立模式：全选 + 半选节点原样精确设置
async function handleStrictlyChange() {
  const tree = treeRef.value
  const keys = [...tree.getCheckedKeys(), ...tree.getHalfCheckedKeys()]
  checkStrictly.value = !menuCheckStrictly.value
  await nextTick()
  if (checkStrictly.value) {
    tree?.setCheckedKeys(keys)
  } else {
    tree?.setCheckedKeys(keys.filter(key => tree.getNode(key)?.isLeaf))
  }
}

function open(row) {
  roleName.value = row.roleName
  show.value = true
  load(row.roleId)
}

/**
 * 收集要提交的 menuIds：
 * - 父子联动（menuCheckStrictly=true）：全选 + 半选节点，并按树结构补齐勾选节点的全部祖先（fillMenuAncestors）——
 *   后端 checkedKeys 会省略「有已勾选子节点的父节点」，且联动回显后 el-tree 的级联状态可能不完整，
 *   只取 getCheckedKeys/getHalfCheckedKeys 会漏掉父节点，导致父菜单未入库、路由链断裂
 * - 父子不联动：按勾选原样提交（父节点不随子节点隐式绑定）
 */
function getMenuIds() {
  const keySet = [...treeRef.value.getCheckedKeys(), ...treeRef.value.getHalfCheckedKeys()]
  if (!menuCheckStrictly.value) {
    return [...new Set(keySet)]
  }
  return fillMenuAncestors(menus.value, keySet)
}

/**
 * 绑定菜单：调角色的修改接口（PUT /system/role），提交 menuIds 与父子联动设置
 */
async function handleSave() {
  if (saving.value) {
    return
  }
  saving.value = true
  try {
    const menuIds = getMenuIds()
    const result = await api.role.save({ ...role.value, menuCheckStrictly: menuCheckStrictly.value, menuIds })
    if (!result) {
      return
    }
    success('绑定菜单成功')
    show.value = false
  } finally {
    saving.value = false
  }
}

defineExpose({
  open,
})
</script>

<template>
  <mu-dialog v-model="show" :title="`绑定菜单 - ${roleName}`" width="600px">
    <div class="mb-2.5">
      <el-checkbox v-model="menuCheckStrictly" @change="handleStrictlyChange">父子联动</el-checkbox>
    </div>

    <el-tree ref="treeRef" v-loading="!menus.length" :data="menus" show-checkbox node-key="id" default-expand-all :check-strictly="checkStrictly" :props="{ label: 'label', children: 'children' }" />

    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">确定</el-button>
    </template>
  </mu-dialog>
</template>

<style scoped></style>
