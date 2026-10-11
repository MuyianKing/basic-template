# 动态路由方案

路由采用「后端菜单树 + 本地配置清单」合并的动态路由：后端 `GET /getRouters` 提供层级结构、标题与显隐（即权限过滤），本地清单提供页面组件与图标（编译期资产，后端无法下发），两边按**完整路径**匹配合并后动态注册。

## 职责划分

| 内容 | 归属 | 说明 |
| --- | --- | --- |
| 层级结构 / 排序 / 标题 / 显隐 | 后端菜单管理 | 菜单管理页维护，getRouters 下发 M 目录 + C 菜单树 |
| 页面组件（component） | 本地清单 | 后端 component 字符串不参与匹配，仅作参考 |
| 图标（icon） | 本地清单 | unplugin-icons 构建期编译，只能是本地组件 |
| path | 两边一致 | 相对路径段（菜单管理里的「路由地址」），匹配键的前半部分 |
| 登录 / home / 403 / 404 | 静态壳 | 不参与合并，home 钉死在布局内 |

## 文件构成

- `app/src/router/menu/index.js`：
  - 默认导出**静态壳路由**（Login、admin 布局壳 + home、403、404 兜底），启动时直接注册；
  - 命名导出 `registryRoutes`：**业务路由配置清单**，admin 下的子路由树（path 相对路径 + component + icon），只做配置不注册。
- `app/src/router/dynamic.js`：合并逻辑。把本地清单按完整路径建索引（`system` + `user` → `/system/user`），遍历后端菜单树同法生成完整路径逐节点查找；匹配上的节点用后端的 path/标题/hidden + 本地的 component/icon 生成路由记录，本地清单没有的节点整枝剪掉，子级剪空的目录一并去掉。暴露 `loadAdminRoutes()`（请求失败返回 null）。
- `app/src/router/index.js`：静态壳 + 守卫。
- `app/src/pinia/modules/useRouteStore.js`：保存合并结果（`menus` 供侧边栏渲染）与 `loaded` 标记；`resetRoutes` 按 name 移除动态注册的路由（name 由完整路径生成，如 `system-user`）。

## 守卫时序（`app/src/router/index.js`）

1. 白名单页（/login、/register、/forbidden）直接放行。
2. 无 token → `/login`。
3. `useRouteStore().loaded` 为 false（未登录过本会话 / 刚刷新 / 刚登出）：调 `loadAdminRoutes()` 拉取合并 → 逐条 `router.addRoute('admin', route)` → 置 loaded → `return { ...to, replace: true }` **重放本次跳转**（否则命中的还是注册前的匹配结果）。
4. 拉取失败（登录信息失效等）：清登录态回 `/login`，http 层已统一弹错。
5. loaded 为 true 直接放行；未授权或不存在路径由 404 兜底（vue-router 4 中 catch-all 按路径评分永远最低优先级，无需延后注册）。

## 登出 / 换账号重置

`@server/user` 的 `clearUserData()`（登出、登录页挂载、401 兜底都会走）在清用户与标签之外调用 `useRouteStore().resetRoutes()`：按 name 移除动态路由并清空 menus，避免换账号后残留上一账号的路由。

## 约定与注意

- 本地清单节点的 path 必须与后端菜单的「路由地址」逐段一致（相对段）；后端顶级目录下发的 path 带前导 `/`（如 `/system`），合并时已做归一化，本地写纯相对段即可。
- 后端新增页面：菜单管理加菜单 + 本地清单加对应节点（新页面本来就要发前端，这两步同一次提交完成）。
- 后端把菜单挂到新目录或改「路由地址」：完整路径变化，本地清单对应节点的 path 要同步改，否则整枝剪掉（是「挪了就断」而不是「降级显示」）。
- 后端菜单「隐藏」标记（hidden）映射为路由 `meta.hide`：路由仍注册可访问，侧边栏 SubMenu 按 `meta.hide` 不渲染。
- 按钮级权限（F 类型菜单）不走路由，由 `/getInfo` 的 perms 驱动，另行实现。
- 新增业务页面：`app/src/views/` 建页面 + 本地清单加节点（path/component/icon）+ 后端菜单管理录入相同路径。
