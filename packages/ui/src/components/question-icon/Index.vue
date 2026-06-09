<script setup>
import { ElTooltip } from 'element-plus'
import { MuIcon } from '../icon'
import MingcuteQuestionFill from '~icons/mingcute/question-fill';

defineProps({
  placement: {
    type: String,
    default: 'top',
  },
})
</script>

<template>
  <el-tooltip effect="dark" :placement="placement">
    <template #content>
      <slot />
    </template>
    <mu-icon :icon="MingcuteQuestionFill" class="text-gray-600 cursor-pointer" v-bind="$attrs" />
  </el-tooltip>
</template>
