# MuSmartSelect

- 源码：`app/src/components/smartui/smart-select/Index.vue`（组件）+ `index.js`（导出 MuSmartSelect）
- 引入：`import { MuSmartSelect } from '@comp/smartui'`（模板 `<mu-smart-select>`）

统一选择组件，通过 `type` 切换底层渲染组件（`mu-select` / `mu-radio` / `mu-checkbox`），三种类型共用同一套 `options`（`{ label, value }`）数据结构，无需在三种控件间重复维护选项。

## Props

| 名称    | 类型   | 默认值 | 说明                                                                        |
| ------- | ------ | ------ | --------------------------------------------------------------------------- |
| type    | String | select | 渲染类型：`select` 下拉单选、`radio` 单选按钮组、`checkbox` 多选按钮组      |
| options | Array  | []     | 选项列表 `{ label, value }`；type 为 select 时支持 `children` 分组选项      |
| v-model | any    | —      | 数据类型随 type：`select` / `radio` 为标量，`checkbox` 为数组（见下方约定） |

## 属性透传

组件未声明的属性与事件全部透传给底层组件，即三种类型分别继承 `mu-select` / `mu-radio` / `mu-checkbox` 的全部 props 与事件：

- `type="select"`：`clearable`、`all`（全部选项）、`filterable`、`disabledOptions`、`loading` 等
- `type="radio"`：`empty`（再次点击取消选中）、`line`（横向排列）等
- `type="checkbox"`：`multiple`、`line` 等

通用：`disabled`、`readonly`、`placeholder`，以及 `@change` 等事件。

## v-model 数据类型约定

- `select` / `radio`：标量（String / Number / Boolean），单值。
- `checkbox`：数组；传入 `null` / `undefined` 时组件内部规整为 `[]`，传入逗号分隔字符串（如 `'1,2'`）时由 `mu-checkbox` 规整为数组，更新后始终以数组回写。

```html
<template>
  <!-- 下拉单选 -->
  <mu-smart-select v-model="form.status" :options="statusOptions" />
  <!-- 单选按钮组，横向排列 -->
  <mu-smart-select v-model="form.type" type="radio" line :options="typeOptions" />
  <!-- 多选按钮组，v-model 为数组 -->
  <mu-smart-select v-model="form.roles" type="checkbox" line :options="roleOptions" />
</template>
```

在 `smart-form` 的 `config` 中使用时，经 `compProps` 传入 `type` 与 `options`：

```js
// eslint-disable-next-line no-unused-vars -- 文档示例
const formConfig = [
  {
    label: '状态',
    prop: 'status',
    comp: 'smartSelect',
    compProps: { type: 'radio', line: true, options: statusOptions },
  },
]
```

> 注意：smart-form 的 `COMP_MAP` 目前未登记 `smartSelect`，如需在配置化表单中以 `comp: 'smartSelect'` 使用，先在 `app/src/components/smartui/smart-form/Index.vue` 的 `COMP_MAP` 中登记，或直接用 `#<prop>` 插槽自定义渲染。
