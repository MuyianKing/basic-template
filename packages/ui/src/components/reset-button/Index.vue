<script name="MuResetButton" setup>
import { ElButton, ElPopconfirm } from 'element-plus'
import { computed, inject } from 'vue'
import { MuIcon } from '../icon'
import SolarRefreshLinear from '~icons/solar/refresh-linear';

const props = defineProps({
  icon: {
    type: [Boolean, undefined],
    default: undefined,
  },
  text: {
    type: String,
    default: '重置',
  },
  noConfirm: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['confirm'])

function confirm() {
  emits('confirm')
}

const { buttonIcon } = inject('GLOBAL_CUSTOM_CONFIG', { buttonIcon: true })
const show_icon = computed(() => props.icon !== undefined ? props.icon : (buttonIcon === undefined ? true : buttonIcon))
</script>

<template>
  <el-button v-if="noConfirm" v-bind="$attrs" type="warning" @click="confirm">
    <mu-icon v-if="show_icon" :icon="SolarRefreshLinear" class="mr-1" />
    <slot>
      {{ text }}
    </slot>
  </el-button>
  <el-popconfirm v-else title="确定要重置?" @confirm="confirm">
    <template #reference>
      <el-button v-bind="$attrs" type="warning">
        <mu-icon v-if="show_icon" :icon="SolarRefreshLinear" class="mr-1" />
        <slot>
          {{ text }}
        </slot>
      </el-button>
    </template>
  </el-popconfirm>
</template>
