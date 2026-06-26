<script setup>
import CustomDatePicker from './DatePicker.vue'
import CustomSelect from './Select.vue'

const TOTAL = 5000
const options = markRaw([])

for (let i = 0; i < 500; i++) {
  options.push({
    label: `测试${i}`,
    value: i,
  })
}

const labelOf = v => options.find(o => o.value === v)?.label ?? ''

function fmtDate(v) {
  if (!v)
    return ''
  const d = new Date(v)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const values = ref(Array.from({ length: TOTAL }).fill(''))
const dates = ref(Array.from({ length: TOTAL }).fill(''))
const activeIndex = ref(null)
const selectRef = ref()
const datePickerRef = ref()

function openSelect(i, ev) {
  activeIndex.value = i
  selectRef.value?.open(ev.currentTarget, values.value[i])
}

function openDatePicker(i, ev) {
  activeIndex.value = i
  datePickerRef.value?.open(ev.currentTarget, dates.value[i])
}

function onPickSelect(val) {
  if (activeIndex.value != null)
    values.value[activeIndex.value] = val
}

function onPickDate(val) {
  if (activeIndex.value != null)
    dates.value[activeIndex.value] = val
}

function onClose() {
  activeIndex.value = null
}
</script>

<template>
  <div class="flex flex-wrap overflow-y-auto h-full">
    <div v-for="(v, i) in values" :key="i" class="m-4 flex items-center gap-2">
      <div class="flex items-center w-[200px] h-[32px] border rounded cursor-pointer px-2" @click="openSelect(i, $event)">
        <span :class="v === '' ? 'text-gray-400' : ''">{{ labelOf(v) || '请选择' }}</span>
      </div>
      <div class="flex items-center w-[200px] h-[32px] border rounded cursor-pointer px-2" @click="openDatePicker(i, $event)">
        <span :class="dates[i] === '' ? 'text-gray-400' : ''">{{ fmtDate(dates[i]) || '选择日期' }}</span>
      </div>
    </div>
    <custom-select ref="selectRef" :options="options" @pick="onPickSelect" @close="onClose" />
    <custom-date-picker ref="datePickerRef" @pick="onPickDate" @close="onClose" />
  </div>
</template>

<style lang='scss' scoped></style>
