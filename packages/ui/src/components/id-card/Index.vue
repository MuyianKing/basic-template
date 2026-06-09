<script setup>
defineProps({
  idCard: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span class="mu-id-card whitespace-nowrap">
    <slot>
      {{ idCard }}
    </slot>
  </span>
</template>
