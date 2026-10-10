<script setup>
import SeparatorIcon from '~icons/bitcoin-icons/caret-right-outline'

const route = useRoute()

// 路由匹配链中带 title 的层级；菜单分组（无页面组件）仅展示不可点击
const breadcrumbList = computed(() => route.matched.filter(item => item.meta?.title))

function hasPage(item) {
  return Object.keys(item.components || {}).length > 0
}
</script>

<template>
  <div class="breadcrumb">
    <el-breadcrumb :separator-icon="SeparatorIcon">
      <el-breadcrumb-item v-for="item in breadcrumbList"
                          :key="item.path"
                          :to="hasPage(item) ? { path: item.path } : undefined"
      >
        {{ item.meta.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
