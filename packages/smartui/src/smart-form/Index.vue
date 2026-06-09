<script setup>
import { MuFormDialog, MuFormItem, MuInput, MuRadio, MuSelect } from '@mu/ui'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  config: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close'])

const show = ref(false)
const form = ref({})

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
    }
  })
})

function open(model) {
  form.value = model
  show.value = true
}

function handleClose() {
  emit('close')
}

defineExpose({ open })
</script>

<template>
  <mu-form-dialog v-model="show" :title="title" :destroy-on-close="true" :model="form" @close="handleClose">
    <mu-form-item v-for="item in formConfig" :key="item.prop" :label="item.label" :prop="item.prop" :rules="item.customRules" v-bind="{ ...item.props, ...getRules(item.rules) }">
      <slot :name="item.prop" :form>
        <component :is="item.comp" v-model="form[item.prop]" v-bind="item.compProps" />
      </slot>
    </mu-form-item>

    <template #footer>
      <slot name="footer" :form />
    </template>
  </mu-form-dialog>
</template>
