<script setup>
import { ElDatePicker } from 'element-plus'

import { computed } from 'vue'
import Calendar from '~icons/ep/calendar'
import SingletonField from './SingletonField.vue'

const props = defineProps({
  field: { type: String, required: true },
  modelValue: { type: [String, Number, Date], default: '' },
  type: { type: String, default: 'date' },
  placeholder: { type: String, default: '请选择时间' },
  valueFormat: { type: String, default: '' },
  format: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const dateRef = useTemplateRef('date')

const format_comp = computed(() => {
  if (props.format)
    return props.format
  return props.type === 'datetime' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
})

const value_format_comp = computed(() => {
  if (props.valueFormat)
    return props.valueFormat
  return format_comp.value
})

const displayValue = computed(() => {
  if (props.modelValue === '' || props.modelValue == null)
    return ''
  return props.modelValue
})

function openMethod() {
  dateRef.value?.handleOpen?.()
}
</script>

<template>
  <singleton-field :model-value="modelValue" :field="field" :placeholder="placeholder" :display-value="displayValue" :open-method="openMethod" @update:model-value="emit('update:modelValue', $event)">
    <template #trigger="{ placeholder: ph }">
      <span :class="(modelValue === '' || modelValue == null) ? 'text-gray-400 flex-1' : 'flex-1'">
        {{ displayValue || ph }}
      </span>
      <el-icon class="text-gray-400">
        <calendar />
      </el-icon>
    </template>

    <template #default="{ value, onChange, onVisibleChange }">
      <el-date-picker ref="date" :model-value="value" :type="type" :value-format="value_format_comp" :format="format_comp" :placeholder="placeholder" @update:model-value="onChange" @visible-change="onVisibleChange" />
    </template>
  </singleton-field>
</template>
