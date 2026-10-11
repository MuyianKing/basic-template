# 用户管理（/system/user）

## 基本信息

- 源码：`app/src/views/user/Index.vue`
- 路由：`/system/user`（`app/src/router/menu/index.js` 中 admin 路由的 children，父级为 `system`）
- 私有子组件：`app/src/views/user/components/EditDialog.vue`（新增/修改弹窗）、`app/src/views/user/components/ResetPwdDialog.vue`（重置密码弹窗）、`app/src/views/user/components/AssignRoleDialog.vue`（分配角色弹窗），均经 `openDialog` 打开
- 表单模型：`app/src/model/user.js`（UserModel：字段规整与默认值）
- 接口声明：`app/src/api/user.js`（模块前缀 `/system/user`，经 `@http` 绑定为 `api.user.*` 调用，方案见 docs/api.md）
- 部门树数据：`app/src/server/dept.js` 的 `getDeptList`（与部门管理、MuDeptTreeSelect 共用组树逻辑）

## 页面结构

左右双栏布局（同字典管理页的 `h-full flex gap-2` 模式）：

### 左侧：部门树

- 数据：`getDeptList()`（@server/dept，全量平铺列表组树，不分页）
- 支持按部门名称筛选：`el-tree` 的 `filter-node-method` + `watch(deptName)` 触发 `treeRef.filter(val)`
- 点选部门节点把 `deptId` 写入右侧列表的 `query`（useList 默认 autoUpdate，自动触发查询）；再次点击已选节点取消过滤（`setCurrentKey(null)` 清除高亮）

### 右侧：用户列表

`mu-smart-list`（@comp/smartui）组合搜索区、按钮区、表格与分页，配合 headless `useList`：

- 搜索条件：用户名称（userName）、手机号（phonenumber）、状态（status，MuSelect：可清空）
- 列表字段：用户编号（userId）/ 用户名称（userName，左对齐）/ 用户昵称（nickName，左对齐）/ 部门（`dept.deptName`，插槽取嵌套字段）/ 手机号（phonenumber）/ 状态（el-tag 展示）/ 创建时间
- 操作列：修改（mu-edit-button）、删除（mu-del-button，自带气泡确认）、重置密码（mu-button + key-reset 图标）、分配角色（mu-button + people-team 图标）；四个按钮超出默认 80px，经 `:operation-props="{ width: 160 }"` 加宽操作列
- 分页：用户列表接口为分页接口（TableDataInfo{rows,total}），`@update-page` / `@update-size` 回写 `page_query`
- 列宽不配置：mu-smart-table 自适应宽度（操作列除外）

## 新增/修改弹窗

`EditDialog.vue`（MuUserEditDialog），内部基于 `useSmartForm({ Model: UserModel })`：

- 表单项：所属部门（MuDeptTreeSelect，required）、用户名称（required + maxLength=30）、用户昵称（required + maxLength=30）、手机号（phone 校验，选填）、状态（radio，新增默认正常）
- 新增未填密码时提交默认密码 `123456`（`handleSubmit` 内补 `model.password`）
- `:server="handleSubmit"`：有 `userId` 调 `api.user.save`，否则 `api.user.add`；结果为 falsy 时抛错（http 失败返回 null，见 [MuSmartForm](../../components/smartui/smart-form/Index.md) 的 server 提交约定）
- 保存成功后弹窗自动提示关闭并触发 `onRefresh`（即 getData）刷新列表；弹窗组件不声明 emits，监听器经 attrs 自动透传

## 重置密码弹窗

`ResetPwdDialog.vue`（MuUserResetPwdDialog），表单项仅新密码（required + maxLength=30，showPassword），默认值 `123456`；提交 `api.user.resetPwd({ userId, password })`（PUT /system/user/resetPwd）。打开时由页面传入 `{ userId, password: '123456' }`。

## 分配角色弹窗

`AssignRoleDialog.vue`（MuUserAssignRoleDialog），打开时传用户行，给该用户勾选角色：

- 弹窗标题为「分配角色 - {用户昵称}」（与角色管理页「分配用户 - {角色名称}」对称）

- 数据来自 `api.user.getAuthRole({ userId })`（GET /system/user/authRole/{userId}），返回全量角色列表（顶层 `roles` 字段），`flag: true` 的为该用户已分配角色
- **已分配角色回显**：数据渲染后经 `nextTick` 逐行 `toggleRowSelection(role, true)` 打上勾
- 多选表格用 `el-table` 原生（同角色管理页「添加用户」弹窗的模式），配 `row-key="roleId"` + selection 列 `reserve-selection`：搜索过滤导致行不在列表中时勾选不丢
- 搜索（角色名称 roleName / 权限字符 roleKey）为**本地过滤**（候选是全量数据，不走分页接口），实时生效；表格 `max-height="420"` 内部滚动
- 确定提交 `api.user.authRole({}, { params: { userId, roleIds: roleIds.join(',') } })`（PUT /system/user/authRole，PUT + query 参数，`roleIds` 逗号拼接——Spring 数组绑定不吃 axios 默认的 `roleIds[]` 序列化）
- 该接口为「全量覆盖」语义（先删该用户角色关联再插入），勾选状态即用户的最终角色集合——因此确定按钮不禁用空选：全部取消勾选后确认即清空该用户角色

## 数据逻辑

- 状态字典：`app/src/const/common.js` 的 `STATUS_OPTIONS`（@const/common，正常 0 / 停用 1），列表展示经 `@muyianking/utils` 的 `getLabelByVal` 取标签
- `useList` 的 `server`：`withPage(api.user.list, params)`（@http），入参把 `page/limit` 映射为 `pageNum/pageSize`，出参统一规整为 `{ count, data }`
- 删除：确认后调 `api.user.remove({ userIds: row.userId })`（后端路径参数为 `userIds` 数组、支持逗号分隔批量），成功提示并 `getData()` 刷新

## 接口声明（app/src/api/user.js）

```js
urls: [
  ['get', '/list'], // api.user.list(query)
  { add: ['post', ''] }, // api.user.add(body) → POST /system/user
  { save: ['put', ''] }, // api.user.save(body) → PUT /system/user（put 走 http.request）
  { remove: ['delete', '/{userIds}'] }, // api.user.remove({ userIds })，路径参数由 createRequest 替换占位符
  ['put', '/resetPwd'], // api.user.resetPwd(body) → PUT /system/user/resetPwd
  ['put', '/authRole'], // api.user.authRole(data, { params }) → PUT /system/user/authRole（query 参数）
  { getAuthRole: ['get', '/authRole/{userId}'] }, // api.user.getAuthRole({ userId })，路径参数；返回顶层 roles 全量角色（flag 标记已分配）
]
```

## 注意事项

- 后端 `SysUser` 必填字段为 `userName`（最长 30），昵称同为最长 30、手机号最长 11，表单校验与其对齐。
- 列表行的部门是嵌套对象 `dept`，取 `row.dept?.deptName` 展示；编辑弹窗不回传整个 `dept` 对象（UserModel 只挑选表单字段）。
- 操作列按钮为图标模式，悬浮显示 tooltip；MuResetButton 自带的确认气泡与重置弹窗重复，故重置按钮用通用 `mu-button` 实现。
- 分配角色弹窗的数据源是 `GET /system/user/authRole/{userId}`（全量 + flag），不使用 `api.role.list`——后者分页且无已分配标记，无法做勾选回显。
