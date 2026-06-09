<script setup>
import { getCanUseValue } from '@muyianKing/utils'
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: '18px',
  },
  color: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '',
  },
  icon: {
    type: Object,
    required: true,
  },
})

const _style = computed(() => {
  return {
    'font-size': getCanUseValue(props.size),
    'color': props.color || (props.type ? `var(--el-color-${props.type})` : ''),
  }
})
</script>

<template>
  <component :is="icon" class="mu-icon" aria-hidden="false" :style="_style" />
</template>
