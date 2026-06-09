<script setup>
import { inject } from 'vue'
import ClarityAddLine from '~icons/clarity/add-line?width=18px&height=18px'
import ButtonComp from '../button/Index.vue'

defineProps({
  icon: {
    type: [Boolean, undefined],
    default: undefined,
  },
  text: {
    type: String,
    default: '添加',
  },
})

const { buttonIcon } = inject('GLOBAL_CUSTOM_CONFIG', { buttonIcon: true })
</script>

<template>
  <button-comp type="danger" :icon="ClarityAddLine" :show-icon="icon !== undefined ? icon : buttonIcon" :text="$slots.default ? '' : text">
    <slot />
  </button-comp>
</template>
