<script setup>
import ArrowDown from '~icons/ep/arrow-down'
import SingletonField from './SingletonField.vue'

const props = defineProps({
  field: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number, Boolean, Array],
    default: '',
  },
  options: {
    type: Array,
    default() {
      return []
    },
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
})

const emit = defineEmits(['update:modelValue'])

const selectRef = useTemplateRef('select')

const labelOf = v => props.options.find(o => o.value === v)?.label ?? ''
</script>

<template>
  <singleton-field :model-value="modelValue" :field="field" :placeholder="placeholder" :display-value="labelOf(modelValue)" :open-method="() => selectRef?.focus()" @update:model-value="emit('update:modelValue', $event)">
    <template #trigger="{ displayValue, placeholder }">
      <span :class="(modelValue === '' || modelValue == null) ? 'text-gray-400 flex-1' : 'flex-1'">
        {{ displayValue || placeholder }}
      </span>
      <el-icon class="text-gray-400">
        <arrow-down />
      </el-icon>
    </template>
    <template #default="{ value, onChange, onVisibleChange }">
      <el-select ref="select" :model-value="value" :options="options" filterable automatic-dropdown @change="onChange" @visible-change="onVisibleChange" />
    </template>
  </singleton-field>
</template>

<style lang='scss' scoped></style>
