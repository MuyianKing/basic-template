<script setup>
import { useSmartForm } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api } from '@http'
import DictTypeModel from '@model/dictType'

defineOptions({
  name: 'MuDictTypeEditDialog',
})

const config = [
  {
    label: '字典名称',
    prop: 'dictName',
    rules: 'required,maxLength=100',
  },
  {
    label: '字典类型',
    prop: 'dictType',
    rules: 'required,maxLength=100',
  },
  {
    label: '状态',
    prop: 'status',
    comp: 'radio',
    compProps: {
      options: STATUS_OPTIONS,
    },
  },
]

/**
 * 保存字典类型：有 dictId 为修改，否则新增
 * @param {*} model 表单数据（经 DictTypeModel 规整）
 */
async function handleSubmit(model) {
  const result = model.dictId ? await api.dictType.save(model) : await api.dictType.add(model)
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 表单弹窗：字段规整与默认值在 DictTypeModel，行数据直接打开
const { SmartForm, open } = useSmartForm({ Model: DictTypeModel })

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出 -->
  <smart-form title="字典类型" :config :server="handleSubmit" />
</template>

<style scoped></style>
