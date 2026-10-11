---
name: "vue3-crud-page"
version: "1.1.0"
description: "在 Vue 3 中后台项目中创建一个标准 CRUD 管理模块：接口声明、字典、表单模型、列表页、增删改弹窗、路由菜单、文档同步全流程。适用于采用「声明式接口树 + headless 列表 hook + 配置化表单弹窗 + 表单模型」体系的项目。当用户说“新增/创建 XX管理页面”、“做一个 XX 的增删改查”、“加一个 XX 模块”等意图时立即触发。"
---

# Vue 3 CRUD 管理模块创建指南

面向采用以下分层体系的中后台项目的标准 CRUD 做法：

```
api/<module>.js        声明式接口：只写 [method, path]，聚合成描述符树后绑定为可调用函数树
const/<域>.js           共享字典：后端枚举的唯一来源
model/<module>.js      表单模型：行数据 → 表单状态的字段规整与默认值
views/<module>/        页面：headless 列表 hook + 配置化列表/查询/表格/弹窗组件
```

四层职责互不掺杂：接口层不管参数适配，模型层不管请求，页面不管字段映射，字典不出现字面量副本。新建模块时**先读项目内一个已落地的同体系模块再动手**，保持与其一致的层次与命名。

## 触发条件

用户要求新增一个管理模块（如「XX管理，支持新增/修改/删除，列表字段有…」）。

## 执行步骤（必须依次执行）

### Step 1 · 前置调研

1. 读项目的接口文档（OpenAPI 等），确认该模块的接口路径、方法、请求/响应结构与必填字段。**接口结构以文档为准**，先分清两种常见返回外壳：分页列表 `{ rows/list/records, total }` 与全量列表 `{ data: [...] }`。
2. 读项目根的约束文件（AGENTS.md / CLAUDE.md），确认文件落位、文档同步与验证要求。
3. 读项目内一个已落地的同体系 CRUD 模块全套文件，照它的层次组织新模块。

### Step 2 · 接口声明（api/）

新建 `api/<module>.js`，只声明 `[method, path]`，并在聚合入口（如 `api/index.js` 的模块注册表）登记（import + 条目，两处都改）：

```js
export default {
  config: {
    prefix: '/system/user',
  },
  urls: [
    ['get', '/list'],                   // api.user.list(query)
    { add: ['post', ''] },              // 空路径必须用对象形式显式命名 key（元组形式空 path 推导不出 key）
    { save: ['put', ''] },
    { remove: ['delete', '/{id}'] },    // 路径参数：{param} 占位符
  ],
}
```

要点：

- 业务代码一律从 http 封装导入函数树直接调用（GET 首参 query，其余首参 body），**不写纯转发的 server 函数**；仅含可复用业务逻辑（如 FormData 组装）才进 server 层。
- 路径参数由请求绑定层（如 `createRequest`）用首参同名字段替换 `{param}` 占位符，声明层与调用层无感知；若所用体系尚未支持，先在绑定层补齐，不改业务调用。
- 请求封装只覆盖常用方法（如 get/post）时，put/delete 应在绑定层统一兜底，而不是业务代码里散落 `http.request`。
- 聚合入口必须保持纯数据（不 import http 层）：类型生成器若在 node 子进程 import 它，混入运行时依赖会崩。

### Step 3 · 字典与常量（const/）

- 多处共用的枚举（状态、是否等）放 `const/<域>.js` 导出，如 `STATUS_OPTIONS = [{ label: '正常', value: '0' }, …]`；跨模块通用项进 `common.js`。**不要在页面和弹窗里各自字面量定义**。
- 值类型与后端一致（如若依 sys_normal_disable 是字符串 '0'/'1'）。
- 列表展示标签用工具函数按值取标签（如 `getLabelByVal(字典, 值)`），不要手写映射对象。

### Step 4 · 表单模型（model/）

新建 `model/<module>.js`，默认导出一个 class，构造函数负责**字段挑选 + 默认值**，是行数据到表单状态的唯一映射处：

```js
export default class {
  constructor(model) {
    model = model || {}
    this.id = model.id || ''
    this.name = model.name || ''
    this.orderNum = model.orderNum ?? ''  // 0 是合法值的字段用 ??，别让 || 吞掉
    this.status = model.status || '0'     // 新增默认值
  }
}
```

作用：挡掉列表行上的杂字段（headless 列表常给行加 `index`，树形数据有 `children`），避免它们被提交到后端；同时把「新增默认值」收敛到一处。

### Step 5 · 编辑弹窗（views/<module>/components/EditDialog.vue）

弹窗是页面私有子组件，内部用 `useSmartForm` 类组合式函数持有弹窗与表单状态：

```vue
<script setup>
import { useSmartForm } from '@comp/smartui'
import XxModel from '@model/xx'

defineOptions({ name: 'MuXxEditDialog' })

const config = [
  { label: '名称', prop: 'name', rules: 'required,maxLength=30' },
  { label: '排序', prop: 'orderNum', rules: 'required,integer' },
  { label: '状态', prop: 'status', comp: 'radio', compProps: { options: STATUS_OPTIONS } },
]

async function handleSubmit(model) {
  const result = model.id ? await api.xx.save(model) : await api.xx.add(model)
  if (!result) {
    throw new Error('保存失败') // 关键：http 失败返回 null 而不是抛错，不抛错会被当成保存成功
  }
  return result
}

const { SmartForm, open } = useSmartForm({ Model: XxModel })
defineExpose({ open })
</script>

<template>
  <smart-form title="XX信息" :config :server="handleSubmit" />
</template>
```

要点：

- **不声明 emits、不手动转发 close/refresh**：监听器经 attrs 自动透传（包装层把 attrs 展开到内部弹窗组件，close 由弹窗组件抛出、refresh/success 由底层 form-dialog 抛出）。
- `rules` 是逗号分隔字符串，映射为表单项组件的同名校验 prop（required / integer / phone / maxLength=30 等）；校验规则与接口文档的必填、长度对齐。
- `comp` 支持 'input' / 'select' / 'radio'；字典选项从 `const/` 引入。
- 保存成功后底层 form-dialog 自动提示并关闭。
- 若 http 封装失败时返回 null 而非抛错，server 内必须对 falsy 结果抛错——这是「请求失败被当成保存成功」的防线。

### Step 6 · 列表页（views/<module>/Index.vue）

骨架 = headless 列表 hook（如 useList：query / page_query / table_data / loading / search / getData）+ 配置化列表组件（搜索区/按钮/表格/分页布局）+ 配置化查询 + 配置化表格：

```js
const { query, page_query, table_data, loading, search, getData } = useList({
  query: { name: '', status: '' },
  server: params => withPage(api.xx.list, params),
})
```

要点：

- **server 一律走 `withPage(接口函数, params)`** 这类分页适配函数：入参方向做 `page/limit → 后端分页字段` 映射，出参方向把 `{rows,total}` / `{data}` 双结构规整为 `{ count, data }`。适配只此一处，不要在页面里手写取数和字段适配。
- 后端不分页的接口（如树形全量列表）在列表组件上加 `no-page`；分页接口接 `@update-page` / `@update-size` 回写 `page_query`。
- **表格列不配置 width / minWidth**，交给表格自适应宽度。
- 状态类枚举列用作用域插槽 + 标签组件 + 按值取标签；操作列用现成的编辑/删除按钮组件（删除自带二次确认）。
- 打开弹窗（**弹窗宿主不转发业务事件，refresh 必须显式接线**）：

  ```js
  function openForm(row) {
    openDialog(EditDialog, { props: { onRefresh: getData }, params: row })
  }
  ```

- 删除成功后提示 + `getData()` 刷新。
- `script setup` 顶部 `defineOptions({ name: 'MuXxIndex' })` 声明组件名；模板属性单行书写（开标签全部属性同一行）。

### Step 7 · 路由菜单

在路由配置的对应分组下加条目（title / icon / 懒加载组件）；图标用 unplugin-icons 写法（`~icons/<collection>/<name>`，先在图标数据包里确认存在）。

### Step 8 · 验证与文档（缺一不可）

1. 对**本次全部改动文件**跑 eslint，0 报错（含 .md——文档代码块也会被检查，示例函数加 `// eslint-disable-next-line no-unused-vars -- 文档示例`）。
2. 构建通过（pnpm build 或项目对应脚本）。
3. 文档同步（若项目约束要求）：新建页面文档（基本信息 / 页面结构 / 数据逻辑 / 接口声明 / 弹窗 / 注意事项），登记文档索引；改动了公共组件则同步组件文档。

## 已踩过的坑（务必避免）

- ❌ **同名绑定遮蔽自动导入**：hook 解构出的变量名若与自动导入组件的 kebab-case 同名，模板会优先匹配本地绑定，页面白屏报 `Invalid vnode type`。
- ❌ **弹窗组件声明 emits 再手动转发**：多余且容易漏；让 attrs 透传。
- ❌ **openDialog 之后忘记接 onRefresh**：保存成功列表不刷新，且控制台无任何报错，极难排查。
- ❌ **server 抛错约定缺失**：http 失败返回 null 时，form-dialog 只看是否抛错，漏了就「失败也提示保存成功」。
- ❌ **`||` 处理合法 0 值字段**（排序、数量类），用 `??`。
- ❌ **表格列配 width/minWidth**、**页面里重复定义字典**：均已约定禁止。
- ❌ **在接口聚合入口里 import http 层**：类型生成器在 node 子进程 import 它会崩。
- ❌ **手改生成文件**（类型声明 .d.ts、由别名配置同步生成的 jsconfig.json 等）。

## 收尾报告

向用户输出：新增/修改的文件清单（带路径）、接口声明与真实接口的对应关系、表单校验与后端必填字段的对应关系、与既有模块实现的有意差异点（如有）。
