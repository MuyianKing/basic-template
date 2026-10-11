import { api } from '@http'
import { registryRoutes } from './menu/index'

// 归一化路径段：剥掉首尾斜杠（后端顶级目录 path 带前导 /，本地清单为纯相对段）
function normalizeSegment(path) {
  return String(path).replace(/^\/+|\/+$/g, '')
}

// 父子路径段拼接为完整路径：joinFullPath('', '/system') → '/system'，joinFullPath('/system', 'user') → '/system/user'
function joinFullPath(parentPath, path) {
  const full = [parentPath, normalizeSegment(path)].filter(Boolean).join('/')
  return full.startsWith('/') ? full : `/${full}`
}

// 本地清单按完整路径建索引，供合并时按后端节点查找
function createRegistryIndex(routes, parentPath = '') {
  const index = new Map()
  routes.forEach((route) => {
    const fullPath = joinFullPath(parentPath, route.path)
    index.set(fullPath, route)
    if (route.children?.length) {
      createRegistryIndex(route.children, fullPath).forEach((node, path) => index.set(path, node))
    }
  })
  return index
}

// 与后端菜单树按完整路径合并：层级/标题/显隐以后端为准，component/icon 取本地清单；
// 本地清单没有的节点整枝剪掉，子级剪空的目录一并去掉
function mergeRoutes(menus, registryIndex, parentPath = '') {
  const routes = []
  menus.forEach((menu) => {
    const fullPath = joinFullPath(parentPath, menu.path)
    const local = registryIndex.get(fullPath)
    if (!local) {
      return
    }
    const route = {
      // name 由完整路径生成（树内唯一），登出重置时按 name 移除路由
      name: fullPath.slice(1).replace(/\//g, '-'),
      path: normalizeSegment(menu.path),
      component: local.component,
      meta: {
        ...local.meta,
        title: menu.meta?.title || local.meta?.title,
        // 后端隐藏的菜单保持可访问但不在侧边栏显示（SubMenu 按 meta.hide 过滤）
        hide: !!menu.hidden,
      },
    }
    const children = menu.children?.length ? mergeRoutes(menu.children, registryIndex, fullPath) : []
    if (children.length) {
      route.children = children
    }
    // 目录节点（无 component）在子级全部剪空后一并去掉
    if (route.component || route.children) {
      routes.push(route)
    }
  })
  return routes
}

/**
 * 拉取后端菜单树（GET /getRouters）并按完整路径合并本地配置，生成 admin 子路由
 * @returns {Promise<Array|null>} 合并后的路由数组，请求失败返回 null
 */
export async function loadAdminRoutes() {
  const res = await api.auth.getRouters()
  if (!res || !Array.isArray(res.data)) {
    return null
  }
  return mergeRoutes(res.data, createRegistryIndex(registryRoutes))
}
