<script setup>
import { uploadFile } from '@server/file'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const appStore = useAppStore()
appStore.initTheme()

// 注入全局上传配置：mu-upload / mu-file 经 GLOBAL_CUSTOM_CONFIG 取 uploadFile 完成上传
const customConfig = { uploadFile }
</script>

<template>
  <mu-config-provider :locale="zhCn" :custom-config="customConfig">
    <router-view />
  </mu-config-provider>
</template>

<style></style>
