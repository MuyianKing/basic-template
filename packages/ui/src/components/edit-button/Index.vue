<script setup>
import { inject } from 'vue'
import UilEdit from '~icons/uil/edit'
import useButton from '../../hooks/useButton'
import ButtonComp from '../button/Index.vue'

const props = defineProps({
  icon: {
    type: Object,
    default: () => {
      return markRaw(UilEdit)
    },
  },
  text: {
    type: [Boolean, String, undefined],
    default: undefined,
  },
})

const emits = defineEmits(['click'])

const { tableIcon } = inject('GLOBAL_CUSTOM_CONFIG', { tableIcon: 'icon' })

const { _text, buttonType } = useButton(props, '编辑', tableIcon)
</script>

<template>
  <button-comp :button-type type="primary" :icon :text="_text" @click="emits('click')">
    <slot />
  </button-comp>
</template>
