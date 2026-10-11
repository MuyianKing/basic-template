<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { confirm, error, success } from '@muyianking/ui'
import { getLabelByVal } from '@muyianking/utils'
import FluentAdd20Regular from '~icons/fluent/add-20-regular'
import FluentArrowSyncCircle20Regular from '~icons/fluent/arrow-sync-circle-20-regular'
import FluentDelete20Regular from '~icons/fluent/delete-20-regular'
import FluentEdit20Regular from '~icons/fluent/edit-20-regular'
import FluentSearch20Regular from '~icons/fluent/search-20-regular'
import DataEditDialog from './components/DataEditDialog.vue'
import TypeEditDialog from './components/TypeEditDialog.vue'

defineOptions({
  name: 'MuDictIndex',
})

// ---------- 左侧：字典类型 ----------
const {
  query: typeQuery,
  page_query: typePageQuery,
  table_data: typeTableData,
  loading: typeLoading,
  getData: getTypeList,
} = useList({
  query: {
    dictName: '',
  },
  server: params => withPage(api.dictType.list, params),
  // 首次加载完成后默认选中第一条字典类型，联动右侧列表
  onEnd: () => {
    if (typeInited) {
      return
    }
    typeInited = true
    if (typeTableData.data.length) {
      handleSelectType(typeTableData.data[0])
    }
  },
})
let typeInited = false

// 当前选中的字典类型
const currentType = ref(null)

function isActiveType(item) {
  return item.dictId === currentType.value?.dictId
}

// 点击类型项：选中并联动右侧字典数据列表（dictType 在 query 中，变化经 autoUpdate 自动触发查询）
function handleSelectType(row) {
  currentType.value = row
  dataQuery.value.dictType = row.dictType
}

// 字典类型表单弹窗：openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
function openTypeForm(row) {
  openDialog(TypeEditDialog, {
    props: { onRefresh: getTypeList },
    params: row,
  })
}

async function handleDeleteType(row) {
  try {
    await confirm(`确定删除字典类型「${row.dictName}」吗？`, '提示')
  } catch {
    // 取消删除
    return
  }
  const result = await api.dictType.remove({ dictIds: row.dictId })
  if (result) {
    success('删除成功')
    // 删除的是当前选中类型时，清空选中与右侧列表（query.dictType 变化触发查询，命中空态守卫）
    if (currentType.value?.dictId === row.dictId) {
      currentType.value = null
      dataQuery.value.dictType = ''
    }
    getTypeList()
  }
}

// 刷新字典缓存
async function handleRefreshCache() {
  const result = await api.dictType.refreshCache()
  // 请求失败时 http 已统一弹出错误提示
  if (result) {
    success('缓存刷新成功')
  }
}

// ---------- 右侧：字典数据 ----------
const {
  query: dataQuery,
  page_query: dataPageQuery,
  table_data: dataTableData,
  loading: dataLoading,
  search: searchData,
  getData: getDataList,
} = useList({
  query: {
    dictType: '',
    status: '',
  },
  // 未选中字典类型前不自动请求，由选中行为联动触发
  autoSearch: false,
  // 未选中字典类型时直接返回空数据，不发请求
  server: params => (params.dictType ? withPage(api.dictData.list, params) : Promise.resolve({ count: 0, data: [] })),
})

const dataConfig = [
  {
    label: '字典编码',
    prop: 'dictCode',
  },
  {
    label: '字典标签',
    prop: 'dictLabel',
    align: 'left',
  },
  {
    label: '字典键值',
    prop: 'dictValue',
    align: 'left',
  },
  {
    label: '显示排序',
    prop: 'dictSort',
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

const dataQueryConfig = [
  {
    label: '字典状态',
    prop: 'status',
    comp: 'MuSelect',
    props: {
      options: STATUS_OPTIONS,
      clearable: true,
    },
  },
]

// 字典数据表单弹窗：新增时预置当前选中的字典类型（不在表单中展示）
function openDataForm(row) {
  if (!row && !currentType.value) {
    error('请先选择左侧字典类型')
    return
  }
  openDialog(DataEditDialog, {
    props: { onRefresh: getDataList },
    params: row || { dictType: currentType.value.dictType },
  })
}

async function handleDeleteData(row) {
  const result = await api.dictData.remove({ dictCodes: row.dictCode })
  if (result) {
    success('删除成功')
    getDataList()
  }
}
</script>

<template>
  <div class="h-full flex pt-2 pl-2">
    <!-- 左侧：字典类型（关键字输入即搜，点选联动右侧；编辑/删除按钮悬停显示） -->
    <div class="w-72 shrink-0 h-full flex flex-col bg-[var(--el-bg-color)] p-2.5">
      <div class="flex items-center justify-between shrink-0">
        <span class="font-bold">字典类型</span>
        <div class="flex items-center gap-2 text-[var(--el-text-color-secondary)]">
          <el-tooltip content="刷新缓存" placement="bottom">
            <fluent-arrow-sync-circle-20-regular class="text-base cursor-pointer transition-colors hover:text-[var(--el-color-primary)]" @click="handleRefreshCache" />
          </el-tooltip>
          <el-tooltip content="新增" placement="bottom">
            <fluent-add-20-regular class="text-base cursor-pointer transition-colors hover:text-[var(--el-color-primary)]" @click="openTypeForm()" />
          </el-tooltip>
        </div>
      </div>

      <el-input v-model="typeQuery.dictName" placeholder="搜索字典名称" clearable :prefix-icon="FluentSearch20Regular" class="mt-2.5 shrink-0" />

      <div v-loading="typeLoading" class="flex-1 overflow-auto mt-2.5">
        <div v-for="item in typeTableData.data" :key="item.dictId" class="group flex items-center gap-1 h-9 px-3 mb-1 rounded cursor-pointer text-sm" :class="isActiveType(item) ? 'bg-[var(--el-color-primary)] text-white' : 'bg-[var(--el-fill-color-light)] hover:bg-[var(--el-fill-color)]'" @click="handleSelectType(item)">
          <span class="flex-1 min-w-0 truncate">{{ item.dictName }} - {{ item.dictType }}</span>
          <span class="shrink-0 hidden group-hover:flex items-center gap-1" :class="isActiveType(item) ? 'text-white/80 hover:text-white' : 'text-[var(--el-text-color-secondary)] hover:text-[var(--el-color-primary)]'" @click.stop>
            <fluent-edit-20-regular class="text-base cursor-pointer" title="修改" @click="openTypeForm(item)" />
            <fluent-delete-20-regular class="text-base cursor-pointer" title="删除" @click="handleDeleteType(item)" />
          </span>
        </div>

        <el-empty v-if="!typeLoading && !typeTableData.data.length" description="暂无字典类型" :image-size="60" />
      </div>

      <el-pagination v-model:current-page="typePageQuery.page" v-model:page-size="typePageQuery.limit" :total="typeTableData.count" :pager-count="5" size="small" background layout="total, prev, pager, next" class="mt-2.5 shrink-0 justify-end" />
    </div>

    <!-- 右侧：当前类型的字典数据 -->
    <mu-smart-list class="flex-1 min-w-0 py-0" :loading="dataLoading" :page-query="dataPageQuery" :table-data="dataTableData" fixed-button @search="searchData" @add="openDataForm" @update-page="dataPageQuery.page = $event" @update-size="dataPageQuery.limit = $event">
      <template #search>
        <mu-smart-query v-model="dataQuery" :config="dataQueryConfig" />
      </template>

      <template #table>
        <mu-smart-table :data="dataTableData.data" :config="dataConfig">
          <template #status="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ getLabelByVal(STATUS_OPTIONS, row.status) || row.status }}</el-tag>
          </template>

          <template #operation="{ row }">
            <mu-edit-button @click="openDataForm(row)" />
            <mu-del-button @click="handleDeleteData(row)" />
          </template>
        </mu-smart-table>
      </template>
    </mu-smart-list>
  </div>
</template>

<style scoped></style>
