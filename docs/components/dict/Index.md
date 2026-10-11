# MuDictSelect（字典选择器）

## 基本信息

- 源码：`app/src/components/dict/Index.vue`
- 引用方式：`import DictSelect from '@comp/dict/Index.vue'`（@comp 指向 app/src/components/，@comp/smartui 之外的普通业务组件按路径显式引入）
- 底层组件：`@comp/smartui` 的 `MuSmartSelect`（type 切换 mu-select / mu-radio / mu-checkbox）

## 组件设计

- 业务数据自包含：传入 `dictType` 后组件内部调用 `getDictOptions(dictType)`（`app/src/server/dict.js`）拉取字典数据并转为 `{ label, value }` 选项，模板中只写 `<dict-select v-model="xxx" dict-type="sys_normal_disable" />` 即可使用
- 选项缓存：`getDictOptions` 进程内缓存同一 `dictType` 的选项（Promise 级），多个组件共用同一字典只发一次请求；请求失败不缓存、下次重试并返回 `[]`；字典数据变更后可调用 `clearDictOptions()` 清空缓存
- 选项过滤：只保留正常状态（`status === '0'`）的字典项，映射 `dictLabel` → `label`、`dictValue` → `value`
- `dictType` 变化时自动重新拉取选项
- `inheritAttrs: false` + `v-bind="$attrs"`：组件只声明 `dictType`，其余属性、事件全部透传给 MuSmartSelect——`type`（select / radio / checkbox）、`clearable`、`all`、`line`、`empty`、`disabled` 等均可从外部传入；默认配置写在 `v-bind="$attrs"` 之前，外部同名属性可覆盖（`options` / `loading` 为组件内部状态，外部覆盖无效）

## Props

| 属性     | 类型                              | 默认值    | 说明                                                              |
| -------- | --------------------------------- | --------- | ----------------------------------------------------------------- |
| dictType | String                            | —（必填） | 字典类型 key，如 `sys_normal_disable`                             |
| v-model  | String / Number / Boolean / Array | —         | 选中值，数据类型随 `type`：select / radio 为标量，checkbox 为数组 |

## 用法示例

```vue
<script setup>
import DictSelect from '@comp/dict/Index.vue'
</script>

<template>
  <!-- 下拉单选 -->
  <DictSelect v-model="form.status" dict-type="sys_normal_disable" class="w-full" />

  <!-- 单选按钮组，横向排列（透传 MuSmartSelect 的 type / line） -->
  <DictSelect v-model="form.status" dict-type="sys_normal_disable" type="radio" line />

  <!-- 多选按钮组，v-model 为数组（如 '1,2' 逗号串由 MuCheckbox 规整） -->
  <DictSelect v-model="form.postIds" dict-type="sys_post_type" type="checkbox" line />

  <!-- 查询区：追加「全部」选项（透传 mu-select 的 all） -->
  <DictSelect v-model="query.status" dict-type="sys_normal_disable" all class="w-full" />
</template>
```

## 数据逻辑

- 接口为 `GET /system/dict/data/type/{dictType}`（AjaxResult{data: SysDictData[]}），声明在 `app/src/api/dictData.js`（`api.dictData.listByType({ dictType })`），路径与参数以 `docs/api-docs.json` 为准
- 字典管理页面见 `app/src/views/dict/`（文档 `docs/views/dict/Index.md`）
