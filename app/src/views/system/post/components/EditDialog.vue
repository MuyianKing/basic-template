<script setup>
import { useSmartForm } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api } from '@http'
import PostModel from '@model/post'

defineOptions({
  name: 'MuPostEditDialog',
})

const config = [
  {
    label: '岗位编码',
    prop: 'postCode',
    rules: 'required,maxLength=64',
  },
  {
    label: '岗位名称',
    prop: 'postName',
    rules: 'required,maxLength=50',
  },
  {
    label: '岗位排序',
    prop: 'postSort',
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
 * 保存岗位：有 postId 为修改，否则新增
 * @param {*} model 表单数据（经 PostModel 规整）
 */
async function handleSubmit(model) {
  const result = model.postId ? await api.post.save(model) : await api.post.add(model)
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 表单弹窗：字段规整与默认值在 PostModel，行数据直接打开
const { SmartForm, open } = useSmartForm({ Model: PostModel })

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出 -->
  <smart-form title="岗位信息" :config :server="handleSubmit" />
</template>

<style scoped></style>
