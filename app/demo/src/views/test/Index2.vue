<script setup>
const TOTAL = 50
const options = markRaw([])

for (let i = 0; i < 50; i++) {
  options.push({
    label: `测试${i}`,
    value: i,
  })
}

const values = ref(Array.from({ length: TOTAL }).fill(''))
const dates = ref(Array.from({ length: TOTAL }).fill(''))
</script>

<template>
  <div class="flex flex-wrap overflow-y-auto h-full">
    <div v-for="(v, i) in values" :key="i" class="m-4 flex items-center gap-2">
      <el-select v-model="values[i]" :options="options" />
      <el-date-picker v-model="dates[i]" />
    </div>
  </div>
</template>

<style lang='scss' scoped></style>
