import { WEB_NAME } from '@app'
import NProgress from 'nprogress'
import { createRouter, createWebHashHistory } from 'vue-router'
import { loadAdminRoutes } from './dynamic'
import routes from './menu/index'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  NProgress.start()

  const title = useTitle()
  title.value = `${WEB_NAME} - ${to.meta.title || ''}`

  const userStore = useUserStore()

  if (to.path === '/login' || to.path === '/register' || to.path === '/forbidden') {
    // 跳到不需要拦截的页面
    return true
  }

  if (!userStore.token) {
    // 跳转到其他界面如果没有登录信息，跳转到登录界面
    return '/login'
  }

  const routeStore = useRouteStore()
  if (!routeStore.loaded) {
    // 动态路由未加载：合并后端菜单与本地配置注册到 admin 下，再按新注册的路由重放本次跳转
    const adminRoutes = await loadAdminRoutes()
    if (!adminRoutes) {
      // getRouters 拉取失败（登录信息失效等）：http 已统一提示，清登录态回登录页重新认证
      userStore.clearUser()
      return '/login'
    }
    adminRoutes.forEach(route => router.addRoute('admin', route))
    routeStore.setMenus(adminRoutes)
    return { ...to, replace: true }
  }

  return true
})

router.afterEach(() => {
  NProgress.done()
})

export default router
