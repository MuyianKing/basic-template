# 首页（/home）

## 页面信息

- 路由：`/home`，静态壳路由，钉死在 admin 布局内（见 `app/src/router/menu/index.js` 默认导出）。
- 组件：`app/src/views/home/Index.vue`，组件名 `MuHomeIndex`。

## 页面结构

纯展示页，无接口调用：

1. **欢迎横幅**：按时段问候（夜深了 / 早上好 / 下午好 / 晚上好）+ 当前用户昵称（`useUserStore` 的 `nickname`，缺省回退 `username`），右侧展示当天日期（含星期）。
2. **快捷入口**：系统管理各模块卡片（用户 / 部门 / 岗位 / 角色 / 菜单 / 字典 / 操作日志），点击经 `router.push` 跳转对应路由；卡片 hover 主色描边。
3. **技术栈**：项目依赖标签展示。

## 样式约定

- 面板配色使用 element-plus 主题变量（`--el-bg-color`、`--el-border-color-lighter`、`--el-color-primary-light-9`），暗黑模式自动跟随。
- 布局（间距、栅格）全部使用 Tailwind 工具类；快捷入口栅格为 2 列，`lg` 起 4 列，`xl` 起 7 列。
