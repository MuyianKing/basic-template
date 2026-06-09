<script setup>
import { MuFormItem, MuInput, MuSelect } from '@mu/ui'
import './index.css'

const props = defineProps({
  config: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const COMP_MAP = {
  MuInput,
  MuSelect,
}

function getComp(type) {
  return markRaw(COMP_MAP[type] || MuInput)
}

const config = computed(() => {
  return props.config.map((item) => {
    return {
      ...item,
      comp: getComp(item.comp),
    }
  })
})

function handleUpdate(prop, value) {
  emit('update:modelValue', { ...props.modelValue, [prop]: value })
}
</script>

<template>
  <template v-for="item in config" :key="item.prop">
    <mu-form-item class="smart-query-form-item" :label="item.label">
      <slot :name="item.prop">
        <component :is="item.comp" :model-value="modelValue[item.prop]" v-bind="item.props" @update:model-value="value => handleUpdate(item.prop, value)" />
      </slot>
    </mu-form-item>
  </template>
</template>
