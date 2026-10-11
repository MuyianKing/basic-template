# 部门管理（/system/dept）

## 基本信息

- 源码：`app/src/views/system/dept/Index.vue`
- 路由：`/system/dept`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system`）
- 私有子组件：`app/src/views/system/dept/components/EditDialog.vue`（经 `openDialog` 打开的新增/修改弹窗，内部用 useSmartForm）
- 表单模型：`app/src/model/dept.js`（DeptModel：字段规整与默认值）
- 公共业务组件：[MuDeptTreeSelect](../../../components/dept/Index.md)（`app/src/components/dept/Index.vue`，弹窗「上级部门」字段使用）
- 接口声明：`app/src/api/dept.js`（模块前缀 `/system/dept`，经 `@http` 绑定为 `api.dept.*` 调用，方案见 docs/api.md）

## 页面结构

列表页使用 `mu-smart-list`（@comp/smartui）组合搜索区、按钮区与表格，配合 headless `useList` 使用：

- 搜索条件：部门名称（deptName）、状态（status，MuSelect：可清空）
- 列表字段：部门名称（左对齐，展示树形缩进与展开箭头）/ 排序 / 状态（el-tag 展示）/ 创建时间，操作列为 `mu-edit-button` / `mu-del-button`
- 树形表格：`mu-smart-table` 上传 `row-key="deptId"`、`default-expand-all`、`:tree-props="{ children: 'children' }"`，这些属性未声明为组件 props，经 attrs 透传到 smart-table 根节点 el-table
- 列宽不配置：mu-smart-table 自适应宽度
- 无分页（`no-page`）：部门列表接口返回全量数据，不做分页
- 事件：`@search="search"`、`@add="openForm"`，编辑按钮传行数据打开弹窗

## 新增/修改弹窗

`EditDialog.vue`（MuDeptEditDialog）保留为页面私有子组件，经 `openDialog` 打开；内部基于 `useSmartForm({ Model: DeptModel })`：

```js
// eslint-disable-next-line no-unused-vars -- 文档示例
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData }, // openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
    params: row,
  })
}
```

- 表单项：上级部门（required，MuDeptTreeSelect 部门树选择器，编辑时 `:exclude-id="form.deptId"` 排除自身及子部门）、部门名称（required + maxLength=30）、排序（required + integer）、状态（radio，新增默认正常）
- `open(params)`：行数据经 `new DeptModel(row)` 规整（只保留表单字段并补默认值，新增默认状态正常、上级部门为空必选），再由 MuSmartForm `cloneDeep` 后作为表单状态
- `:server="handleSubmit"`：有 `deptId` 调 `api.dept.save`，否则 `api.dept.add`；结果为 falsy 时抛错（http 失败返回 null，见 [MuSmartForm](../../../components/smartui/smart-form/Index.md) 的 server 提交约定）
- 保存成功后弹窗自动提示并关闭并触发 `onRefresh`（即 getData）刷新列表；弹窗组件不声明 emits，`close` / `refresh` 监听器经 attrs 自动透传（close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出）

## 数据逻辑

- 状态字典：`app/src/const/common.js` 的 `STATUS_OPTIONS`（@const/common，正常 0 / 停用 1），列表展示经 `@muyianking/utils` 的 `getLabelByVal` 取标签
- `useList` 的 `server`：`@server/dept` 的 `getDeptList`（组树逻辑与上级部门树选择器共用）——先用 `withPage(api.dept.list, params)`（@http）取全量平铺列表（withPage 把 `page/limit` 映射为 `pageNum/pageSize`，并兼容 TableDataInfo{rows,total} 与 AjaxResult{data} 两种返回结构，统一规整为 `{ count, data }`），再用 `buildDeptTree`（@muyianking/utils 的 `makeTree`）按 `deptId` / `parentId` 组树；`extend_keys` 保留表格与表单需要的 `orderNum` / `status` / `createTime`
- 组树自定义了 `rootCheck`：搜索过滤后子部门的父节点可能不在结果里，`makeTree` 默认根判定会因此抛"未找到根节点"，这里改为「parentId 为空或不在结果 id 集合中的节点按根节点处理」
- 删除：`mu-del-button` 自带气泡确认，确认后调 `api.dept.remove({ deptId })`，成功提示并 `getData()` 刷新

## 接口声明（app/src/api/dept.js）

```js
urls: [
  ['get', '/list'], // api.dept.list(query)
  { add: ['post', ''] }, // api.dept.add(body) → POST /system/dept
  { save: ['put', ''] }, // api.dept.save(body) → PUT /system/dept（put 走 http.request）
  { remove: ['delete', '/{deptId}'] }, // api.dept.remove({ deptId })，路径参数由 createRequest 替换占位符
  { listExclude: ['get', '/list/exclude/{deptId}'] }, // api.dept.listExclude({ deptId })，排除指定部门及子部门，上级部门候选树用
]
```

路径参数式 URL 的占位符替换在 `app/src/utils/request.js` 的 `createRequest` 内完成（首参同名字段替换 `{deptId}`，首参本身仍作为 body 传递）。

## 注意事项

- 后端 `SysDept` 必填字段为 `deptName` 与 `orderNum`，表单校验与其对齐。
- 修改/删除使用 PUT / DELETE 方法，`Http` class 未封装 put/delete，`createRequest` 对这类方法统一走 `http.request`。
- 排序字段用 `??` 取默认值：`orderNum` 为 0 是合法值，不能被 `||` 吞掉。
