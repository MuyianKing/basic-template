<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { OPER_STATUS_OPTIONS, OPER_TYPE_OPTIONS } from '@const/log'
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { getLabelByVal } from '@muyianking/utils'
import DetailDialog from './components/DetailDialog.vue'

defineOptions({
  name: 'MuOperLogIndex',
})

const {
  query,
  page_query,
  table_data,
  loading,
  search,
} = useList({
  query: {
    operIp: '',
    title: '',
    operName: '',
    businessType: '',
    status: '',
    dateRange: [],
  },
  // 操作时间区间按若依约定经 params[beginTime]/params[endTime] 传递
  server: ({ dateRange = [], ...params }) => {
    const [beginTime = '', endTime = ''] = dateRange
    return withPage(api.operlog.list, { ...params, params: { beginTime, endTime } })
  },
})

const config = [
  {
    label: '日志编号',
    prop: 'operId',
  },
  {
    label: '系统模块',
    prop: 'title',
    align: 'left',
  },
  {
    label: '操作类型',
    prop: 'businessType',
  },
  {
    label: '操作人员',
    prop: 'operName',
  },
  {
    label: '操作地址',
    prop: 'operIp',
  },
  {
    label: '操作地点',
    prop: 'operLocation',
  },
  {
    label: '操作状态',
    prop: 'status',
  },
  {
    label: '操作日期',
    prop: 'operTime',
  },
  {
    label: '消耗时间',
    prop: 'costTime',
  },
]

const queryConfig = [
  {
    label: '操作地址',
    prop: 'operIp',
  },
  {
    label: '系统模块',
    prop: 'title',
  },
  {
    label: '操作人员',
    prop: 'operName',
  },
  {
    label: '类型',
    prop: 'businessType',
    comp: 'MuSelect',
    props: {
      options: OPER_TYPE_OPTIONS,
      clearable: true,
    },
  },
  {
    label: '状态',
    prop: 'status',
    comp: 'MuSelect',
    props: {
      options: OPER_STATUS_OPTIONS,
      clearable: true,
    },
  },
  {
    label: '操作时间',
    prop: 'dateRange',
  },
]

// 详情弹窗：仅查看，无刷新回调
function openDetail(row) {
  openDialog(DetailDialog, { params: row })
}
</script>

<template>
  <mu-smart-list :loading="loading" :page-query="page_query" :table-data="table_data" no-add fixed-button @search="search" @update-page="page_query.page = $event" @update-size="page_query.limit = $event">
    <template #search>
      <mu-smart-query v-model="query" :config="queryConfig">
        <template #dateRange>
          <el-date-picker v-model="query.dateRange" class="w-96" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </template>
      </mu-smart-query>
    </template>

    <template #table>
      <mu-smart-table :data="table_data.data" :config>
        <template #businessType="{ row }">
          {{ getLabelByVal(OPER_TYPE_OPTIONS, row.businessType) || row.businessType }}
        </template>

        <template #status="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ getLabelByVal(OPER_STATUS_OPTIONS, row.status) || row.status }}</el-tag>
        </template>

        <template #costTime="{ row }">
          {{ row.costTime }}毫秒
        </template>

        <template #operation="{ row }">
          <mu-detail-button @click="openDetail(row)" />
        </template>
      </mu-smart-table>
    </template>
  </mu-smart-list>
</template>

<style scoped></style>
