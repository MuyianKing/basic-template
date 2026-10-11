/**
 * API 路由聚合：把各模块的 [method, path] 声明汇总为 { method, url } 描述符树。
 * 完整方案说明见 docs/api.md
 */
import auth from './auth.js'
import common from './common.js'
import dept from './dept.js'
import dictData from './dictData.js'
import dictType from './dictType.js'
import logininfor from './logininfor.js'
import menu from './menu.js'
import operlog from './operlog.js'
import post from './post.js'
import role from './role.js'
import user from './user.js'

// 模块注册表：新增模块文件后在此登记
const apis = {
  config: {
    // 所有接口的根前缀（后端接口无统一前缀，与 docs/api-docs.json 保持一致，保持为空）
    prefix: '',
  },
  // 请求路径
  urls: {
    auth,
    common,
    dept,
    dictData,
    dictType,
    logininfor,
    menu,
    operlog,
    post,
    role,
    user,
  },
}

// 拼接路径段并保证以「/」开头：joinPath('', 'auth', '/login') → '/login'
function joinPath(...paths) {
  return `/${paths.filter(Boolean).map(path => path.replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/')}`
}

// kebab-case 转小驼峰：'start-all' → 'startAll'
function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// 按 key 路径写入 value，中间层级自动创建：setPath(obj, ['a', 'b'], v) → obj.a.b = v
function setPath(target, keys, value) {
  const lastKey = keys.pop()
  const parent = keys.reduce((current, key) => {
    current[key] ||= {}
    return current[key]
  }, target)
  parent[lastKey] = value
}

// 加上「全局前缀 + 模块前缀」生成描述符：['post', '/login'] → { method: 'post', url: '/login' }
function createDescriptor(module, [method, path]) {
  return { method, url: joinPath(apis.config.prefix, module.config.prefix, path) }
}

const api = {}

Object.entries(apis.urls).forEach(([moduleKey, module]) => {
  const target = api[moduleKey] ||= {}

  module.urls.forEach((item) => {
    // 元组 [method, path] —— key 由路径推导
    if (Array.isArray(item)) {
      const keys = item[1].split('/').filter(Boolean).map(toCamelCase)
      setPath(target, keys, createDescriptor(module, item))
      return
    }

    // 对象 { key: [method, path] } —— 显式命名 key
    Object.entries(item).forEach(([key, value]) => {
      target[key] = createDescriptor(module, value)
    })
  })
})

export default api
