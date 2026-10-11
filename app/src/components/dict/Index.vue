<script setup>
/**
 * 字典选择器：基于 @comp/smartui 的 MuSmartSelect 封装，按 dictType 远程拉取字典数据
 * 并转为 {label, value} 选项（app/src/server/dict.js getDictOptions，进程内缓存）。
 * v-model 数据类型随 type：select / radio 为标量，checkbox 为数组。
 * 组件未声明的属性、事件全部透传给 MuSmartSelect（type / clearable / line / empty / disabled 等），
 * 即同时继承 mu-select / mu-radio / mu-checkbox 的全部属性。
 */
import { MuSmartSelect } from '@comp/smartui'
import { getDictOptions } from '@server/dict'

defineOptions({
  name: 'MuDictSelect',
  inheritAttrs: false,
})

const props = defineProps({
  // 字典类型 key，如 sys_normal_disable
  dictType: {
    type: String,
    required: true,
  },
})

const model = defineModel()

const options = ref([])
const loading = ref(false)

async function loadOptions() {
  loading.value = true
  try {
    options.value = await getDictOptions(props.dictType)
  } finally {
    loading.value = false
  }
}

watch(() => props.dictType, loadOptions, { immediate: true })
</script>

<template>
  <!-- 默认配置在前，$attrs 在后：外部传入的同名属性可覆盖默认值 -->
  <mu-smart-select v-bind="$attrs" v-model="model" :options="options" :loading="loading" />
</template>

<style scoped></style>
