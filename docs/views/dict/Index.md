# 字典管理（/system/dict）

## 基本信息

- 源码：`app/src/views/dict/Index.vue`
- 路由：`/system/dict`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system`）
- 私有子组件：
  - `app/src/views/dict/components/TypeEditDialog.vue`（MuDictTypeEditDialog，字典类型新增/修改弹窗）
  - `app/src/views/dict/components/DataEditDialog.vue`（MuDictDataEditDialog，字典数据新增/修改弹窗）
- 表单模型：`app/src/model/dictType.js`、`app/src/model/dictData.js`（字段规整与默认值）
- 接口声明：`app/src/api/dictType.js`（前缀 `/system/dict/type`）、`app/src/api/dictData.js`（前缀 `/system/dict/data`），经 `@http` 绑定为 `api.dictType.*` / `api.dictData.*` 调用，方案见 docs/api.md

## 页面结构

左右双面板布局（根节点 `h-full flex gap-2`）：

- **左侧（w-72）：字典类型卡片列表**——不是 mu-smart-list 表格，而是自组面板：
  - 头部「字典类型」标题 + 刷新缓存 / 新增描边小图标（fluent 图标直渲，灰色常态、悬停主题色，el-tooltip 提示；刷新缓存调 `api.dictType.refreshCache` → DELETE /system/dict/type/refreshCache，成功提示「缓存刷新成功」）
  - 字典名称搜索框（el-input，v-model 直写 `typeQuery.dictName`，输入即搜——autoUpdate 深度监听 query 触发防抖查询并重置到第 1 页）
  - 类型项列表（flex-1 滚动）：每项显示「字典名称 - 字典类型」，点击选中并联动右侧；选中项主题色高亮（`bg-[var(--el-color-primary)]` 白字）；悬停该项浮现编辑 / 删除小图标（继承行文字颜色——选中行白色、普通行灰色，`@click.stop` 避免误触发选中）
  - 底部 el-pagination（size="small"，`total, prev, pager, next`；v-model 直写 `typePageQuery`，由 autoUpdate 自动请求；mu-page 的统计文案在窄面板放不下，故用 el-pagination）
- **右侧（flex-1）：当前类型的字典数据**——`mu-smart-list` 组合字典状态查询（status，MuSelect 可清空）、新增按钮、分页表格（字典编码 / 字典标签 / 字典键值 / 显示排序 / 状态 el-tag / 创建时间，操作列 `mu-edit-button` / `mu-del-button`），`@update-page` / `@update-size` 回写 `page_query`；列宽不配置，mu-smart-table 自适应

## 数据逻辑

- 左右各一个 headless `useList` 实例（解构重命名为 type*/ data* 前缀，避免同名混淆）：
  - 左侧 `server: withPage(api.dictType.list, params)`，默认 `autoSearch` 挂载即查；`onEnd` 在首次加载完成后自动选中第一条类型
  - 右侧 `query` 含 `dictType` 与 `status`，`autoSearch: false` 不挂载即查；选中类型即写 `dataQuery.value.dictType`，由 `autoUpdate` 监听自动触发查询（重置到第 1 页）；`server` 有空态守卫——`params.dictType` 为空时直接 resolve `{ count: 0, data: [] }`，不发请求
- 删除类型时若删的是当前选中项，清空 `currentType` 并把 `dataQuery.value.dictType` 置空（命中右侧 server 空态守卫，右侧列表随之清空）
- 状态字典：`app/src/const/common.js` 的 `STATUS_OPTIONS`，列表展示经 `getLabelByVal` 取标签
- 删除确认：左侧类型走 `confirm` 工具（@muyianking/ui 的 MessageBox 确认，取消时静默返回）；右侧数据走 `mu-del-button` 自带气泡确认；确认后调 remove 接口（路径参数占位符见下），成功提示后刷新对应列表

## 弹窗

两个弹窗与岗位管理同模式（`useSmartForm` + Model，不声明 emits，close/refresh 经 attrs 透传，`onRefresh` 接线刷新列表）：

- **字典类型弹窗**：字典名称（required + maxLength=100）、字典类型（required + maxLength=100）、状态（radio，新增默认正常）；有 `dictId` 调 `api.dictType.save`，否则 `api.dictType.add`
- **字典数据弹窗**：字典标签（required + maxLength=100）、字典键值（required + maxLength=100）、显示排序（required + integer）、状态（radio，新增默认正常）；有 `dictCode` 调 `api.dictData.save`，否则 `api.dictData.add`
- 字典数据的 `dictType` 不在表单中展示：修改时取行数据自带值，新增时经 `params: { dictType: currentType.dictType }` 预置（Model 保留该字段随表单提交）；未选中类型时点右侧新增按钮会提示「请先选择左侧字典类型」

```js
// eslint-disable-next-line no-unused-vars -- 文档示例
function openDataForm(row) {
  openDialog(DataEditDialog, {
    props: { onRefresh: getDataList }, // openDialog 不转发业务事件，刷新经 props.onRefresh 接线
    params: row || { dictType: currentType.value.dictType }, // 新增无行数据，预置选中类型
  })
}
```

## 接口声明

```js
// api/dictType.js（前缀 /system/dict/type）
urls: [
  ['get', '/list'], // api.dictType.list(query)：dictName 模糊查询
  { add: ['post', ''] }, // api.dictType.add(body)
  { save: ['put', ''] }, // api.dictType.save(body)
  { remove: ['delete', '/{dictIds}'] }, // api.dictType.remove({ dictIds })
  { refreshCache: ['delete', '/refreshCache'] }, // api.dictType.refreshCache()
]

// api/dictData.js（前缀 /system/dict/data）
urls: [
  ['get', '/list'], // api.dictData.list(query)：dictType / status 过滤
  { add: ['post', ''] }, // api.dictData.add(body)
  { save: ['put', ''] }, // api.dictData.save(body)
  { remove: ['delete', '/{dictCodes}'] }, // api.dictData.remove({ dictCodes })
]
```

路径参数占位符（`{dictIds}` / `{dictCodes}`）由 `app/src/utils/request.js` 的 `createRequest` 用首参同名字段替换；后端字段为复数形式（支持逗号分隔批量删除），单条删除传对应主键即可。

## 注意事项

- 左侧面板高度链：根节点 `h-full flex gap-2`，左面板 `h-full flex flex-col`（列表区 flex-1 滚动、搜索与分页 shrink-0）。
- 右侧列表依赖 `query.dictType` 联动，不要改成 `autoSearch: true`（挂载即查会漏 dictType 查出全量数据）。
- 排序字段用 `??` 取默认值：`dictSort` 为 0 是合法值，不能被 `||` 吞掉。
- 后端 `SysDictType` 必填 `dictName`、`dictType`；`SysDictData` 必填 `dictLabel`、`dictValue`、`dictSort`，表单校验与其对齐。
