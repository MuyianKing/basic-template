# 岗位管理（/system/post）

## 基本信息

- 源码：`app/src/views/post/Index.vue`
- 路由：`/system/post`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system`）
- 私有子组件：`app/src/views/post/components/EditDialog.vue`（经 `openDialog` 打开的新增/修改弹窗，内部用 useSmartForm）
- 表单模型：`app/src/model/post.js`（PostModel：字段规整与默认值）
- 接口声明：`app/src/api/post.js`（模块前缀 `/system/post`，经 `@http` 绑定为 `api.post.*` 调用，方案见 docs/api.md）

## 页面结构

列表页使用 `mu-smart-list`（@comp/smartui）组合搜索区、按钮区、表格与分页，配合 headless `useList` 使用：

- 搜索条件：岗位编码（postCode）、岗位名称（postName）、岗位状态（status，MuSelect：可清空）
- 列表字段：岗位编号（postId）/ 岗位编码（postCode，左对齐）/ 岗位名称（postName，左对齐）/ 岗位排序（postSort）/ 状态（el-tag 展示）/ 创建时间，操作列为 `mu-edit-button` / `mu-del-button`
- 分页：岗位列表接口为分页接口（TableDataInfo{rows,total}），`@update-page` / `@update-size` 回写 `page_query`（useList 默认 autoUpdate，回写后自动请求）
- 列宽不配置：mu-smart-table 自适应宽度
- 事件：`@search="search"`、`@add="openForm"`，编辑按钮传行数据打开弹窗

## 新增/修改弹窗

`EditDialog.vue`（MuPostEditDialog）保留为页面私有子组件，经 `openDialog` 打开；内部基于 `useSmartForm({ Model: PostModel })`：

```js
// eslint-disable-next-line no-unused-vars -- 文档示例
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData }, // openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
    params: row,
  })
}
```

- 表单项：岗位编码（required + maxLength=64）、岗位名称（required + maxLength=50）、岗位排序（required + integer）、状态（radio，新增默认正常）
- `open(params)`：行数据经 `new PostModel(row)` 规整（只保留表单字段并补默认值，新增默认状态正常），再由 MuSmartForm `cloneDeep` 后作为表单状态
- `:server="handleSubmit"`：有 `postId` 调 `api.post.save`，否则 `api.post.add`；结果为 falsy 时抛错（http 失败返回 null，见 [MuSmartForm](../../components/smartui/smart-form/Index.md) 的 server 提交约定）
- 保存成功后弹窗自动提示并关闭并触发 `onRefresh`（即 getData）刷新列表；弹窗组件不声明 emits，`close` / `refresh` 监听器经 attrs 自动透传（close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出）

## 数据逻辑

- 状态字典：`app/src/const/common.js` 的 `STATUS_OPTIONS`（@const/common，正常 0 / 停用 1），列表展示经 `@muyianking/utils` 的 `getLabelByVal` 取标签
- `useList` 的 `server`：`withPage(api.post.list, params)`（@http），入参把 `page/limit` 映射为 `pageNum/pageSize`，出参兼容 TableDataInfo{rows,total}，统一规整为 `{ count, data }`
- 删除：`mu-del-button` 自带气泡确认，确认后调 `api.post.remove({ postId })`，成功提示并 `getData()` 刷新

## 接口声明（app/src/api/post.js）

```js
urls: [
  ['get', '/list'], // api.post.list(query)
  { add: ['post', ''] }, // api.post.add(body) → POST /system/post
  { save: ['put', ''] }, // api.post.save(body) → PUT /system/post（put 走 http.request）
  { remove: ['delete', '/{postId}'] }, // api.post.remove({ postId })，路径参数由 createRequest 替换占位符
]
```

路径参数式 URL 的占位符替换在 `app/src/utils/request.js` 的 `createRequest` 内完成（首参同名字段替换 `{postId}`，首参本身仍作为 body 传递）。

## 注意事项

- 后端 `SysPost` 必填字段为 `postCode`、`postName` 与 `postSort`（postCode 最长 64、postName 最长 50），表单校验与其对齐。
- 修改/删除使用 PUT / DELETE 方法，`Http` class 未封装 put/delete，`createRequest` 对这类方法统一走 `http.request`。
- 排序字段用 `??` 取默认值：`postSort` 为 0 是合法值，不能被 `||` 吞掉。
