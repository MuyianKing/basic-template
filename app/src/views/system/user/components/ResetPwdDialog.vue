<script setup>
import { useSmartForm } from '@comp/smartui'
import { api } from '@http'

defineOptions({
  name: 'MuUserResetPwdDialog',
})

const config = [
  {
    label: '新密码',
    prop: 'password',
    rules: 'required,maxLength=30',
    compProps: {
      showPassword: true,
    },
  },
]

/**
 * 重置密码：只提交 userId 与新密码
 * @param {*} model 表单数据
 */
async function handleSubmit(model) {
  const result = await api.user.resetPwd({ userId: model.userId, password: model.password })
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('重置失败')
  }
  return result
}

const { SmartForm, open } = useSmartForm()

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出 -->
  <smart-form title="重置密码" :config :server="handleSubmit" />
</template>

<style scoped></style>
