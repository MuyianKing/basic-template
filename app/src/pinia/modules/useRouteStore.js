import { defineStore } from 'pinia'
import router from '@/router'

export default defineStore('route', {
  state: () => ({
    // getRouters 与本地清单合并出的业务菜单路由（admin 子路由，不含静态注册的 home）
    menus: [],
    // 当前登录会话动态路由是否已加载（守卫据此决定是否拉取）
    loaded: false,
  }),
  actions: {
    setMenus(routes) {
      this.menus = routes
      this.loaded = true
    },
    // 登出/登录页挂载时重置：移除动态注册的路由并清空菜单，避免换账号后残留上一账号的路由
    resetRoutes() {
      this.menus.forEach((route) => {
        if (route.name && router.hasRoute(route.name)) {
          router.removeRoute(route.name)
        }
      })
      this.menus = []
      this.loaded = false
    },
  },
})
