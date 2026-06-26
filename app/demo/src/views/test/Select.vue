<script setup>
import SingletonField from './SingletonField.vue'

const props = defineProps({
  options: {
    type: Array,
    default() {
      return []
    },
  },
})

const emit = defineEmits(['pick', 'close'])

const baseRef = ref()
const selectRef = ref()

function open(targetEl, currentValue) {
  baseRef.value?.open(targetEl, currentValue, () => selectRef.value?.focus())
}

defineExpose({ open })
</script>

<template>
  <singleton-field ref="baseRef" @pick="v => emit('pick', v)" @close="() => emit('close')">
    <template #default="{ value, onChange, onVisibleChange }">
      <el-select ref="selectRef"
                 :model-value="value"
                 :options="props.options"
                 filterable
                 automatic-dropdown
                 @change="onChange"
                 @visible-change="onVisibleChange"
      />
    </template>
  </singleton-field>
</template>

<style lang='scss' scoped></style>
