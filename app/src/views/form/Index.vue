<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { useList } from '@muyianking/hooks'
import EditDialog from './components/EditDialog.vue'

const {
  query,
  page_query,
  table_data,
  loading,
  search,
} = useList({
  query: {
    sex: 2,
  },
  server: () => {
    return {
      count: 100,
      data: [
        {
          name: '张三',
          age: 25,
          pos: '工程师',
        },
      ],
    }
  },
})

const config = [
  {
    label: '姓名',
    prop: 'name',
    align: 'center',
    width: '200px',
  },
  {
    label: '年龄',
    prop: 'age',
  },
  {
    label: '职位',
    prop: 'pos',
  },
]

const queryConfig = [
  {
    label: '姓名',
    prop: 'name',
  },
  {
    label: '年龄',
    prop: 'age',
    props: {
      modelModifiers: 'number',
      type: 'number',
    },
  },
  {
    label: '性别',
    prop: 'sex',
    comp: 'MuSelect',
    props: {
      options: [
        {
          label: '男',
          value: 1,
        },
        {
          label: '女',
          value: 2,
        },
      ],
    },
  },
]

function openForm() {
  openDialog(EditDialog)
}
</script>

<template>
  <mu-smart-list :loading="loading" :page-query="page_query" :table-data="table_data" fixed-button @search="search" @add="openForm" @update-page="page_query.page = $event" @update-size="page_query.limit = $event">
    <template #search>
      <mu-smart-query v-model="query" :config="queryConfig" />
    </template>

    <template #table>
      <mu-smart-table :data="table_data.data" :config>
        <template #operation="row">
          <mu-edit-button @click="openForm(row)" />
          <mu-del-button />
        </template>
      </mu-smart-table>
    </template>
  </mu-smart-list>
</template>

<style scoped></style>
