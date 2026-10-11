<script setup>
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { success } from '@muyianking/ui'

defineOptions({
  name: 'MuRoleAuthUserAddDialog',
})

const emit = defineEmits(['refresh'])

const show = ref(false)
const roleId = ref('')
// el-table 多选的选中行
const selection = ref([])
const saving = ref(false)

const {
  query,
  page_query,
  table_data,
  loading,
} = useList({
  query: {
    roleId: '',
  },
  server: params => withPage(api.role.authUser.unallocatedList, params),
  // 弹窗挂载时 roleId 还未赋值，由 open() 写入 query 后经 autoUpdate 自动请求
  autoSearch: false,
})

function handleSelectionChange(rows) {
  selection.value = rows
}

function open(row) {
  roleId.value = row.roleId
  query.value.roleId = row.roleId
  show.value = true
}

/**
 * 批量添加用户授权：selectAll 为 PUT + query 参数
 * userIds 以逗号分隔字符串传递（Spring 数组绑定，axios 默认数组序列化带 [] 会绑定失败）
 */
async function handleConfirm() {
  if (!selection.value.length || saving.value) {
    return
  }
  saving.value = true
  try {
    const userIds = selection.value.map(row => row.userId)
    const result = await api.role.authUser.selectAll({}, { params: { roleId: roleId.value, userIds: userIds.join(',') } })
    if (!result) {
      return
    }
    success('授权成功')
    emit('refresh')
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
  <mu-dialog v-model="show" title="添加用户" width="900px">
    <el-table v-loading="loading" :data="table_data.data" border stripe table-layout="auto" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="用户编号" prop="userId" align="center" />
      <el-table-column label="用户名称" prop="userName" align="left" />
      <el-table-column label="用户昵称" prop="nickName" align="left" />
      <el-table-column label="手机号" prop="phonenumber" align="center" />
    </el-table>

    <div class="flex justify-end mt-2.5">
      <mu-page :model-value="page_query.page" :size="page_query.limit" :count="table_data.count" @update:model-value="page_query.page = $event" @update:size="page_query.limit = $event" />
    </div>

    <template #footer>
      <el-button @click="show = false">取消</el-button>
      <el-button type="primary" :disabled="!selection.length" :loading="saving" @click="handleConfirm">确定</el-button>
    </template>
  </mu-dialog>
</template>

<style scoped></style>
