<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { isSuperAdminRole } from '@const/role'
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { error, success } from '@muyianking/ui'
import { getLabelByVal } from '@muyianking/utils'
import FluentCubeTree20Filled from '~icons/fluent/cube-tree-20-filled'
import FluentPeopleTeam20Filled from '~icons/fluent/people-team-20-filled'
import AuthUserDialog from './components/AuthUserDialog.vue'
import EditDialog from './components/EditDialog.vue'
import MenuAuthDialog from './components/MenuAuthDialog.vue'

defineOptions({
  name: 'MuRoleIndex',
})

const {
  query,
  page_query,
  table_data,
  loading,
  search,
  getData,
} = useList({
  query: {
    roleName: '',
    roleKey: '',
    status: '',
  },
  server: params => withPage(api.role.list, params),
})

const config = [
  {
    label: '角色编号',
    prop: 'roleId',
  },
  {
    label: '角色名称',
    prop: 'roleName',
    align: 'left',
  },
  {
    label: '权限字符',
    prop: 'roleKey',
    align: 'left',
  },
  {
    label: '显示顺序',
    prop: 'roleSort',
  },
  {
    label: '状态',
    prop: 'status',
  },
  {
    label: '创建时间',
    prop: 'createTime',
  },
]

const queryConfig = [
  {
    label: '角色名称',
    prop: 'roleName',
  },
  {
    label: '权限字符',
    prop: 'roleKey',
  },
  {
    label: '角色状态',
    prop: 'status',
    comp: 'MuSelect',
    props: {
      options: STATUS_OPTIONS,
      clearable: true,
    },
  },
]

// 表单弹窗：字段规整与默认值在 RoleModel（见 components/EditDialog.vue）
// openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData },
    params: row,
  })
}

// 分配用户弹窗：展示已分配用户，支持取消单个/批量取消授权、批量添加用户授权
function openAuthUser(row) {
  openDialog(AuthUserDialog, {
    params: row,
  })
}

// 绑定菜单弹窗：菜单树勾选后调角色修改接口提交 menuIds
function openMenuAuth(row) {
  openDialog(MenuAuthDialog, {
    params: row,
  })
}

async function handleDelete(row) {
  // 超级管理员必须保留一个：内置超管角色不允许删除
  if (isSuperAdminRole(row)) {
    error('超级管理员角色不允许删除')
    return
  }
  const result = await api.role.remove({ roleId: row.roleId })
  if (result) {
    success('删除成功')
    getData()
  }
}
</script>

<template>
  <mu-smart-list :loading="loading" :page-query="page_query" :table-data="table_data" fixed-button @search="search" @add="openForm" @update-page="page_query.page = $event" @update-size="page_query.limit = $event">
    <template #search>
      <mu-smart-query v-model="query" :config="queryConfig" />
    </template>

    <template #table>
      <mu-smart-table :data="table_data.data" :config :operation-props="{ width: 160 }">
        <template #status="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ getLabelByVal(STATUS_OPTIONS, row.status) || row.status }}</el-tag>
        </template>

        <template #operation="{ row }">
          <mu-edit-button @click="openForm(row)" />
          <mu-del-button @click="handleDelete(row)" />
          <mu-button mode="icon" :icon="FluentPeopleTeam20Filled" tip="分配用户" @click="openAuthUser(row)" />
          <mu-button mode="icon" :icon="FluentCubeTree20Filled" tip="绑定菜单" @click="openMenuAuth(row)" />
        </template>
      </mu-smart-table>
    </template>
  </mu-smart-list>
</template>

<style scoped></style>
