<script setup>
import DeptTreeSelect from '@comp/dept/Index.vue'
import { useSmartForm } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api } from '@http'
import UserModel from '@model/user'

defineOptions({
  name: 'MuUserEditDialog',
})

const config = [
  {
    label: '所属部门',
    prop: 'deptId',
    rules: 'required',
  },
  {
    label: '用户名称',
    prop: 'userName',
    rules: 'required,maxLength=30',
  },
  {
    label: '用户昵称',
    prop: 'nickName',
    rules: 'required,maxLength=30',
  },
  {
    label: '手机号',
    prop: 'phonenumber',
    rules: 'phone',
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
 * 保存用户：有 userId 为修改，否则新增（新增未填密码时使用默认密码 123456）
 * @param {*} model 表单数据（经 UserModel 规整）
 */
async function handleSubmit(model) {
  if (!model.userId) {
    model.password = '123456'
  }
  const result = model.userId ? await api.user.save(model) : await api.user.add(model)
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 表单弹窗：字段规整与默认值在 UserModel，行数据直接打开
const { SmartForm, open } = useSmartForm({ Model: UserModel })

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出 -->
  <smart-form title="用户信息" :config :server="handleSubmit">
    <!-- 部门用部门树选择器 -->
    <template #deptId="{ form }">
      <dept-tree-select v-model="form.deptId" class="w-full" />
    </template>
  </smart-form>
</template>

<style scoped></style>
