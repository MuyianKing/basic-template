# 登录日志（/system/log/logininfor）

## 基本信息

- 源码：`app/src/views/log/logininfor/Index.vue`
- 路由：`/system/log/logininfor`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system/log` 二级分组「日志管理」）
- 字典：`app/src/const/log.js`（`LOGIN_STATUS_OPTIONS` 登录状态）
- 接口声明：`app/src/api/logininfor.js`（模块前缀 `/monitor/logininfor`，经 `@http` 绑定为 `api.logininfor.*` 调用，方案见 docs/api.md）

## 页面结构

列表页使用 `mu-smart-list`（@comp/smartui）组合搜索区、按钮区、表格与分页，配合 headless `useList` 使用，日志只读、无新增按钮（`no-add`）、无详情弹窗：

- 搜索条件：登录地址（ipaddr）、用户名（userName）、状态（status，MuSelect：可清空）、登录时间（dateRange，el-date-picker datetimerange，经 `mu-smart-query` 的 `#dateRange` 插槽渲染，`w-96` 加宽）
- 列表字段：访问编号（infoId）/ 用户名称（userName，左对齐）/ 登录地址（ipaddr）/ 登录地点（loginLocation）/ 浏览器（browser）/ 操作系统（os）/ 登录状态（status，el-tag：成功绿 / 失败红）/ 操作信息（msg，左对齐）/ 登录日期（loginTime）
- 分页：登录日志接口为分页接口（TableDataInfo{rows,total}），`@update-page` / `@update-size` 回写 `page_query`（useList 默认 autoUpdate，回写后自动请求）
- 列宽不配置：mu-smart-table 自适应宽度

## 数据逻辑

- 登录状态字典：`app/src/const/log.js` 的 `LOGIN_STATUS_OPTIONS`（0 成功 / 1 失败），列表展示经 `@muyianking/utils` 的 `getLabelByVal` 取标签；注意 `SysLogininfor.status` 在接口文档中为**字符串**类型（与操作日志的整数不同），字典 value 用 `'0'/'1'`
- `useList` 的 `server`：入参把 `dateRange` 区间拆为若依约定的 `params[beginTime]` / `params[endTime]`（axios 默认序列化嵌套对象为 `params[beginTime]=...`），其余交给 `withPage(api.logininfor.list, params)`（@http）——入参把 `page/limit` 映射为 `pageNum/pageSize`，出参兼容 TableDataInfo{rows,total}，统一规整为 `{ count, data }`

## 接口声明（app/src/api/logininfor.js）

```js
urls: [
  ['get', '/list'], // api.logininfor.list(query) → GET /monitor/logininfor/list
]
```

接口文档 `docs/api-docs.json` 中该模块还有 `POST /monitor/logininfor/export`（导出）、`DELETE /monitor/logininfor/{infoIds}`（批量删除）、`DELETE /monitor/logininfor/clean`（清空）与 `GET /monitor/logininfor/unlock/{userName}`（解锁），页面暂未使用，需要时在 `urls` 中补声明即可。

## 注意事项

- 查询参数中的 `params` 是若依 BaseEntity 的内嵌 Map，与 `mu-smart-list` 的分页参数无冲突：`withPage` 解构只取 `page/limit`，其余字段原样透传。
- 页面结构与操作日志（`views/log/operlog`）保持一致，差异仅在字典（登录状态为字符串值）与无详情弹窗。
