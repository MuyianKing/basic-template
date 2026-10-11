<script setup>
import { MuFormDialog, MuFormItem, MuInput, MuRadio, MuSelect } from '@muyianking/ui'
import { cloneDeep } from 'lodash-es'

const props = defineProps({
  title: {
    type: String,
    default: '编辑',
  },
  config: {
    type: Array,
    default: () => [],
  },
  formRef: {
    type: Object,
    default: null,
  },
  // 保存接口：传入后提交时自动校验并调用，成功后提示并关闭弹窗，失败时保持弹窗打开
  server: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['close'])

const show = ref(false)
const form = props.formRef || ref({})

const COMP_MAP = {
  select: MuSelect,
  input: MuInput,
  radio: MuRadio,
}

function getComp(comp) {
  return markRaw(COMP_MAP[comp || 'input'] || comp)
}

function getRules(rules) {
  const _rules = {}
  if (rules) {
    rules.split(',').forEach((rule) => {
      const _rule = rule.split('=')
      _rules[_rule[0]] = _rule[1] || true
    })
  }
  return _rules
}

const formConfig = computed(() => {
  return props.config.map((item) => {
    return {
      label: item.label,
      prop: item.prop,
      rules: item.rules || '',
      comp: getComp(item.comp),
      compProps: item.compProps || {},
      props: item.props || {},
      customRules: item.customRules || [],
      show: item.show || null,
    }
  })
})

function open(model) {
  form.value = cloneDeep(model || {})
  show.value = true
}

function handleClose() {
  emit('close')
}

defineExpose({
  open,
})
</script>

<template>
  <mu-form-dialog v-model="show" :title="title" :server="server" :destroy-on-close="true" :model="form" @close="handleClose">
    <template v-for="item in formConfig" :key="item.prop">
      <slot v-if="$slots[`${item.prop}Custom`]" :name="`${item.prop}Custom`" :form :row="item" />
      <mu-form-item v-else :label="item.label" :prop="item.prop" :rules="item.customRules" v-bind="{ ...item.props, ...getRules(item.rules) }">
        <slot :name="item.prop" :form :row="item">
          <component :is="item.comp" v-model="form[item.prop]" v-bind="item.compProps" />
        </slot>
      </mu-form-item>
    </template>

    <template #footer>
      <slot name="footer" :form />
    </template>
  </mu-form-dialog>
</template>
