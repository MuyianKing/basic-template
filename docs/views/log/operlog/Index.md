# 操作日志（/system/log/operlog）

## 基本信息

- 源码：`app/src/views/log/operlog/Index.vue`
- 路由：`/system/log/operlog`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system/log` 二级分组「日志管理」）
- 私有子组件：`app/src/views/log/operlog/components/DetailDialog.vue`（经 `openDialog` 打开的详情弹窗，仅查看）
- 字典：`app/src/const/log.js`（`OPER_TYPE_OPTIONS` 操作类型 / `OPER_STATUS_OPTIONS` 执行状态）
- 接口声明：`app/src/api/operlog.js`（模块前缀 `/monitor/operlog`，经 `@http` 绑定为 `api.operlog.*` 调用，方案见 docs/api.md）

## 页面结构

列表页使用 `mu-smart-list`（@comp/smartui）组合搜索区、按钮区、表格与分页，配合 headless `useList` 使用，日志只读、无新增按钮（`no-add`）：

- 搜索条件：操作地址（operIp）、系统模块（title）、操作人员（operName）、类型（businessType，MuSelect：可清空）、状态（status，MuSelect：可清空）、操作时间（dateRange，el-date-picker datetimerange，经 `mu-smart-query` 的 `#dateRange` 插槽渲染）
- 列表字段：日志编号（operId）/ 系统模块（title，左对齐）/ 操作类型（businessType，按字典取标签）/ 操作人员（operName）/ 操作地址（operIp）/ 操作地点（operLocation）/ 操作状态（status，el-tag：正常绿 / 异常红）/ 操作日期（operTime）/ 消耗时间（costTime，追加「毫秒」），操作列为 `mu-detail-button` 查看详情
- 分页：操作日志接口为分页接口（TableDataInfo{rows,total}），`@update-page` / `@update-size` 回写 `page_query`（useList 默认 autoUpdate，回写后自动请求）
- 列宽不配置：mu-smart-table 自适应宽度

## 详情弹窗

`DetailDialog.vue`（MuOperLogDetailDialog）保留为页面私有子组件，经 `openDialog(DetailDialog, { params: row })` 打开（详情无需刷新列表，不接 `onRefresh`）。弹窗暴露 `open(row)`，行数据直接作为展示状态，不建表单模型。界面按「基本信息 / 操作人员 / 请求信息 / 请求参数 / 返回参数」五个区块组织：

- 基本信息：操作模块（title）、业务类型（businessType 按字典取标签）、操作时间（operTime）、执行状态（status，el-tag）
- 操作人员：操作人员（operName）、所属部门（deptName）、操作地址（operIp + operLocation）
- 请求信息：请求地址（requestMethod 彩色标签 + operUrl）、操作方法（method）、消耗时间（costTime 毫秒）
- 请求参数 / 返回参数：`operParam` / `jsonResult` 为 JSON 字符串，`formatJson` 解析后缩进展示（解析失败原样展示），右上角复制按钮经 `useClipboard({ legacy: true })` 复制
- 行数据含 `errorMsg`（执行异常）时追加「错误信息」区块

## 数据逻辑

- 操作类型字典：`app/src/const/log.js` 的 `OPER_TYPE_OPTIONS`（若依 sys_oper_type：1 其它 / 2 新增 / 3 修改 / 4 删除 / 5 授权 / 6 导出 / 7 导入 / 8 强退 / 9 生成代码 / 10 清空数据），值为整数，与 SysOperLog schema 一致
- 执行状态字典：同文件的 `OPER_STATUS_OPTIONS`（0 正常 / 1 异常），列表展示经 `@muyianking/utils` 的 `getLabelByVal` 取标签
- `useList` 的 `server`：入参把 `dateRange` 区间拆为若依约定的 `params[beginTime]` / `params[endTime]`（axios 默认序列化嵌套对象为 `params[beginTime]=...`），其余交给 `withPage(api.operlog.list, params)`（@http）——入参把 `page/limit` 映射为 `pageNum/pageSize`，出参兼容 TableDataInfo{rows,total}，统一规整为 `{ count, data }`

## 接口声明（app/src/api/operlog.js）

```js
urls: [
  ['get', '/list'], // api.operlog.list(query) → GET /monitor/operlog/list
]
```

接口文档 `docs/api-docs.json` 中该模块还有 `POST /monitor/operlog/export`（导出）、`DELETE /monitor/operlog/{operIds}`（批量删除）、`DELETE /monitor/operlog/clean`（清空），页面暂未使用，需要时在 `urls` 中补声明即可。

## 注意事项

- 后端 `SysOperLog` 的 `businessType`、`status`、`operatorType` 为整数，字典 value 保持数字类型，`getLabelByVal` 按 `===` 匹配。
- 查询参数中的 `params` 是若依 BaseEntity 的内嵌 Map，与 `mu-smart-list` 的分页参数无冲突：`withPage` 解构只取 `page/limit`，其余字段原样透传。
- 详情弹窗不声明 emits，`close` 监听器经 attrs 透传（由 mu-dialog 抛出）。
