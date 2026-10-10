<script setup>
import { MuSmartTable } from '@comp/smartui'

const dataList = ref([
  {
    name: 'muyian',
    age: 12,
    pos: '测试',
  },
])

const config = [
  {
    label: '姓名',
    prop: 'name',
    props: {
      align: 'center',
      width: '200px',
    },
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
</script>

<template>
  <div class="p-2">
    <mu-smart-table :data="dataList" :config>
      <template #name-header>
        <span class="text-green-400">姓名</span>
      </template>
      <template #name="{ row }">
        <span class="text-green-400">{{ row.name }}</span>
      </template>
    </mu-smart-table>
  </div>
</template>

<style scoped></style>
