<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { success } from '@muyianking/ui'
import { getLabelByVal } from '@muyianking/utils'
import EditDialog from './components/EditDialog.vue'

defineOptions({
  name: 'MuPostIndex',
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
    postCode: '',
    postName: '',
    status: '',
  },
  server: params => withPage(api.post.list, params),
})

const config = [
  {
    label: '岗位编号',
    prop: 'postId',
  },
  {
    label: '岗位编码',
    prop: 'postCode',
    align: 'left',
  },
  {
    label: '岗位名称',
    prop: 'postName',
    align: 'left',
  },
  {
    label: '岗位排序',
    prop: 'postSort',
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
    label: '岗位编码',
    prop: 'postCode',
  },
  {
    label: '岗位名称',
    prop: 'postName',
  },
  {
    label: '岗位状态',
    prop: 'status',
    comp: 'MuSelect',
    props: {
      options: STATUS_OPTIONS,
      clearable: true,
    },
  },
]

// 表单弹窗：字段规整与默认值在 PostModel（见 components/EditDialog.vue）
// openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData },
    params: row,
  })
}

async function handleDelete(row) {
  const result = await api.post.remove({ postId: row.postId })
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
      <mu-smart-table :data="table_data.data" :config>
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
