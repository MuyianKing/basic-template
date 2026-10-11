# MuSmartForm

- 源码：`app/src/components/smartui/smart-form/Index.vue`（组件）+ `index.js`（useSmartForm / openDialog / MuDialogHost）
- 引入：`import { useSmartForm } from '@comp/smartui'`；`MuSmartForm` 也可直接用（`<mu-smart-form>`）

配置化表单弹窗，基于 `@muyianking/ui` 的 `mu-form-dialog`（自带校验、提交按钮）+ `mu-form-item` 封装。推荐用法是 `useSmartForm` 组合式函数（示例见 `app/src/views/system/dept/components/EditDialog.vue`：弹窗组件内部用 useSmartForm，页面经 openDialog 打开）。

## useSmartForm（推荐用法）

```js
// eslint-disable-next-line no-unused-vars -- 文档示例
const { SmartForm, open: openForm, form } = useSmartForm({ Model: DeptModel })
```

- `SmartForm`：弹窗组件，直接写进页面模板（attrs 与插槽透传给内部 MuSmartForm）
- `open(model)`：编辑传行数据，新增不传参；传了 `Model` 时先 `new Model(model)` 规整字段与默认值，再打开
- `form`：表单状态的响应式引用（弹窗外也能读写）
- `Model`：表单模型类（放 `app/src/model/<域>.js`），构造函数负责字段挑选与默认值，是行数据到表单状态的唯一映射处

```html
<mu-smart-list ... @add="openForm">
  ...
  <mu-edit-button @click="openForm(row)" />
</mu-smart-list>
<SmartForm title="部门信息" :config="formConfig" :server="handleSubmit" @refresh="getData" />
```

## Props

| 名称    | 类型     | 默认值 | 说明                                                                                               |
| ------- | -------- | ------ | -------------------------------------------------------------------------------------------------- |
| title   | String   | 编辑   | 弹窗标题                                                                                           |
| config  | Array    | []     | 表单项配置：`{ label, prop, rules, comp, compProps, props, customRules, show }`                    |
| server  | Function | null   | 保存接口；传入后提交时自动校验并调用，成功后提示「保存成功」并关闭弹窗，失败（抛错）时保持弹窗打开 |
| formRef | Object   | null   | 外部注入的表单状态引用（useSmartForm 内部用它接管 form），一般不手传                               |

`rules` 为逗号分隔字符串，映射为 `mu-form-item` 的同名 prop（`required` / `integer` / `phone` / `maxLength=30` 等），如 `'required,integer,maxLength=2'`。

`comp` 支持 `'input'` / `'select'` / `'radio'`（默认 `input`），也可直接传组件；`compProps` 透传给该组件。

## 插槽

- `#<prop>`：自定义某个表单项的渲染，作用域 `{ form, row }`
- `#<prop>Custom`：整项自定义（连 mu-form-item 一起替换），作用域 `{ form, row }`
- `#footer`：弹窗底部，作用域 `{ form }`（未传 `server` 且需自定义提交时使用）

## 事件

| 名称              | 说明                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| close             | 弹窗关闭（经 mu-form-dialog 的 close 透传）                                             |
| refresh / success | 未在组件内声明，监听器自动透传到内部的 mu-form-dialog（保存成功后触发），可用于刷新列表 |

## openDialog 与 MuDialogHost

非表单类弹窗仍可用 `openDialog(dialogComp, { props, params })`——已改为队列式：压入 `shallowReactive` 队列，由 `MuDialogHost` 统一渲染，不再手工 createApp/unmount。**前提：布局已挂载 `<MuDialogHost />`（app/src/layout/Main.vue）**，否则压入的弹窗不会出现。弹窗组件仍需 `defineExpose({ open })` 接收 `params`，关闭事件经 `@close` 由宿主移出队列。

## server 提交约定

`@muyianking/ui` 的 http 封装（`app/src/utils/request.class.js`）在请求失败时不抛错而是返回 `null`，而 `mu-form-dialog` 只依据 server 是否抛错判断成败。因此 server 内部需在结果为 falsy 时抛错，否则请求失败也会被当成保存成功：

```js
// eslint-disable-next-line no-unused-vars -- 文档示例，实际在模板上经 :server 引用
async function handleSubmit(model) {
  const result = model.deptId ? await api.dept.save(model) : await api.dept.add(model)
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 模板上：<SmartForm :config="formConfig" :server="handleSubmit" @refresh="getData" />
```
