# MuDeptTreeSelect（部门树选择器）

## 基本信息

- 源码：`app/src/components/dept/Index.vue`
- 引用方式：`import DeptTreeSelect from '@comp/dept/Index.vue'`（@comp 指向 app/src/components/，@comp/smartui 之外的普通业务组件按路径显式引入）
- 底层组件：element-plus 的 `el-tree-select`（经 ElementPlusResolver 按需自动导入），Mu 组件库暂无 TreeSelect

## 组件设计

- 业务数据自包含：组件内部拉取部门树（`@server/dept` 的 `getDeptList`），模板中只写 `<dept-tree-select v-model="xxx" />` 即可使用，无需父组件准备数据
- `inheritAttrs: false` + `v-bind="$attrs"`：组件只声明 `modelValue` / `excludeId` 两个 props，其余属性、事件全部透传到根节点 el-tree-select（继承 element-plus 全部能力）；默认配置写在 `v-bind="$attrs"` 之前，外部同名属性可覆盖
- 插槽全量转发：`v-for` 遍历 `$slots` 转发给 el-tree-select，支持自定义节点内容等插槽
- 树数据配置：`:props="{ label: 'deptName', value: 'deptId', children: 'children' }"`、`node-key="deptId"`、`check-strictly`（允许选择任意层级的节点）、`default-expand-all`
- 暴露 `getTree()`：供父组件手动刷新部门树

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | Number / String | undefined | 选中的部门ID（v-model） |
| excludeId | Number / String | null | 需要排除的部门ID：编辑时传自身 deptId，候选树改调 `/system/dept/list/exclude/{deptId}` 排除自己及子部门，避免把自己或子孙选为上级 |

## 页面用法（app/src/views/dept/components/EditDialog.vue）

```vue
<template #parentId="{ form }">
  <dept-tree-select v-model="form.parentId" :exclude-id="form.deptId" class="w-full" />
</template>
```

- 用于部门新增/修改弹窗的「上级部门」字段，经 MuSmartForm 的 `item.prop` 具名插槽替换默认控件（label 与校验仍由 mu-form-item 承担）
- `exclude-id` 传 `form.deptId`：新增时 deptId 为空串走全量树，编辑时排除自身子树

## 数据逻辑

- 树的组装逻辑在 `app/src/server/dept.js`（与部门管理树形表格共用）：`buildDeptTree` 用 `@muyianking/utils` 的 `makeTree` 按 `deptId` / `parentId` 组树，`rootCheck` 把「parentId 为空或不在结果中」的节点按根处理（搜索过滤、排除接口返回的列表里父节点可能缺失）
- 排除接口返回 AjaxResult{data}，`getDeptTreeExclude` 取 `result.data` 后复用 `buildDeptTree`
