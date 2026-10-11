<script setup>
import { useSmartForm } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api } from '@http'
import DictDataModel from '@model/dictData'

defineOptions({
  name: 'MuDictDataEditDialog',
})

// dictType 由左侧选中的字典类型预置（新增时经 params 传入），不在表单中展示
const config = [
  {
    label: '字典标签',
    prop: 'dictLabel',
    rules: 'required,maxLength=100',
  },
  {
    label: '字典键值',
    prop: 'dictValue',
    rules: 'required,maxLength=100',
  },
  {
    label: '显示排序',
    prop: 'dictSort',
    rules: 'required,integer',
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
 * 保存字典数据：有 dictCode 为修改，否则新增
 * @param {*} model 表单数据（经 DictDataModel 规整）
 */
async function handleSubmit(model) {
  const result = model.dictCode ? await api.dictData.save(model) : await api.dictData.add(model)
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 表单弹窗：字段规整与默认值在 DictDataModel，行数据直接打开
const { SmartForm, open } = useSmartForm({ Model: DictDataModel })

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出 -->
  <smart-form title="字典数据" :config :server="handleSubmit" />
</template>

<style scoped></style>
