# MuRoleSelect（角色选择器）

## 基本信息

- 源码：`app/src/components/role/Index.vue`
- 引用方式：`import RoleSelect from '@comp/role/Index.vue'`（@comp 指向 app/src/components/，@comp/smartui 之外的普通业务组件按路径显式引入）
- 底层组件：@muyianking/ui 的 `MuSelectRemote`（经 MuUiResolver 按需自动导入），内部为 element-plus 的 `el-select`（remote + filterable）

## 组件设计

- 业务数据自包含：组件内部调用 `api.role.list`（`/system/role/list`）分页拉取角色列表，模板中只写 `<role-select v-model="xxx" />` 即可使用，无需父组件准备数据
- MuSelectRemote 契约：`server` 回调入参为 `{ roleName, page, pageSize, ...params }`，需返回角色数组；组件内用 `withPage(api.role.list, { page, limit: pageSize, ...params })` 适配后端 pageNum/pageSize 分页并取出 `data`
- 远程搜索关键字经 `query-config.query_key`（`roleName`）映射到角色列表接口的搜索参数；选项文本 / 取值经 `data-config` 映射为 `roleName` / `roleId`
- 懒加载：MuSelectRemote 仅在下拉打开或已有回显值时才发起首次请求；下拉每页 50 条，滚动追加，输入关键字时重置为第 1 页按 roleName 搜索
- `inheritAttrs: false` + `v-bind="$attrs"`：组件只声明 `modelValue` / `params` 两个 props，其余属性、事件全部透传到 MuSelectRemote（`multiple`、`all`（追加「全部」选项）、`disabled`、插槽等）；默认配置写在 `v-bind="$attrs"` 之前，外部同名属性可覆盖

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | Number / String / Array | undefined | 选中的角色ID（v-model，`multiple` 时为数组） |
| params | Object | {} | 附加查询参数，随每次远程请求透传给角色列表接口，如 `{ status: '0' }` 只查正常状态角色 |

## 用法示例

```vue
<script setup>
import RoleSelect from '@comp/role/Index.vue'
</script>

<template>
  <!-- 单选，回显需在列表首页内 -->
  <role-select v-model="form.roleId" class="w-full" />

  <!-- 多选（透传 el-select 的 multiple） -->
  <role-select v-model="form.roleIds" multiple class="w-full" />

  <!-- 查询区：追加「全部」选项（value 为空串） -->
  <role-select v-model="query.roleId" all clearable class="w-full" />
</template>
```

## 数据逻辑

- 角色列表为 TableDataInfo{rows,total}，经 `withPage`（`@http`）规整后取 `data` 返回给 MuSelectRemote
- 接口声明见 `app/src/api/role.js`，路径与参数以 `docs/api-docs.json` 为准
