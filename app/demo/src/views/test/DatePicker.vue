<script setup>
import SingletonField from './SingletonField.vue'

defineProps({
  field: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number, Date, Array],
    default: '',
  },
  placeholder: {
    type: String,
    default: '选择日期',
  },
})

const emit = defineEmits(['update:modelValue'])

const pickerRef = useTemplateRef('picker')

function fmtDate(v) {
  if (!v)
    return ''
  const d = new Date(v)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
</script>

<template>
  <singleton-field :model-value="modelValue" :field="field" :placeholder="placeholder" :display-value="fmtDate(modelValue)" :open-method="() => pickerRef?.handleOpen()" @update:model-value="emit('update:modelValue', $event)">
    <template #default="{ value, onChange, onVisibleChange }">
      <el-date-picker ref="picker" :model-value="value" type="date" @change="onChange" @visible-change="onVisibleChange" />
    </template>
  </singleton-field>
</template>

<style lang='scss' scoped></style>
