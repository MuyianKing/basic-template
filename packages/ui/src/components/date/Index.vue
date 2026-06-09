<script setup>
import DateComp from './components/Date.vue'
import DateElRange from './components/DateElRange.vue'
import DateRange from './components/DateRange.vue'

defineProps({
  // date - 单个时间选择；range - 时间范围选择，渲染两个独立的时间组件；el-range - element-plus自己级联的时间范围选择
  type: {
    type: String,
    default: 'date',
  },
  dateType: {
    type: String,
    default: 'date',
  },
})
</script>

<template>
  <date-comp v-if="type === 'date'" :type="dateType" v-bind="$attrs" />
  <date-el-range v-else-if="type === 'el-range'" :type="dateType" v-bind="$attrs" />
  <date-range v-else :type="dateType" v-bind="$attrs" />
</template>
