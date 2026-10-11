<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { MENU_TYPE_OPTIONS } from '@const/menu'
import { api } from '@http'
import { useList } from '@muyianking/hooks'
import { success } from '@muyianking/ui'
import { getLabelByVal } from '@muyianking/utils'
import { getMenuList, toMenuLazyNode } from '@server/menu'
import EditDialog from './components/EditDialog.vue'

defineOptions({
  name: 'MuMenuIndex',
})

// 类型标签颜色
const TYPE_TAG_MAP = { M: 'warning', C: 'success', F: 'info' }

// 表格每次取数后重挂载（key 递增）：清掉 el-table 懒加载的子节点缓存，避免刷新后展开行展示旧行数据
const table_key = ref(0)

const {
  query,
  page_query,
  table_data,
  loading,
  search,
  getData,
} = useList({
  query: {
    menuName: '',
    status: '',
  },
  // 菜单组树与懒加载节点逻辑抽在 @server/menu（上级菜单树选择器共用）；
  // 带 menuName/status 搜索条件时后端返回过滤后的平铺列表，页面平铺展示，无搜索条件时按树形懒加载展示
  server: getMenuList,
  onEnd: () => {
    table_key.value++
  },
})

const config = [
  {
    label: '菜单名称',
    prop: 'menuName',
    align: 'left',
  },
  {
    label: '类型',
    prop: 'menuType',
  },
  {
    label: '排序',
    prop: 'orderNum',
  },
  {
    label: '权限字符',
    prop: 'perms',
  },
  {
    label: '路由名称',
    prop: 'routeName',
  },
  {
    label: '组件路径',
    prop: 'component',
  },
  {
    label: '路由地址',
    prop: 'path',
  },
]

const queryConfig = [
  {
    label: '菜单名称',
    prop: 'menuName',
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

// el-table 懒加载：行展开时从本地组好的树中取出子节点渲染（子节点经 toMenuLazyNode 继续标记 hasChildren）
function loadChildren(row, _treeNode, resolve) {
  resolve((row._children || []).map(toMenuLazyNode))
}

// 表单弹窗：字段规整与默认值在 MenuModel（见 components/EditDialog.vue）
// openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData },
    params: row,
  })
}

async function handleDelete(row) {
  const result = await api.menu.remove({ menuId: row.menuId })
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
      <!-- row-key / lazy / load 经 attrs 透传到 smart-table 根节点 el-table；:key 重挂载清懒加载缓存 -->
      <mu-smart-table :key="table_key" :data="table_data.data" :config row-key="menuId" lazy :load="loadChildren">
        <template #menuType="{ row }">
          <el-tag :type="TYPE_TAG_MAP[row.menuType] || 'info'">{{ getLabelByVal(MENU_TYPE_OPTIONS, row.menuType) || row.menuType }}</el-tag>
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
