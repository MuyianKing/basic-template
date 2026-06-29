<script setup>
import SingletonDate from './SingletonDate.vue'

const TOTAL = 5000
const dates = ref(Array.from({ length: TOTAL }).fill(''))
</script>

<template>
  <div class="flex flex-wrap overflow-y-auto h-full">
    <div v-for="(v, i) in dates" :key="i" class="m-4 flex items-center gap-2">
      <singleton-date v-model="dates[i]" field="date" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
