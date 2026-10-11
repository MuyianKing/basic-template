<script setup>
/**
 * 角色选择器：基于 @muyianking/ui 的 MuSelectRemote 封装，远程分页拉取角色列表，
 * 下拉打开或输入关键字时按 roleName 远程搜索。
 * 组件未声明的属性、事件与插槽全部透传给 MuSelectRemote（multiple / all / disabled 等），可按需覆盖默认配置。
 */
import { api, withPage } from '@http'

defineOptions({
  name: 'MuRoleSelect',
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [Number, String, Array],
    default: undefined,
  },
  // 附加查询参数：如 { status: '0' } 只查正常状态角色
  params: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// MuSelectRemote 回调入参为 { roleName, page, pageSize, ...params }，需返回角色数组
async function server({ page, pageSize, ...params }) {
  const { data } = await withPage(api.role.list, { page, limit: pageSize, ...params })
  return data
}
</script>

<template>
  <!-- 默认配置在前，$attrs 在后：外部传入的同名属性可覆盖默认值 -->
  <mu-select-remote v-model="value" :server :params :query-config="{ query_key: 'roleName' }" :data-config="{ label_key: 'roleName', value_key: 'roleId' }" v-bind="$attrs" />
</template>

<style scoped></style>
