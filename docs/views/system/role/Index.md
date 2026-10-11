# 角色管理（/system/role）

## 基本信息

- 源码：`app/src/views/system/role/Index.vue`
- 路由：`/system/role`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system`）
- 私有子组件：
  - `app/src/views/system/role/components/EditDialog.vue`（经 `openDialog` 打开的新增/修改弹窗，内部用 useSmartForm）
  - `app/src/views/system/role/components/AuthUserDialog.vue`（分配用户弹窗：已分配用户列表 + 取消/批量取消授权）
  - `app/src/views/system/role/components/AddUserDialog.vue`（批量添加用户授权弹窗：未分配用户列表多选）
  - `app/src/views/system/role/components/MenuAuthDialog.vue`（绑定菜单弹窗：菜单树勾选，保存调角色修改接口）
- 表单模型：`app/src/model/role.js`（RoleModel：字段规整与默认值，含 `menuCheckStrictly` 父子联动——后端「缺省即写 false」，角色保存必须显式携带该字段）
- 菜单权限工具：`app/src/server/role.js`（`fillMenuAncestors` 按菜单树补齐祖先节点、`getRoleMenuIds` 取角色当前菜单权限含祖先，新增/修改角色与绑定菜单弹窗共用）
- 字典与超管约定：`app/src/const/role.js`（`SUPER_ADMIN_ROLE_ID = 1`、`isSuperAdminRole(row)`，以 SysRole.admin 标记为准、兜底内置 roleId）
- 接口声明：`app/src/api/role.js`（模块前缀 `/system/role`，经 `@http` 绑定为 `api.role.*` 调用，方案见 docs/api.md）

## 页面结构

列表页使用 `mu-smart-list`（@comp/smartui）组合搜索区、按钮区、表格与分页，配合 headless `useList` 使用：

- 搜索条件：角色名称（roleName）、权限字符（roleKey）、角色状态（status，MuSelect：可清空）
- 列表字段：角色编号（roleId）/ 角色名称（roleName，左对齐）/ 权限字符（roleKey，左对齐）/ 显示顺序（roleSort）/ 状态（el-tag 展示）/ 创建时间，操作列 `operation-props` 加宽到 160，为 `mu-edit-button` / `mu-del-button` / 分配用户图标按钮（mu-button mode="icon"）
- 分页：角色列表接口为分页接口（TableDataInfo{rows,total}），`@update-page` / `@update-size` 回写 `page_query`（useList 默认 autoUpdate，回写后自动请求）
- 列宽不配置：mu-smart-table 自适应宽度
- 事件：`@search="search"`、`@add="openForm"`，编辑按钮传行数据打开弹窗

## 新增/修改弹窗

`EditDialog.vue`（MuRoleEditDialog）保留为页面私有子组件，经 `openDialog` 打开；内部基于 `useSmartForm({ Model: RoleModel })`：

```js
// eslint-disable-next-line no-unused-vars -- 文档示例
function openForm(row) {
  openDialog(EditDialog, {
    props: { onRefresh: getData }, // openDialog 不转发业务事件，保存成功后的列表刷新经 props.onRefresh 接线
    params: row,
  })
}
```

- 表单项：角色名称（required + maxLength=30）、权限字符（required + maxLength=100）、显示顺序（required + integer）、状态（radio，新增默认正常）
- `open(params)`：行数据经 `new RoleModel(row)` 规整（只保留表单字段并补默认值，新增默认状态正常），再由 MuSmartForm `cloneDeep` 后作为表单状态
- `:server="handleSubmit"`：**必须携带 menuIds**（后端 addRole/updateRole 按 menuIds 重建角色-菜单关联，缺省直接 500 报错）——新增传 `menuIds: []`；修改经 `getRoleMenuIds(roleId)` 取当前菜单权限（回显接口省略父节点，内部用 fillMenuAncestors 补齐祖先）后原样回传，获取失败时抛错中断（按空数组提交会清空菜单关联）；有 `roleId` 调 `api.role.save`，否则 `api.role.add`；结果为 falsy 时抛错（http 失败返回 null，见 [MuSmartForm](../../../components/smartui/smart-form/Index.md) 的 server 提交约定）
- 保存成功后弹窗自动提示并关闭并触发 `onRefresh`（即 getData）刷新列表；弹窗组件不声明 emits，`close` / `refresh` 监听器经 attrs 自动透传（close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出）

## 绑定菜单弹窗

操作列「绑定菜单」图标按钮经 `openDialog(MenuAuthDialog, { params: row })` 打开 `MenuAuthDialog.vue`（MuRoleMenuAuthDialog），标题为「绑定菜单 - {roleName}」：

- 打开时并行请求角色详情（`api.role.detail`，GET /system/role/{roleId}）与角色菜单树（`api.menu.roleMenuTreeselect`，GET /system/menu/roleMenuTreeselect/{roleId}，返回 `menus` 树与 `checkedKeys`）
- 树上方提供「父子联动」复选框（对应角色 `menuCheckStrictly`，初始值取角色详情；切换即同步切换树的 check-strictly 模式），保存时随角色一起提交并持久化——开启时后端回显省略父节点、树按级联推导，关闭时回显返回完整集合、各节点独立勾选
- 树为 el-tree：`node-key="id"`、`:props="{ label: 'label', children: 'children' }"`（TreeSelect 结构）、default-expand-all、show-checkbox
- 确定后调**角色的修改接口**（`api.role.save`，PUT /system/role），提交 `{ ...角色详情, menuCheckStrictly, menuIds }`；menuIds 由 `getMenuIds()` 收集：父子联动（当前表单值 menuCheckStrictly=true）时取全选 + 半选节点并经 `fillMenuAncestors`（@server/role）**按树结构补齐勾选节点的全部祖先**（后端 checkedKeys 会省略「有已勾选子节点的父节点」，联动回显后 el-tree 级联状态也可能不完整，只取 getCheckedKeys/getHalfCheckedKeys 会漏父节点）；父子不联动时按勾选原样提交。父子的 `menuCheckStrictly` 等字段随详情原样回传

实现要点：

- 回显必须先在 `check-strictly=true`（父子不联动）下 `setCheckedKeys(checkedKeys)` 精确勾选，`nextTick` 后再恢复 `!menuCheckStrictly` 的联动设置——直接在联动模式下设置父节点会把全部子节点自动勾上
- 保存时 menuIds 必须并入半选节点与勾选节点的祖先（见 `getMenuIds()`），否则父菜单不入库、用户端路由链断裂

## 分配用户弹窗

操作列「分配用户」图标按钮经 `openDialog(AuthUserDialog, { params: row })` 打开 `AuthUserDialog.vue`（MuRoleAuthUserDialog），标题为「分配用户 - {roleName}」，展示该角色的已分配用户列表：

- 列表：el-table（含 type="selection" 多选列）+ 用户编号/用户名称/用户昵称/手机号/操作（mu-del-button text="取消授权"），分页用 mu-page
- 取消单个授权：`confirm()` 二次确认后调 `api.role.authUser.cancel({ userId, roleId })`（PUT，body 为 SysUserRole）
- 批量取消授权：表格多选 + 「批量取消授权」按钮，`confirm()` 后调 `api.role.authUser.cancelAll`（PUT + query 参数：roleId、userIds）
- 批量添加用户授权：「添加用户」按钮经 `openDialog(AddUserDialog, { props: { onRefresh: getData }, params: { roleId } })` 打开 `AddUserDialog.vue`，展示未分配用户列表（`api.role.authUser.unallocatedList`），多选后底部「确定」调 `api.role.authUser.selectAll`（PUT + query 参数），成功后 `emit('refresh')` 刷新已分配列表并关闭

实现要点：

- 弹窗内表格需要全选框，而 mu-smart-table 的 #header 插槽会覆盖 el-table selection 列自带的全选框，因此弹窗内直接用 el-table 原生列 + mu-page 分页组合，不用 mu-smart-table
- 弹窗内的 useList 关闭 `autoSearch`（挂载时 roleId 尚未赋值），由 `open(row)` 写入 `query.roleId` 后经 autoUpdate 的深度 watch 自动请求
- `cancelAll` / `selectAll` 按 docs/api-docs.json 为 PUT + query 参数（roleId、userIds），调用时经第二参 options 传 `{ params: { roleId, userIds: userIds.join(',') } }`；userIds 必须拼成逗号分隔字符串（Spring 数组绑定，axios 默认数组序列化带 `[]` 会绑定失败）
- text 模式的 `mu-del-button` 不带 popover 二次确认（仅 icon 模式自带），取消授权前需自行 `confirm()`（@muyianking/ui，用户取消时 Promise reject，用 `.catch(() => false)` 收敛）

## 数据逻辑

- 状态字典：`app/src/const/common.js` 的 `STATUS_OPTIONS`（@const/common，正常 0 / 停用 1），列表展示经 `@muyianking/utils` 的 `getLabelByVal` 取标签
- `useList` 的 `server`：`withPage(api.role.list, params)`（@http），入参把 `page/limit` 映射为 `pageNum/pageSize`，出参兼容 TableDataInfo{rows,total}，统一规整为 `{ count, data }`
- 删除：`mu-del-button` 自带气泡确认，确认后调 `api.role.remove({ roleId })`，成功提示并 `getData()` 刷新

## 接口声明（app/src/api/role.js）

```js
urls: [
  ['get', '/list'], // api.role.list(query)
  { add: ['post', ''] }, // api.role.add(body) → POST /system/role
  { save: ['put', ''] }, // api.role.save(body) → PUT /system/role（put 走 http.request）
  { remove: ['delete', '/{roleId}'] }, // api.role.remove({ roleId })，路径参数由 createRequest 替换占位符
  { detail: ['get', '/{roleId}'] }, // api.role.detail({ roleId })，绑定菜单弹窗取角色详情
  ['get', '/authUser/allocatedList'], // api.role.authUser.allocatedList(query)
  ['get', '/authUser/unallocatedList'], // api.role.authUser.unallocatedList(query)
  ['put', '/authUser/cancel'], // api.role.authUser.cancel(body: { userId, roleId })
  ['put', '/authUser/cancelAll'], // api.role.authUser.cancelAll(options.params: { roleId, userIds })
  ['put', '/authUser/selectAll'], // api.role.authUser.selectAll(options.params: { roleId, userIds })
]
```

角色菜单树声明在 `app/src/api/menu.js`（menu 域，路径在 /system/menu 下）：

```js
{ roleMenuTreeselect: ['get', '/roleMenuTreeselect/{roleId}'] } // api.menu.roleMenuTreeselect({ roleId })
```

路径参数式 URL 的占位符替换在 `app/src/utils/request.js` 的 `createRequest` 内完成（首参同名字段替换 `{roleId}`，首参本身仍作为 body 传递）。

## 注意事项

- 后端 `SysRole` 必填字段为 `roleName`、`roleKey` 与 `roleSort`（roleName 最长 30、roleKey 最长 100），表单校验与其对齐；接口文档中删除接口路径参数名为 `roleIds`（数组），单条删除传 `{ roleId }` 即可命中。
- 超级管理员必须保留一个：超级管理员角色（内置 roleId=1 或行上 `admin` 标记）删除前拦截并 `error` 提示（`handleDelete`），修改弹窗停用前抛错拦截（`handleSubmit`，form-dialog 以 throw 的 message 弹错、弹窗保持打开）。
- **角色 PUT 必须显式携带 `menuCheckStrictly`**：后端 updateRole 对该字段是「缺省即写 false」（实测：省略该字段的 PUT 会把 menu_check_strictly 存成 0，静默关闭父子联动）。RoleModel 已从行数据携带该字段（列表行含此字段），绑定菜单弹窗也随表单提交。
- **角色菜单回显接口会按角色配置省略父节点**（menuCheckStrictly=true 时后端按 `menu_id not in (parent_id)` 过滤，父节点由前端树级联推导；false 时返回完整集合）——回显看不到父节点属正常设计，不代表未保存；实测写入的父节点会完整保留（见本模块 2026-10-11 的后端探查记录）。需要让回显直接带父节点时，在绑定菜单弹窗关闭「父子联动」保存即可（该配置随角色持久化）。
- **新增/修改角色必须携带 menuIds 数组**：后端按 menuIds 重建角色-菜单关联，缺省（null）直接 500（`Cannot read the array length ... is null`），事务回滚因此菜单不会丢；新增传 `[]` 即可。
- 修改/删除使用 PUT / DELETE 方法，`Http` class 未封装 put/delete，`createRequest` 对这类方法统一走 `http.request`。
- 排序字段用 `??` 取默认值：`roleSort` 为 0 是合法值，不能被 `||` 吞掉。
- 本模块角色基本信息维护（新增/修改/删除）与分配用户（取消/批量取消/批量添加授权）均已对接；未涉及菜单权限分配（roleMenuTreeselect / dataScope 等接口，见 docs/api-docs.json），后续扩展时在 api/role.js 补声明即可。
