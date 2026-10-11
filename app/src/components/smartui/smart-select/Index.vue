<script setup>
/**
 * 统一选择组件：按 type 渲染底层 MuSelect / MuRadio / MuCheckbox，
 * 三者共用 options（{label, value}）结构；MuSelect 另支持 children 分组选项。
 * 其余属性与事件经 $attrs 透传给底层组件（clearable、line、empty、disabled、readonly 等）。
 * v-model 数据类型随 type：select / radio 为标量，checkbox 为数组（兼容逗号分隔字符串，由 MuCheckbox 规整）。
 */
import { MuCheckbox, MuRadio, MuSelect } from '@muyianking/ui'

defineOptions({
  name: 'MuSmartSelect',
  inheritAttrs: false,
})

const props = defineProps({
  // 渲染类型：select 下拉单选、radio 单选按钮组、checkbox 多选按钮组
  type: {
    type: String,
    default: 'select',
    validator: value => ['select', 'radio', 'checkbox'].includes(value),
  },
  // 选项列表 {label, value}
  options: {
    type: Array,
    default: () => [],
  },
})

const model = defineModel()

const COMP_MAP = {
  select: MuSelect,
  radio: MuRadio,
  checkbox: MuCheckbox,
}

const comp = computed(() => markRaw(COMP_MAP[props.type] || MuSelect))

// checkbox 保证向底层组件传数组，空值规整为 []
const innerModel = computed({
  get() {
    if (props.type === 'checkbox' && (model.value === null || model.value === undefined)) {
      return []
    }
    return model.value
  },
  set(value) {
    model.value = value
  },
})
</script>

<template>
  <component :is="comp" v-bind="$attrs" v-model="innerModel" :options="options" />
</template>

<style scoped></style>
