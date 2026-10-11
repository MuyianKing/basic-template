# 登录（/login）

## 基本信息

- 源码：`app/src/views/Login.vue`（组件名 `UserLoginNoAlive`）
- 路由：`/login`（`app/src/router/menu/index.js`，路由守卫在无 token 时重定向到此页）
- 接口模块：`app/src/api/auth.js`（对接 docs/api-docs.json 中 `POST /login`、`GET /getInfo`、`GET /captchaImage`，经 `@http` 的 `api` 函数树调用）

## 页面结构

全屏简洁布局：左侧深色波浪装饰（`lg` 以下屏幕隐藏，整体水平镜像），实现方式为两个巨大的十瓣"花瓣圆"路径（SVG `<symbol id="login-wave-bg">` + `<use>`，填充用 `color-mix` 把主题色 `var(--el-color-primary)` 与 `#2c3142` 按 7:3 混合压暗，透明度 0.3/0.9 叠出浅、深两层），通过 SMIL `animateTransform` 绕自身圆心缓慢旋转（灰瓣 10s、深瓣 6s 转 36°，恰为一瓣周期，循环无缝），边缘始终平滑。右侧居中展示 Logo 方块（取 `WEB_NAME` 首字符）+ 站点名 + 副标语 + 登录表单，页面底部居中版权文字。表单为 el-form（label-position="top"）+ mu-input，输入框浅灰底无边框、聚焦时主色描边；页面内通过局部覆盖 `--el-*` CSS 变量固定浅色观感，不受全局暗黑主题影响：

- 账号（username，required）、密码（password，required，回车提交）
- 验证码（code，required）：`captchaEnabled` 不为 false 时展示，输入框右侧展示 base64 验证码图，点击图片调 `api.auth.captchaImage()` 刷新（`refreshCaptcha` 会同步更新 `form.uuid` 并清空 `form.code`）

## 数据逻辑

- 提交：`api.auth.login({ username, password, code, uuid })`（POST /login），成功返回 `{ token }`。
- 失败处理：`@http` 请求失败统一弹错并返回 null，此时调用 `refreshCaptcha()` 换新验证码等待重新输入。
- 登录成功（`afterLogin`）：
  1. `userStore.initUser({ token })` 存储 token（pinia 持久化），后续请求经 `request.class.js` 请求拦截器自动携带 `Authorization: Bearer <token>`。
  2. 调 `getUserInfoByToken()`（`app/src/server/user.js`，GET /getInfo）取回用户信息，规整为 `{ id, username, nickname, avatar }` 后并入 user store（头部头像与昵称展示来源）。
  3. `router.push('/')` 进入首页。
- 进入登录页时 `clearUserData()` 清空 user / tags store，并预取一次验证码。

## 注意事项

- 后端响应码码型不统一：成功返回字符串 `'200'`，失败返回数字 `500`/`401`，拦截器统一按数值比较（见 `app/src/utils/request.class.js` 的 `SUCCESS_CODES`）；token 失效（`-2` 或 `401`）会自动跳回 `/login`。`captchaEnabled` 为 Python 风格布尔字符串（`'True'`/`'False'`），前端统一转小写判断。
- 所有请求不带 cookie（后端 CORS 未开 `Access-Control-Allow-Credentials`，凭据模式会被浏览器拦截）；认证完全依赖 `Authorization: Bearer <token>` 头。
- 后端无 `/logout` 接口，`logout`（`app/src/server/user.js`）为前端清 store + 跳转。
- 业务代码调登录接口统一走 `import { api } from '@http'` 的 `api.auth.*`，不写 server 纯转发函数（见 [API 声明与调用方案](../../api.md)）。
