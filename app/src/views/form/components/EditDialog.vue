<script setup>
import { MuSmartForm } from '@comp/smartui'

const config = [
  {
    label: '姓名',
    prop: 'name',
    rules: 'required',
  },
  {
    label: '年龄',
    prop: 'age',
    rules: 'required,integer,maxLength=2',
  },
  {
    label: '职位',
    prop: 'pos',
    comp: 'select',
    compProps: {
      options: [
        { label: '测试', value: 1 },
      ],
    },
  },
]

const formRef = useTemplateRef('form')
defineExpose({
  open: () => {
    formRef.value.open()
  },
})
</script>

<template>
  <mu-smart-form ref="form" title="Smart Form" :config>
    <template #footer>
      <mu-button type="success">同步</mu-button>
    </template>
  </mu-smart-form>
</template>

<style scoped></style>
