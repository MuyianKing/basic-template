<script setup>
const emit = defineEmits(['pick', 'close'])

const visible = ref(false)
const value = ref('')
const pos = ref({ top: 0, left: 0, width: 200 })

function open(targetEl, currentValue, onOpenReady) {
  const rect = targetEl.getBoundingClientRect()
  pos.value = { top: rect.top, left: rect.left, width: rect.width }
  value.value = currentValue
  visible.value = true
  nextTick(() => onOpenReady?.())
}

function onChange(val) {
  value.value = val ?? value.value
  emit('pick', value.value)
}

function onVisibleChange(v) {
  if (!v) {
    visible.value = false
    emit('close')
  }
}

defineExpose({ open })
</script>

<template>
  <div class="fixed z-50"
       :style="{
         top: `${pos.top}px`,
         left: `${pos.left}px`,
         width: `${pos.width}px`,
         opacity: visible ? 1 : 0,
         pointerEvents: visible ? 'auto' : 'none',
       }"
  >
    <slot :value="value" :on-change="onChange" :on-visible-change="onVisibleChange" />
  </div>
</template>

<style lang='scss' scoped></style>
