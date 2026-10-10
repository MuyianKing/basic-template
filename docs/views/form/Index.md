# 用户管理（/system/user）

## 基本信息

- 源码：`app/src/views/form/Index.vue`
- 路由：`/system/user`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system`）
- 私有子组件：`app/src/views/form/components/EditDialog.vue`（经 `openDialog` 打开的编辑弹窗）

## 页面结构

列表页使用 `mu-smart-list`（@comp/smartui，文档：[MuSmartList](../../components/smartui/smart-list/Index.md)）组合搜索区、按钮区、表格与分页，配合 `@muyianking/hooks` 的 headless `useList` 使用：

- `#search` 插槽：`mu-smart-query` 渲染查询条件（姓名 / 年龄 / 性别）
- `#table` 插槽：`mu-smart-table`，操作列含 `mu-edit-button` / `mu-del-button`
- Props：`loading` / `page-query` / `table-data` 接 `useList` 返回值，`fixed-button` 固定按钮区
- 事件：`@search="search"`、`@add="openForm"`，`@update-page` / `@update-size` 回写 `page_query`
- 根节点为 `<div class="h-full">`：mu-smart-list 内部表格区 `flex:1` 占满剩余高度、分页沉底，前提是页面根节点有确定高度

## 数据逻辑

`useList`（@muyianking/hooks）返回 `query` / `page_query` / `table_data` / `loading` / `search` / `getData`：

- 默认 `autoSearch`（挂载即查）、`autoUpdate`（`query` 或 `page_query` 变化自动请求），因此分页事件只需回写 `page_query`，无需手动调 `getData`。
- `table_data` 为 `{ count, data }`。
- 演示用 `server` 返回静态数据（100 条计数、1 行记录）。

## 注意事项

- 模板中使用 `mu-*` 组件时，不要从 `useList` 解构同名标识符（旧版 `MuListPage` 即此类问题）：script setup 中的同名绑定会被模板按 kebab-case 优先匹配，遮蔽 MuUiResolver 的自动导入，导致渲染出无效 vnode（页面空白，控制台报 `Invalid vnode type`）。
- `app/tailwind.config.js` 的 content 需包含 `../node_modules/@muyianking/ui/es/**/*`（相对 app/ 目录），否则 Mu 组件内部的 Tailwind 工具类（如 `flex-col`）不会被生成，`mu-search-page` 等组件布局会错乱（上下结构变左右并排）。
