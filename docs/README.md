# 文档索引

## 通用（docs/）

- [API 声明与调用方案](./api.md) — app/src/api 声明式接口方案（[method, path] 声明 → 描述符树 → @http 函数树），含命名推导、新增模块与 api.d.ts 类型生成说明
- [动态路由方案](./router.md) — getRouters 后端菜单树与本地配置清单按完整路径合并的动态路由（职责划分、守卫时序、登出重置、新增页面流程）

## 组件（docs/components/）

- [MuDeptTreeSelect](./components/dept/Index.md) — 部门树选择器（el-tree-select 封装，内部拉取部门树，支持 excludeId 排除自身子树）
- [MuDictSelect](./components/dict/Index.md) — 字典选择器（MuSmartSelect 封装，按 dictType 拉取字典选项并缓存，type 切换下拉/单选/多选）
- [MuMenuTreeSelect](./components/menu/Index.md) — 上级菜单树选择器（el-tree-select 封装，仅目录/菜单可作上级，补充虚拟根节点「主类目」，支持 excludeId 排除自身子树）
- [MuRoleSelect](./components/role/Index.md) — 角色选择器（MuSelectRemote 封装，远程分页拉取角色列表，按 roleName 远程搜索）
- [MuSmartList](./components/smartui/smart-list/Index.md) — 列表页布局组件（搜索区 + 按钮 + 表格 + 分页），配合 headless useList
- [MuSmartSelect](./components/smartui/smart-select/Index.md) — 统一选择组件（type 切换 mu-select / mu-radio / mu-checkbox，共用 options，checkbox 为数组 v-model）
- [MuSmartForm](./components/smartui/smart-form/Index.md) — 配置化表单弹窗（useSmartForm + 表单模型用法，支持 server 保存接口；openDialog 队列 + MuDialogHost）

## 页面（docs/views/）

- [登录（/login）](./views/login/Index.md) — 对接 /login、/getInfo、/captchaImage 的登录页（账号 + 密码 + 验证码，token 存 pinia）
- [首页（/home）](./views/home/Index.md) — 布局内默认首页（欢迎横幅 + 快捷入口 + 版本信息）
- [用户管理（/system/user）](./views/system/user/Index.md) — 对接 /system/user 接口的用户管理（左侧部门树可筛选 + 右侧分页列表 + 新增/修改/删除/重置密码）
- [部门管理（/system/dept）](./views/system/dept/Index.md) — 对接 /system/dept 接口的部门管理（搜索 + 树形列表 + 新增/修改/删除）
- [岗位管理（/system/post）](./views/system/post/Index.md) — 对接 /system/post 接口的岗位管理（搜索 + 分页列表 + 新增/修改/删除）
- [角色管理（/system/role）](./views/system/role/Index.md) — 对接 /system/role 接口的角色管理（搜索 + 分页列表 + 新增/修改/删除 + 分配用户：取消/批量取消/批量添加授权 + 绑定菜单）
- [菜单管理（/system/menu）](./views/system/menu/Index.md) — 对接 /system/menu 接口的菜单管理（搜索 + 树形懒加载列表 + 新增/修改/删除，表单项按目录/菜单/按钮类型条件显隐）
- [字典管理（/system/dict）](./views/system/dict/Index.md) — 对接 /system/dict/type、/system/dict/data 接口的字典管理（左侧类型 + 右侧数据联动，均支持新增/修改/删除）
- [操作日志（/system/log/operlog）](./views/log/operlog/Index.md) — 对接 /monitor/operlog 接口的操作日志（搜索 + 分页列表 + 详情弹窗：基本信息/操作人员/请求信息/请求参数/返回参数）
- [登录日志（/system/log/logininfor）](./views/log/logininfor/Index.md) — 对接 /monitor/logininfor 接口的登录日志（搜索 + 分页列表：登录地址/用户名/状态/登录时间，含浏览器与操作系统）
- [个人中心（/user/profile）](./views/profile/Index.md) — 右上角头像下拉进入的个人中心（左侧个人信息+头像上传 + 右侧基本资料/修改密码双 Tab）
