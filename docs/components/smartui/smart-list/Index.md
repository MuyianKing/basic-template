# MuSmartList

- 源码：`app/src/components/smartui/smart-list/Index.vue`
- 引入：`import { MuSmartList } from '@comp/smartui'`，模板写 `<mu-smart-list>`

列表页布局组件，替代旧版 `@muyianking/hooks` useList 返回的 `MuListPage` 渲染组件（0.0.5 起 useList 为 headless 逻辑，不再返回组件）。内部基于 `@muyianking/ui` 的 `mu-search-page`（布局）+ `mu-search-button` / `mu-add-button`（按钮区）+ `mu-page`（分页）组合而成，配合 headless `useList` 使用。

## Props

| 名称         | 类型    | 默认值   | 说明                                         |
| ------------ | ------- | -------- | -------------------------------------------- |
| loading      | Boolean | false    | 请求加载状态，表格区域显示 loading           |
| pageQuery    | Object  | {}       | useList 返回的 `page_query`（{page, limit}） |
| tableData    | Object  | {}       | useList 返回的 `table_data`（{data, count}） |
| noAdd        | Boolean | false    | 隐藏添加按钮                                 |
| noSearch     | Boolean | false    | 隐藏搜索按钮                                 |
| noSearchArea | Boolean | false    | 隐藏整个搜索区域                             |
| fixedButton  | Boolean | false    | 按钮区固定（透传 mu-search-page）            |
| noPage       | Boolean | false    | 不渲染分页                                   |
| pageConfig   | Object  | null     | 分页配置，`{ sizes: true }` 开启每页条数选择 |
| advancedText | String  | 高级搜索 | 高级搜索按钮文案，配合 #advanced 插槽        |

## 插槽

- `search`：查询条件区（一般放 `mu-smart-query`）
- `button`：搜索/添加按钮之后的自定义按钮
- `advanced`：高级搜索区域（有该插槽时才显示高级搜索开关）
- `table`：表格区（一般放 `mu-smart-table`）
- `default`：分页之后的底部自定义内容

## 事件

| 名称       | 说明                       |
| ---------- | -------------------------- |
| search     | 点击搜索按钮               |
| add        | 点击添加按钮               |
| updatePage | 页码变化，参数为新页码     |
| updateSize | 每页条数变化，参数为新条数 |
| getData    | 分页变化（页码或条数）     |

## 页面接线方式

useList 默认 `autoUpdate: true`（query / page_query 变化自动请求），因此分页事件只需回写 `page_query`：

```html
<mu-smart-list
  :loading="loading"
  :page-query="page_query"
  :table-data="table_data"
  fixed-button
  @search="search"
  @add="openForm"
  @update-page="page_query.page = $event"
  @update-size="page_query.limit = $event"
>
  <template #search>...</template>
  <template #table>...</template>
</mu-smart-list>
```

## 高度布局

组件内部（mu-search-page）已自带完整的高度链：根节点 `flex flex-col h-full`，`.bottom` 为 `flex-1` + `flex-col`，表格区 `.table-body` 为 `flex:1` 占据剩余高度并内部滚动，分页区 `flex-shrink-0` 固定在底部。

**使用前提：页面根节点必须有确定高度**，即页面模板根节点写 `<div class="h-full">`，否则 `height: 100%` 向上塌陷，表格无法占满剩余高度。

完整示例见 `app/src/views/form/Index.vue`（文档：[用户管理](../../views/form/Index.md)）。
