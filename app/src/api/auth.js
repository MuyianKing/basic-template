export default {
  config: {
    prefix: '',
  },
  // 请求路径 [method, path] 或 { key: [method, path] }
  urls: [
    // 登录
    ['post', '/login'],
    // 获取当前登录用户信息
    ['get', '/getInfo'],
    // 获取登录验证码
    ['get', '/captchaImage'],
    // 获取当前用户的后端菜单路由树
    ['get', '/getRouters'],
  ],
}
