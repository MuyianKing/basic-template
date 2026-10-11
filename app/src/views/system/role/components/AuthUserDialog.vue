<script setup>
import { openDialog } from '@comp/smartui'
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { confirm, success } from '@muyianking/ui'
import AddUserDialog from './AddUserDialog.vue'

defineOptions({
  name: 'MuRoleAuthUserDialog',
})

const show = ref(false)
const roleId = ref('')
// 当前角色名称，用于弹窗标题
const roleName = ref('')
// el-table 多选的选中行
const selection = ref([])

const {
  query,
  page_query,
  table_data,
  loading,
  getData,
} = useList({
  query: {
    roleId: '',
  },
  server: params => withPage(api.role.authUser.allocatedList, params),
  // 弹窗挂载时 roleId 还未赋值，由 open() 写入 query 后经 autoUpdate 自动请求
  autoSearch: false,
})

function handleSelectionChange(rows) {
  selection.value = rows
}

function open(row) {
  roleId.value = row.roleId
  roleName.value = row.roleName
  query.value.roleId = row.roleId
  show.value = true
}

/**
 * 取消单个授权：PUT /system/role/authUser/cancel（body: SysUserRole{userId, roleId}）
 * text 模式的 mu-del-button 不带二次确认，这里自行 confirm
 * @param {*} row 已分配用户行
 */
async function handleCancel(row) {
  const ok = await confirm(`您确定取消用户「${row.userName}」的授权？`).catch(() => false)
  if (!ok) {
    return
  }
  const result = await api.role.authUser.cancel({ userId: row.userId, roleId: roleId.value })
  if (result) {
    success('取消授权成功')
    getData()
  }
}

/**
 * 批量取消授权：cancelAll 为 PUT + query 参数
 * userIds 以逗号分隔字符串传递（Spring 数组绑定，axios 默认数组序列化带 [] 会绑定失败）
 */
async function handleBatchCancel() {
  const userIds = selection.value.map(row => row.userId)
  const ok = await confirm(`您确定取消选中 ${userIds.length} 个用户的授权？`).catch(() => false)
  if (!ok) {
    return
  }
  const result = await api.role.authUser.cancelAll({}, { params: { roleId: roleId.value, userIds: userIds.join(',') } })
  if (result) {
    success('取消授权成功')
    getData()
  }
}

// 添加用户弹窗：openDialog 不转发业务事件，授权成功后的列表刷新经 props.onRefresh 接线
function openAdd() {
  openDialog(AddUserDialog, {
    props: { onRefresh: getData },
    params: { roleId: roleId.value },
  })
}

defineExpose({
  open,
})
</script>

<template>
  <mu-dialog v-model="show" :title="`分配用户 - ${roleName}`" width="900px">
    <div class="flex flex-col">
      <div class="flex mb-2.5">
        <el-button type="danger" plain :disabled="!selection.length" @click="handleBatchCancel">批量取消授权</el-button>
        <el-button type="primary" plain @click="openAdd">添加用户</el-button>
      </div>

      <el-table v-loading="loading" :data="table_data.data" border stripe table-layout="auto" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="用户编号" prop="userId" align="center" />
        <el-table-column label="用户名称" prop="userName" align="left" />
        <el-table-column label="用户昵称" prop="nickName" align="left" />
        <el-table-column label="手机号" prop="phonenumber" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <mu-del-button text="取消授权" @click="handleCancel(row)" />
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-2.5">
        <mu-page :model-value="page_query.page" :size="page_query.limit" :count="table_data.count" @update:model-value="page_query.page = $event" @update:size="page_query.limit = $event" />
      </div>
    </div>
  </mu-dialog>
</template>

<style scoped></style>
