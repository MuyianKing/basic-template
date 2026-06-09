<script setup>
import { useList } from '@mu/hooks'
import { MuSmartQuery, MuSmartTable, openDialog } from '@mu/smartui'
import EditDialog from './components/EditDialog.vue'

const {
  MuListPage,
  query,
  table_data,
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
    showOverflowTooltip: true,
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
  <mu-list-page fixed-button @add="openForm">
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
  </mu-list-page>
</template>

<style scoped></style>
