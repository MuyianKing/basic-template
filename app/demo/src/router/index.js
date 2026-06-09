import { WEB_NAME } from '@app'
import NProgress from 'nprogress'
import { createRouter, createWebHashHistory } from 'vue-router'
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

  // const userStore = useUserStore()

  // if (to.path === '/login' || to.path === '/register' || to.path === '/forbidden') {
  //   // 跳到不需要拦截的页面
  //   return true
  // }

  // if (!userStore.token) {
  //   // 跳转到其他界面如果没有登录信息，跳转到登录界面
  //   return '/login'
  // }

  // if (canJump(to)) {
  //   return true
  // }

  // return '/forbidden'
})

// // 根据资源判断路由是否可以跳转
// function canJump() {
//   return true
// }

router.afterEach(() => {
  NProgress.done()
})

export default router
