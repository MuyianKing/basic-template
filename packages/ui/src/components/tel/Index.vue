<script setup>
defineProps({
  tel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <span class="mu-tel whitespace-nowrap">
    <slot>
      {{ tel }}
    </slot>
  </span>
</template>
