import Layout from '@layout/Main.vue'
import FluentHome32Filled from '~icons/fluent/home-32-filled'
import FluentPerson32Filled from '~icons/fluent/person-32-filled'
import FluentSettings32Filled from '~icons/fluent/settings-32-filled'

export function isHome(path) {
  return path === '/home'
}

export default [
  {
    path: '/Login',
    component: () => import('@views/Login.vue'),
    meta: {
      title: '登录',
    },
  },
  {
    path: '/',
    component: Layout,
    name: 'admin',
    redirect: '/home',
    children: [
      {
        path: 'home',
        component: () => import('@views/home/Index.vue'),
        meta: {
          title: '首页',
          icon: FluentHome32Filled,
        },
      },
      {
        path: 'system',
        meta: {
          title: '系统管理',
          icon: FluentSettings32Filled,
        },
        children: [
          {
            path: 'user',
            component: () => import('@views/form/Index.vue'),
            meta: {
              title: '用户管理',
              icon: FluentPerson32Filled,
            },
          },
        ],
      },
    ],
  },
  {
    path: '/forbidden',
    component: () => import('@views/403.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@views/404.vue'),
  },
]
