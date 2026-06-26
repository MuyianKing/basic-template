<script setup>
import SingletonField from './SingletonField.vue'

const emit = defineEmits(['pick', 'close'])

const baseRef = ref()
const pickerRef = ref()

function open(targetEl, currentValue) {
  baseRef.value?.open(targetEl, currentValue, () => pickerRef.value?.handleOpen())
}

defineExpose({ open })
</script>

<template>
  <singleton-field ref="baseRef" @pick="v => emit('pick', v)" @close="() => emit('close')">
    <template #default="{ value, onChange, onVisibleChange }">
      <el-date-picker ref="pickerRef"
                      :model-value="value"
                      type="date"
                      @change="onChange"
                      @visible-change="onVisibleChange"
      />
    </template>
  </singleton-field>
</template>

<style lang='scss' scoped></style>
