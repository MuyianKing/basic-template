<script setup>
/**
 * 列表页布局组件，配合 @muyianking/hooks 的 useList（headless）使用：
 * 搜索区域 + 搜索/添加按钮 + 表格 + 分页，替代旧版 hooks 返回的 MuListPage 渲染组件。
 * 示例见 app/src/views/form/Index.vue。
 */
defineOptions({
  name: 'MuSmartList',
})

defineProps({
  // 加载状态
  loading: {
    type: Boolean,
    default: false,
  },
  // 分页参数{page,limit}，即 useList 返回的 page_query
  pageQuery: {
    type: Object,
    default: () => ({}),
  },
  // 列表数据{data,count}，即 useList 返回的 table_data
  tableData: {
    type: Object,
    default: () => ({}),
  },
  // 隐藏添加按钮
  noAdd: {
    type: Boolean,
    default: false,
  },
  // 隐藏搜索按钮
  noSearch: {
    type: Boolean,
    default: false,
  },
  // 隐藏搜索区域
  noSearchArea: {
    type: Boolean,
    default: false,
  },
  // 按钮区是否固定
  fixedButton: {
    type: Boolean,
    default: false,
  },
  // 是否不渲染分页
  noPage: {
    type: Boolean,
    default: false,
  },
  // 分页配置，sizes 开启每页条数选择
  pageConfig: {
    type: Object,
    default: null,
  },
  // 高级搜索按钮文案，配合 #advanced 插槽使用
  advancedText: {
    type: String,
    default: '高级搜索',
  },
})

defineEmits(['search', 'add', 'updatePage', 'updateSize', 'getData'])
</script>

<template>
  <mu-search-page class="mu-list-page" :loading="loading" :fixed-button="fixedButton" :advanced-text="$slots.advanced ? advancedText : ''" :no-search="noSearchArea">
    <template #header>
      <slot name="search" />
    </template>

    <template v-if="$slots.advanced" #advanced>
      <slot name="advanced" />
    </template>

    <template #button>
      <mu-search-button v-if="!noSearch" @click="$emit('search')" />
      <mu-add-button v-if="!noAdd" @click="$emit('add', null)" />
      <slot name="button" />
    </template>

    <template #table>
      <slot name="table" />
    </template>

    <template #default>
      <mu-page v-if="!noPage" :model-value="pageQuery.page" :size="pageQuery.limit" :sizes="pageConfig?.sizes" :count="tableData.count || 0" @update:model-value="$emit('updatePage', $event)" @update:size="$emit('updateSize', $event)" @change="$emit('getData')" />
      <slot />
    </template>
  </mu-search-page>
</template>

<style scoped></style>
