<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api } from '@http'
import { useList } from '@muyianking/hooks'
import { success } from '@muyianking/ui'
import { getLabelByVal } from '@muyianking/utils'
import { getDeptList } from '@server/dept'
import EditDialog from './components/EditDialog.vue'

defineOptions({
  name: 'MuDeptIndex',
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
    deptName: '',
    status: '',
  },
  // 部门树组树逻辑抽在 @server/dept（上级部门树选择器共用），返回 { count, data } 结构
  server: getDeptList,
})

const config = [
  {
    label: '部门名称',
    prop: 'deptName',
    align: 'left',
  },
  {
    label: '排序',
    prop: 'orderNum',
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
    label: '部门名称',
    prop: 'deptName',
  },
  {
    label: '状态',
    prop: 'status',
    comp: 'MuSelect',
    props: {
      options: STATUS_OPTIONS,
      clearable: true,
    },
  },
]

// 表单弹窗：字段规整与默认值在 DeptModel（见 components/EditDialog.vue）
// openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData },
    params: row,
  })
}

async function handleDelete(row) {
  const result = await api.dept.remove({ deptId: row.deptId })
  if (result) {
    success('删除成功')
    getData()
  }
}
</script>

<template>
  <mu-smart-list :loading="loading" :page-query="page_query" :table-data="table_data" no-page fixed-button @search="search" @add="openForm">
    <template #search>
      <mu-smart-query v-model="query" :config="queryConfig" />
    </template>

    <template #table>
      <!-- row-key / default-expand-all / tree-props 经 attrs 透传到 smart-table 根节点 el-table -->
      <mu-smart-table :data="table_data.data" :config row-key="deptId" default-expand-all :tree-props="{ children: 'children' }">
        <template #status="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ getLabelByVal(STATUS_OPTIONS, row.status) || row.status }}</el-tag>
        </template>

        <template #operation="{ row }">
          <mu-edit-button @click="openForm(row)" />
          <mu-del-button @click="handleDelete(row)" />
        </template>
      </mu-smart-table>
    </template>
  </mu-smart-list>
</template>

<style scoped></style>
