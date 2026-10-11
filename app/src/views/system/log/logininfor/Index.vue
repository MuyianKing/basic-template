<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable } from '@comp/smartui'
import { LOGIN_STATUS_OPTIONS } from '@const/log'
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { getLabelByVal } from '@muyianking/utils'

defineOptions({
  name: 'MuLogininforIndex',
})

const {
  query,
  page_query,
  table_data,
  loading,
  search,
} = useList({
  query: {
    ipaddr: '',
    userName: '',
    status: '',
    dateRange: [],
  },
  // 登录时间区间按若依约定经 params[beginTime]/params[endTime] 传递
  server: ({ dateRange = [], ...params }) => {
    const [beginTime = '', endTime = ''] = dateRange
    return withPage(api.logininfor.list, { ...params, params: { beginTime, endTime } })
  },
})

const config = [
  {
    label: '访问编号',
    prop: 'infoId',
  },
  {
    label: '用户名称',
    prop: 'userName',
    align: 'left',
  },
  {
    label: '登录地址',
    prop: 'ipaddr',
  },
  {
    label: '登录地点',
    prop: 'loginLocation',
  },
  {
    label: '浏览器',
    prop: 'browser',
  },
  {
    label: '操作系统',
    prop: 'os',
  },
  {
    label: '登录状态',
    prop: 'status',
  },
  {
    label: '操作信息',
    prop: 'msg',
    align: 'left',
  },
  {
    label: '登录日期',
    prop: 'loginTime',
  },
]

const queryConfig = [
  {
    label: '登录地址',
    prop: 'ipaddr',
  },
  {
    label: '用户名',
    prop: 'userName',
  },
  {
    label: '状态',
    prop: 'status',
    comp: 'MuSelect',
    props: {
      options: LOGIN_STATUS_OPTIONS,
      clearable: true,
    },
  },
  {
    label: '登录时间',
    prop: 'dateRange',
  },
]
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
        <template #status="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ getLabelByVal(LOGIN_STATUS_OPTIONS, row.status) || row.status }}</el-tag>
        </template>
      </mu-smart-table>
    </template>
  </mu-smart-list>
</template>

<style scoped></style>
