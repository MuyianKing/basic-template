<script setup>
import DeptTreeSelect from '@comp/dept/Index.vue'
import { useSmartForm } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { api } from '@http'
import DeptModel from '@model/dept'

defineOptions({
  name: 'MuDeptEditDialog',
})

const config = [
  {
    label: '上级部门',
    prop: 'parentId',
    rules: 'required',
  },
  {
    label: '部门名称',
    prop: 'deptName',
    rules: 'required,maxLength=30',
  },
  {
    label: '排序',
    prop: 'orderNum',
    rules: 'required,integer',
  },
  {
    label: '状态',
    prop: 'status',
    comp: 'radio',
    compProps: {
      options: STATUS_OPTIONS,
    },
  },
]

/**
 * 保存部门：有 deptId 为修改，否则新增
 * @param {*} model 表单数据（经 DeptModel 规整）
 */
async function handleSubmit(model) {
  const result = model.deptId ? await api.dept.save(model) : await api.dept.add(model)
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 表单弹窗：字段规整与默认值在 DeptModel，行数据直接打开
const { SmartForm, open } = useSmartForm({ Model: DeptModel })

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出 -->
  <smart-form title="部门信息" :config :server="handleSubmit">
    <!-- 上级部门用部门树选择器；编辑时排除自身及子部门（excludeId），避免把自己选为上级 -->
    <template #parentId="{ form }">
      <dept-tree-select v-model="form.parentId" :exclude-id="form.deptId" class="w-full" />
    </template>
  </smart-form>
</template>

<style scoped></style>
