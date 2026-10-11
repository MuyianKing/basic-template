# API 声明与调用方案

## 方案总览

```
api/*.js                    api/index.js              utils/request.js (@http)
┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────────────┐
│ [method, path]  │ → │ 聚合为描述符树        │ → │ bindApi 递归绑定为函数树  │
│ 纯数据声明       │   │ 叶子 { method, url } │   │ export const api         │
└─────────────────┘   └──────────────────────┘   └──────────────────────────┘
        │                        │                            │
        └── api-types 生成器（node 子进程，要求纯数据）          │
                                                     业务代码 import { api } from '@http'
```

- `api/*.js` 只声明「请求方式 + 路径」，是唯一的接口登记处。
- `api/index.js` 聚合为**描述符树**（叶子 `{ method, url }`），不发请求。
- `@http` 把描述符树绑定成**函数树**，业务代码直接调用。
- `server/` 只保留含业务逻辑的请求封装（如文件上传组装 FormData），纯转发不写函数。

## 声明接口

每个 API 模块默认导出以下结构：

```js
export default {
  config: {
    prefix: '/system/user',
  },
  urls: [
    ['get', '/page'],
    ['post', '/reset-password'],
    { save: ['post', ''] },
  ],
}
```

- `config.prefix`：模块 URL 前缀，只参与 URL 拼接，不影响调用名。
- `urls` 支持两种形式：
  - `['method', 'path']`：调用名由路径推导。
  - `{ key: ['method', 'path'] }`：显式指定调用名（路径推导名不合语义时用）。
- 根前缀统一在 `src/api/index.js` 的 `apis.config.prefix` 中配置，当前为空（后端接口无统一前缀，与 docs/api-docs.json 保持一致）。

## 属性名推导规则

元组形式按以下规则生成模块内部属性：

1. 路径中的 `/` 转为对象层级。
2. 每个路径段中的 kebab-case 自动转为 camelCase。
3. 根前缀、模块前缀和接口路径依次拼接为最终 URL。

示例（模块 key 为 `user`，`prefix: '/system/user'`）：

```js
urls: [
  ['get', '/page'],
  ['get', '/reset-password'],
]
```

生成结果（描述符树）：

```js
api.user.page          // { method: 'get', url: '/system/user/page' }
api.user.resetPassword // { method: 'get', url: '/system/user/reset-password' }
```

空前缀只表示 URL 不增加模块前缀，接口仍挂载到 `apis.urls` 指定的模块 key 下：

```js
// 模块 key 为 common，prefix: ''
urls: [
  ['post', '/common/upload'],
  ['post', '/common/uploads'],
]
```

```js
api.common.upload  // { method: 'post', url: '/common/upload' }
api.common.uploads // { method: 'post', url: '/common/uploads' }
```

自定义属性名示例（对象形式不按 `/` 生成嵌套）：

```js
urls: [
  { save: ['post', ''] },
]
```

```js
api.user.save // { method: 'post', url: '/system/user' }
```

## 调用接口

业务代码从 `@http` 导入函数树直接调用，GET 第一参数是 query，POST 第一参数是 body：

```js
import { api } from '@http'

const list = await api.user.page({ pageNum: 1 })
await api.user.resetPassword({ id })
await api.user.save(data)
```

注意区分两个 `api`：

| 导入 | 内容 | 用途 |
|---|---|---|
| `import api from '@api'` | 描述符树（叶子 `{ method, url }`） | 取原生 URL、类型生成 |
| `import { api } from '@http'` | 可调用的函数树 | 业务代码日常调用 |

## 需要原生 URL 的场景

需要自定义 axios 配置（如文件上传的 FormData、进度回调）时，直接从描述符取 `.url`：

```js
import api from '@api'
import http from '@http'

http.upload(data, { url: api.common.upload.url, onProgress: event => {} })
```

实际封装见 `src/server/file.js` 的 `uploadFile`：单文件走 `/common/upload`（字段名 `file`），多文件走 `/common/uploads`（字段名 `files`），返回归一化的 `{ id, name, path }` 列表；并通过 App.vue 的 `mu-config-provider :custom-config` 注入给 `mu-upload` / `mu-file` 组件使用。

## server 层定位

`src/server/` 只在请求含可复用业务逻辑时才写封装，例如 `file.js` 的 FormData 组装、`uploadObject` 差量上传。纯转发式的函数不需要存在——描述符经 `@http` 绑定后已是可直接调用的请求函数。

## 新增 API 模块

1. 在 `src/api` 下新增模块文件，例如 `role.js`。
2. 在 `src/api/index.js` 中导入该模块并加入 `apis.urls`。

```js
import role from './role.js'

const apis = {
  config: {
    prefix: '',
  },
  urls: {
    role,
  },
}
```

模块配置与调用：

```js
export default {
  config: {
    prefix: '/system/role',
  },
  urls: [
    ['get', '/page'],
    ['get', '/detail'],
  ],
}
```

```js
import { api } from '@http'

const list = await api.role.page(params)
const detail = await api.role.detail({ id })
```

## 类型提示

`plugins/api-types.js` 提供本地 Rsbuild 插件 `pluginApiTypes()`，在 node 子进程中 import `src/api/index.js` 并遍历描述符树，生成项目根目录下的 `api.d.ts`。

插件会在以下时机更新声明：

- 开发服务器或生产构建创建编译器前。
- 开发服务器运行期间，`src/api` 下的 `.js` 文件新增、修改或删除后。

`api.d.ts` 是生成文件，不要手动修改。新增或调整接口并保存后，IDE 会自动获得对应的属性提示。若提示未立即刷新，可重启 JavaScript/TypeScript 语言服务。

插件支持以下选项：

```js
pluginApiTypes({
  entry: 'src/api/index.js',
  output: 'api.d.ts',
  watchDir: 'src/api',
  debounce: 80,
})
```

这些值均为默认配置，通常直接使用 `pluginApiTypes()` 即可。

## 设计约束

- `api/index.js` 必须保持**纯数据**（不 import `@http`）：类型生成器在 node 子进程中 import 它，浏览器运行时依赖会导致生成器崩溃。
- 绑定逻辑统一放在 `@http`（`bindApi` / `createRequest`），api 层与 http 层单向依赖（`@http` → `@api`），无循环。
