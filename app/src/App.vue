<script setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const appStore = useAppStore()
appStore.initTheme()
</script>

<template>
  <mu-config-provider :locale="zhCn">
    <router-view />
  </mu-config-provider>
</template>

<style></style>
