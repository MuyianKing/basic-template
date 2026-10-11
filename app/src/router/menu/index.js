import Layout from '@layout/Main.vue'
import FluentBook32Filled from '~icons/fluent/book-32-filled'
import FluentBriefcase32Filled from '~icons/fluent/briefcase-32-filled'
import FluentBuilding32Filled from '~icons/fluent/building-32-filled'
import FluentClipboardTextEdit32Filled from '~icons/fluent/clipboard-text-edit-32-filled'
import FluentHistory32Filled from '~icons/fluent/history-32-filled'
import FluentHome32Filled from '~icons/fluent/home-32-filled'
import FluentPeopleTeam20Filled from '~icons/fluent/people-team-20-filled'
import FluentPerson32Filled from '~icons/fluent/person-32-filled'
import FluentPersonArrowRight24Filled from '~icons/fluent/person-arrow-right-24-filled'
import FluentSettings32Filled from '~icons/fluent/settings-32-filled'
import FluentTextBulletListSquare32Filled from '~icons/fluent/text-bullet-list-square-32-filled'

export function isHome(path) {
  return path === '/home'
}

// 静态壳路由：启动时直接注册，不参与后端菜单合并。
// home 钉死在布局内，业务菜单在登录后由 getRouters 与 registryRoutes 合并出并动态注入 admin 子路由
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
        // 个人中心：头像下拉入口，meta.hidden 不进侧边栏（见 side-bar 的 createMenuList 过滤）
        path: 'user/profile',
        component: () => import('@views/profile/Index.vue'),
        meta: {
          title: '个人中心',
          hidden: true,
        },
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

// 业务路由配置清单：admin 下的子路由，path 为相对路径（与后端菜单的「路由地址」一致）。
// 只声明 component 与 icon（编译期资产，后端给不了），不直接注册；登录后与 getRouters
// 下发的菜单树按完整路径合并（见 ../dynamic.js），后端下发但本地清单没有的节点会被剪掉
export const registryRoutes = [
  {
    path: 'system',
    meta: {
      title: '系统管理',
      icon: FluentSettings32Filled,
    },
    children: [
      {
        path: 'user',
        component: () => import('@views/system/user/Index.vue'),
        meta: {
          title: '用户管理',
          icon: FluentPerson32Filled,
        },
      },
      {
        path: 'dept',
        component: () => import('@views/system/dept/Index.vue'),
        meta: {
          title: '部门管理',
          icon: FluentBuilding32Filled,
        },
      },
      {
        path: 'post',
        component: () => import('@views/system/post/Index.vue'),
        meta: {
          title: '岗位管理',
          icon: FluentBriefcase32Filled,
        },
      },
      {
        path: 'role',
        component: () => import('@views/system/role/Index.vue'),
        meta: {
          title: '角色管理',
          icon: FluentPeopleTeam20Filled,
        },
      },
      {
        path: 'menu',
        component: () => import('@views/system/menu/Index.vue'),
        meta: {
          title: '菜单管理',
          icon: FluentTextBulletListSquare32Filled,
        },
      },
      {
        path: 'dict',
        component: () => import('@views/system/dict/Index.vue'),
        meta: {
          title: '字典管理',
          icon: FluentBook32Filled,
        },
      },
      {
        path: 'log',
        meta: {
          title: '日志管理',
          icon: FluentHistory32Filled,
        },
        children: [
          {
            path: 'operlog',
            component: () => import('@views/system/log/operlog/Index.vue'),
            meta: {
              title: '操作日志',
              icon: FluentClipboardTextEdit32Filled,
            },
          },
          {
            path: 'logininfor',
            component: () => import('@views/system/log/logininfor/Index.vue'),
            meta: {
              title: '登录日志',
              icon: FluentPersonArrowRight24Filled,
            },
          },
        ],
      },
    ],
  },
]
