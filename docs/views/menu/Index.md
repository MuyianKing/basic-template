# 菜单管理（/system/menu）

## 基本信息

- 源码：`app/src/views/menu/Index.vue`
- 路由：`/system/menu`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system`）
- 私有子组件：`app/src/views/menu/components/EditDialog.vue`（经 `openDialog` 打开的新增/修改弹窗，内部用 useSmartForm）
- 表单模型：`app/src/model/menu.js`（MenuModel：字段规整与默认值）
- 公共业务组件：[MuMenuTreeSelect](../../components/menu/Index.md)（`app/src/components/menu/Index.vue`，弹窗「上级菜单」字段使用）
- 接口声明：`app/src/api/menu.js`（模块前缀 `/system/menu`，经 `@http` 绑定为 `api.menu.*` 调用，方案见 docs/api.md）
- 字典：`app/src/const/menu.js`（MENU_TYPE_OPTIONS 菜单类型、FRAME_OPTIONS 是否外链、CACHE_OPTIONS 是否缓存；状态复用 `@const/common` 的 STATUS_OPTIONS）

## 页面结构

列表页使用 `mu-smart-list`（@comp/smartui）组合搜索区、按钮区与表格，配合 headless `useList` 使用：

- 搜索条件：菜单名称（menuName）、状态（status，MuSelect：可清空）
- 列表字段：菜单名称（左对齐，树形缩进与展开箭头）/ 类型（el-tag：目录 warning、菜单 success、按钮 info）/ 排序 / 权限字符 / 路由名称 / 组件路径 / 路由地址，操作列为 `mu-edit-button` / `mu-del-button`
- 树形表格 + 懒加载：`mu-smart-table` 传 `row-key="menuId"`、`lazy`、`:load="loadChildren"`（经 attrs 透传到根节点 el-table）。根节点为摘除 children 的懒加载节点（`hasChildren` 标记 + `_children` 私有字段），行展开时经 `loadChildren` 从本地树取出子节点渲染
- `:key="table_key"` 每次取数后递增强制重挂载表格：清掉 el-table 懒加载的子节点缓存，避免刷新后展开行展示旧行数据
- 无分页（`no-page`）：菜单列表接口返回全量数据，不做分页
- 事件：`@search="search"`、`@add="openForm"`，编辑按钮传行数据打开弹窗

## 树形懒加载与搜索的数据逻辑

- `useList` 的 `server`：`@server/menu` 的 `getMenuList`——先用 `withPage(api.menu.list, params)`（@http）取全量平铺列表，再 `buildMenuTree`（@muyianking/utils 的 `makeTree`，extend_keys 保留列表与表单全部字段）按 `menuId` / `parentId` 组树，最后经 `toMenuLazyNode` 转为懒加载根节点
- **后端 `/system/menu/list` 忽略 parentId 过滤**（实测确认），无法按节点查子级，因此懒加载的子节点来自本地组好的树（首次请求即全量拿到），lazy 只作用于渲染层：初始只渲染根节点，展开时逐层渲染子节点
- 带 menuName / status 搜索条件时，后端返回过滤后的**平铺列表**，页面直接平铺展示（父节点可能不在结果中，组树无意义）；清空条件恢复树形懒加载展示
- 组树自定义了 `rootCheck`：parentId 为空或不在结果 id 集合中的节点按根节点处理（与部门管理一致，防止 makeTree 抛「未找到根节点」）

## 新增/修改弹窗

`EditDialog.vue`（MuMenuEditDialog）保留为页面私有子组件，经 `openDialog` 打开；内部基于 `useSmartForm({ Model: MenuModel })`：

```js
// eslint-disable-next-line no-unused-vars -- 文档示例
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData }, // openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
    params: row,
  })
}
```

- **表单项按菜单类型条件显隐**：`config` 为 computed，随 `form.menuType` 变化重建（useSmartForm 返回的 form 即内部 SmartForm 的 formRef）：
  - 公共：上级菜单（required，MuMenuTreeSelect）、菜单类型（radio：目录 M / 菜单 C / 按钮 F，新增默认目录）、显示排序（required + integer）、菜单名称（required + maxLength=50）、菜单状态（radio，新增默认正常）
  - 目录（M）：是否外链（radio，默认否）、路由地址（required + maxLength=200）
  - 菜单（C）：在目录基础上增加路由名称、权限字符（maxLength=100）、路由参数、是否缓存（radio，默认缓存）
  - 按钮（F）：权限字符（maxLength=100）
  - 按需求不含「菜单图标」与「路由组件」字段
- 上级菜单插槽：`#parentId="{ form: menuForm }"`（重命名避免遮蔽 setup 中的 form ref），`:exclude-id="menuForm.menuId"` 编辑时排除自身及子菜单
- `open(params)`：行数据经 `new MenuModel(row)` 规整（只保留表单字段并补默认值：非外链 isFrame '1'、缓存 isCache '0'、正常 status '0'；parentId / orderNum 用 `??` 保住 0 值），再由 MuSmartForm `cloneDeep` 后作为表单状态
- `:server="handleSubmit"`：有 `menuId` 调 `api.menu.save`，否则 `api.menu.add`；结果为 falsy 时抛错（http 失败返回 null，见 [MuSmartForm](../smartui/smart-form/Index.md) 的 server 提交约定）
- 保存成功后弹窗自动提示并关闭并触发 `onRefresh`（即 getData）刷新列表；弹窗组件不声明 emits，`close` / `refresh` 监听器经 attrs 自动透传

## 接口声明（app/src/api/menu.js）

```js
urls: [
  ['get', '/list'], // api.menu.list(query)，全量平铺列表
  { add: ['post', ''] }, // api.menu.add(body) → POST /system/menu
  { save: ['put', ''] }, // api.menu.save(body) → PUT /system/menu（put 走 http.request）
  { remove: ['delete', '/{menuId}'] }, // api.menu.remove({ menuId })，路径参数由 createRequest 替换占位符
]
```

删除：`mu-del-button` 自带气泡确认，确认后调 `api.menu.remove({ menuId })`，成功提示并 `getData()` 刷新。

## 注意事项

- 后端 `SysMenu` 必填字段为 `menuName`、`menuType`、`orderNum`，表单校验与其对齐；menuName maxLength 50、path maxLength 200、perms maxLength 100。
- 修改/删除使用 PUT / DELETE 方法，`Http` class 未封装 put/delete，`createRequest` 对这类方法统一走 `http.request`。
- **实测后端 PUT 更新时省略的字段不会被置空**（dynamic SQL 忽略 null），因此 MenuModel 只携带表单字段即可，不回传 icon / component 等未编辑字段。
- 后端 list 接口的 status 过滤可用（status=0 正常 / status=1 停用），menuName 为模糊匹配。
- 排序字段用 `??` 取默认值：`orderNum` 为 0 是合法值，不能被 `||` 吞掉。
- 树形表格开启了 lazy，不能用 `default-expand-all`；如需默认展开全部，改传全量树 + `default-expand-all`（参考部门管理）。
