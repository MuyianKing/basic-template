<script setup>
import { MuSmartQuery } from '@comp/smartui'
import { api } from '@http'
import { success } from '@muyianking/ui'

defineOptions({
  name: 'MuUserAssignRoleDialog',
})

const show = ref(false)
const loading = ref(false)
const saving = ref(false)
const userId = ref('')
// 当前用户昵称，用于弹窗标题
const nickName = ref('')
// 全量角色列表（接口自带 flag 标记是否已分配）
const roles = ref([])
const tableRef = ref()
// el-table 多选的选中行（reserve-selection 保留，含被搜索过滤掉的行）
const selection = ref([])

// 搜索为本地过滤（候选角色来自全量接口，不走分页查询）
const query = ref({
  roleName: '',
  roleKey: '',
})

const roleList = computed(() => {
  const { roleName = '', roleKey = '' } = query.value
  return roles.value.filter(role => (!roleName || role.roleName.includes(roleName)) && (!roleKey || role.roleKey.includes(roleKey)))
})

const queryConfig = [
  {
    label: '角色名称',
    prop: 'roleName',
  },
  {
    label: '权限字符',
    prop: 'roleKey',
  },
]

function handleSelectionChange(rows) {
  selection.value = rows
}

async function open(row) {
  userId.value = row.userId
  nickName.value = row.nickName
  selection.value = []
  roles.value = []
  show.value = true
  loading.value = true
  try {
    const result = await api.user.getAuthRole({ userId: row.userId })
    roles.value = result?.roles || []
    // 回显已分配角色：数据渲染后按 flag 勾选
    await nextTick()
    roles.value.filter(role => role.flag).forEach((role) => {
      tableRef.value?.toggleRowSelection(role, true)
    })
  } finally {
    loading.value = false
  }
}

/**
 * 分配角色：authRole 为 PUT + query 参数，全量覆盖语义（后端先删该用户角色关联再插入）
 * roleIds 以逗号分隔字符串传递（Spring 数组绑定，axios 默认数组序列化带 [] 会绑定失败）
 */
async function handleConfirm() {
  if (saving.value) {
    return
  }
  saving.value = true
  try {
    const roleIds = selection.value.map(row => row.roleId)
    const result = await api.user.authRole({}, { params: { userId: userId.value, roleIds: roleIds.join(',') } })
    if (!result) {
      return
    }
    success('分配成功')
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
  <mu-dialog v-model="show" :title="`分配角色 - ${nickName}`" width="900px">
    <div class="flex flex-col">
      <div class="flex">
        <!-- 搜索区：角色名称 / 权限字符（本地过滤，实时生效） -->
        <mu-smart-query v-model="query" :config="queryConfig" />
      </div>

      <!-- row-key + reserve-selection：搜索过滤后已勾选行不丢 -->
      <el-table ref="tableRef" v-loading="loading" :data="roleList" :row-key="row => row.roleId" max-height="420" border stripe table-layout="auto" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" reserve-selection align="center" />
        <el-table-column label="角色编号" prop="roleId" align="center" />
        <el-table-column label="角色名称" prop="roleName" align="left" />
        <el-table-column label="权限字符" prop="roleKey" align="left" />
        <el-table-column label="创建时间" prop="createTime" align="center" />
      </el-table>
    </div>

    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleConfirm">确定</el-button>
    </template>
  </mu-dialog>
</template>

<style scoped></style>
