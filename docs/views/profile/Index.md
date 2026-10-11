# 个人中心（/user/profile）

## 基本信息

- 源码：`app/src/views/profile/Index.vue`
- 路由：`/user/profile`（`app/src/router/menu/index.js` 中 admin 路由的 children，静态壳路由，`meta.hidden` 不进侧边栏），入口为布局右上角头像下拉的「个人中心」（`app/src/layout/User.vue`）
- 接口声明：`app/src/api/user.js`（模块前缀 `/system/user`，经 `@http` 绑定为 `api.user.*` 调用，方案见 docs/api.md）
- 头像上传封装：`app/src/server/user.js` 的 `uploadAvatar`（FormData 组装属可复用业务逻辑，按约定收在 server 层）

## 页面结构

左右双栏布局（`h-full flex gap-2 p-2`，面板 `bg-[var(--el-bg-color)]`，同字典管理页的面板风格）：

### 左侧：个人信息

- 头像：`el-upload`（`http-request` 自定义上传）包着 `el-avatar`，悬浮显示半透明遮罩 + 加号；上传前校验 JPG/PNG、不超过 5MB
- 信息列表：用户名称（`userName`）、手机号码（`phonenumber`）、用户邮箱（`email`）、所属部门（`dept.deptName`）、所属角色（响应顶层 `roleGroup`）、创建日期（`createTime`），图标用 unplugin-icons 的 ep 系列

### 右侧：基本资料 / 修改密码（el-tabs）

- 基本资料：用户昵称（required + max 30）、手机号码（required + 正则）、邮箱（required + email 格式 + max 50）、性别（radio，`SEX_OPTIONS`，@const/common），保存调 `api.user.updateProfile`
- 修改密码：旧密码（required）、新密码（required + 长度 5~20）、确认密码（required + 与新密码一致校验），保存调 `api.user.updatePwd`，成功后 `logout()` 重新登录

## 数据逻辑

- 页面数据来自 `api.user.profile()`（GET /system/user/profile），响应为 `{ code, msg, data: 用户对象, roleGroup, postGroup }`，`data` 为用户、`roleGroup`/`postGroup` 为角色与岗位分组名
- 基本资料与修改密码各自独立 `el-form` + `ref` 校验（`formRef.validate().catch(() => false)`），通过后才提交；http 失败返回 null 时直接 return（错误提示由 http 层统一弹出）
- 昵称与头像保存/上传成功后同步写回 `useUserStore().nickname / avatar`，布局头部头像与昵称即时更新
- 头像展示：相对路径（如 `/profile/avatar/...`）自动补 `BASE_URL`（@app），完整 http 链接原样使用

## 接口声明（app/src/api/user.js）

```js
urls: [
  { profile: ['get', '/profile'] }, // api.user.profile() → GET /system/user/profile
  { updateProfile: ['put', '/profile'] }, // api.user.updateProfile(body) → PUT /system/user/profile（与 GET 同路径，须显式命名 key）
  { updatePwd: ['put', '/profile/updatePwd'] }, // api.user.updatePwd({ oldPassword, newPassword }) → PUT /system/user/profile/updatePwd
  { uploadAvatar: ['post', '/profile/avatar'] }, // api.user.uploadAvatar(FormData, { headers }) → POST /system/user/profile/avatar，multipart 字段 avatarfile，返回顶层 imgUrl
]
```

## 注意事项

- 头像上传走声明式接口（`api.user.uploadAvatar`），须传 `{ headers: { 'Content-Type': 'multipart/form-data' } }` 覆盖 http.post 默认的 JSON 头（浏览器端遇 FormData 自动改写为带 boundary 的表单头）；FormData 组装在 `@server/user` 的 `uploadAvatar` 内完成
- 修改密码成功后调 `@server/user` 的 `logout()` 重新登录（若依修改密码后旧会话仍有效，重新登录确保凭证刷新）
- `useUserStore` 比早前多了 `nickname` / `avatar` 两个字段，来源是 `getUserInfoByToken()`（GET /getInfo 的 `user.nickName` / `user.avatar`）；同时修正了该函数把 `userName` 读成 `username` 导致头部用户名为空的问题
- RuoYi 页脚的「关闭」按钮未实现：项目 Tags store 无关闭当前标签页能力，为避免引入耦合暂只保留「保存」
