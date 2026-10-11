<script setup>
import { MuSmartList, MuSmartQuery, MuSmartTable, openDialog } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api, withPage } from '@http'
import { useList } from '@muyianking/hooks'
import { success } from '@muyianking/ui'
import { getLabelByVal } from '@muyianking/utils'
import { getDeptList } from '@server/dept'
import FluentKey20Regular from '~icons/fluent/key-20-regular'
import FluentPeopleTeam20Filled from '~icons/fluent/people-team-20-filled'
import AssignRoleDialog from './components/AssignRoleDialog.vue'
import EditDialog from './components/EditDialog.vue'
import ResetPwdDialog from './components/ResetPwdDialog.vue'

defineOptions({
  name: 'MuUserIndex',
})

// ---------- 左侧：部门树 ----------
const dept_tree = ref([])
const treeRef = ref()
const treeLoading = ref(false)
// 部门名称筛选关键字
const deptName = ref('')

async function getTree() {
  treeLoading.value = true
  try {
    dept_tree.value = (await getDeptList()).data
  } finally {
    treeLoading.value = false
  }
}

// 名称筛选：el-tree 自带的 filter-node-method，关键字变化即过滤
watch(deptName, (val) => {
  treeRef.value?.filter(val)
})

function filterNode(value, data) {
  if (!value) {
    return true
  }
  return data.deptName.includes(value)
}

// 点击部门节点：选中则按部门过滤用户，再次点击已选节点取消过滤
function handleNodeClick(node) {
  if (query.value.deptId === node.deptId) {
    query.value.deptId = ''
    treeRef.value.setCurrentKey(null)
    return
  }
  query.value.deptId = node.deptId
}

// ---------- 右侧：用户列表 ----------
const {
  query,
  page_query,
  table_data,
  loading,
  search,
  getData,
} = useList({
  query: {
    deptId: '',
    userName: '',
    phonenumber: '',
    status: '',
  },
  server: params => withPage(api.user.list, params),
})

const config = [
  {
    label: '用户编号',
    prop: 'userId',
  },
  {
    label: '用户名称',
    prop: 'userName',
    align: 'left',
  },
  {
    label: '用户昵称',
    prop: 'nickName',
    align: 'left',
  },
  {
    label: '部门',
    prop: 'dept',
  },
  {
    label: '手机号',
    prop: 'phonenumber',
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
    label: '用户名称',
    prop: 'userName',
  },
  {
    label: '手机号',
    prop: 'phonenumber',
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

// 新增/修改弹窗：字段规整与默认值在 UserModel（见 components/EditDialog.vue）
// openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData },
    params: row,
  })
}

// 重置密码弹窗：默认密码 123456，可修改
function openResetPwd(row) {
  openDialog(ResetPwdDialog, {
    params: { userId: row.userId, password: '123456' },
  })
}

// 分配角色弹窗：给当前用户勾选角色，确认后调 PUT /system/user/authRole
function openAssignRole(row) {
  openDialog(AssignRoleDialog, {
    params: row,
  })
}

async function handleDelete(row) {
  const result = await api.user.remove({ userIds: row.userId })
  if (result) {
    success('删除成功')
    getData()
  }
}

onMounted(getTree)
</script>

<template>
  <div class="h-full flex p-2">
    <!-- 左侧：部门树（支持名称筛选，点选节点联动右侧列表） -->
    <div v-loading="treeLoading" class="w-64 shrink-0 h-full overflow-auto bg-[var(--el-bg-color)] p-2.5">
      <el-input v-model="deptName" placeholder="请输入部门名称" clearable />
      <el-tree ref="treeRef" :data="dept_tree" :props="{ label: 'deptName', children: 'children' }" node-key="deptId" highlight-current default-expand-all :expand-on-click-node="false" :filter-node-method="filterNode" class="mt-2.5" @node-click="handleNodeClick" />
    </div>

    <!-- 右侧：用户列表 -->
    <mu-smart-list class="flex-1 min-w-0 p-0 pl-2" :loading="loading" :page-query="page_query" :table-data="table_data" fixed-button @search="search" @add="openForm" @update-page="page_query.page = $event" @update-size="page_query.limit = $event">
      <template #search>
        <mu-smart-query v-model="query" :config="queryConfig" />
      </template>

      <template #table>
        <mu-smart-table :data="table_data.data" :config :operation-props="{ width: 160 }">
          <template #dept="{ row }">
            {{ row.dept?.deptName }}
          </template>

          <template #status="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ getLabelByVal(STATUS_OPTIONS, row.status) || row.status }}</el-tag>
          </template>

          <template #operation="{ row }">
            <mu-edit-button @click="openForm(row)" />
            <mu-del-button @click="handleDelete(row)" />
            <mu-button mode="icon" :icon="FluentKey20Regular" tip="重置密码" @click="openResetPwd(row)" />
            <mu-button mode="icon" :icon="FluentPeopleTeam20Filled" tip="分配角色" @click="openAssignRole(row)" />
          </template>
        </mu-smart-table>
      </template>
    </mu-smart-list>
  </div>
</template>

<style scoped></style>
