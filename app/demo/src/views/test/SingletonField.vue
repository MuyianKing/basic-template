<script setup>
const props = defineProps({
  field: { type: String, required: true },
  modelValue: { type: [String, Number, Boolean, Array, Date], default: '' },
  placeholder: { type: String, default: '请选择' },
  displayValue: { type: String, default: '' },
  openMethod: { type: Function, default: null },
})

const emit = defineEmits(['update:modelValue'])

const GLOBAL_KEY = 'GLOBAL_SINGLE_MAP'
window[GLOBAL_KEY] = window[GLOBAL_KEY] || new Map()
const sharedMap = window[GLOBAL_KEY]

let state = sharedMap.get(props.field)
const isHost = !state?.mounted
if (isHost) {
  state = { mounted: true, open: null, openMethod: null }
  sharedMap.set(props.field, state)
}

const triggerRef = useTemplateRef('trigger')
const visible = ref(false)
const value = ref('')
const pos = ref({ top: 0, left: 0, width: 200 })

let currentPick = null

function open(targetEl, currentValue, onOpenReady, onPick) {
  const rect = targetEl.getBoundingClientRect()
  pos.value = { top: rect.top, left: rect.left, width: rect.width }
  value.value = currentValue
  visible.value = true
  currentPick = onPick
  nextTick(() => onOpenReady?.())
}

function onChange(val) {
  currentPick?.(val)
}

function onVisibleChange(val) {
  if (!val)
    visible.value = false
}

function onClick() {
  state.open?.(
    triggerRef.value,
    props.modelValue,
    () => requestAnimationFrame(() => state.openMethod?.()),
    val => emit('update:modelValue', val),
  )
}

if (isHost) {
  watchEffect(() => {
    state.open = (el, val, onOpen, onPick) => open(el, val, onOpen, onPick)
  })
  watchEffect(() => {
    state.openMethod = props.openMethod
  })
}

const layerStyle = computed(() => ({
  top: `${pos.value.top}px`,
  left: `${pos.value.left}px`,
  width: `${pos.value.width}px`,
  opacity: visible.value ? 1 : 0,
  pointerEvents: visible.value ? 'auto' : 'none',
  transform: visible.value ? 'none' : 'translateX(-9999px)',
}))

onBeforeUnmount(() => {
  if (isHost)
    sharedMap.delete(props.field)
})
</script>

<template>
  <div ref="trigger" class="singleton-trigger" @click="onClick">
    <slot name="trigger" :display-value="displayValue" :placeholder="placeholder">
      <span :class="(modelValue === '' || modelValue == null) ? 'text-gray-400' : ''">
        {{ displayValue || placeholder }}
      </span>
    </slot>
  </div>

  <teleport v-if="isHost" to="body">
    <div class="singleton-layer" :style="layerStyle">
      <slot :value="value" :on-change="onChange" :on-visible-change="onVisibleChange" />
    </div>
  </teleport>
</template>

<style scoped>
.singleton-trigger {
  display: flex;
  align-items: center;
  width: 200px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.singleton-layer {
  position: fixed;
  z-index: 50;
}
</style>
