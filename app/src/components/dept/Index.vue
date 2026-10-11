<script setup>
/**
 * 部门树选择器：基于 element-plus 的 el-tree-select 封装，内部拉取部门树数据。
 * 组件未声明的属性、事件与插槽全部透传给 el-tree-select，可按需覆盖默认配置。
 */
import { getDeptList, getDeptTreeExclude } from '@server/dept'

defineOptions({
  name: 'MuDeptTreeSelect',
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: undefined,
  },
  // 需要排除的部门ID：编辑时传自身 deptId，候选树排除自己及子部门，避免把自己选为上级
  excludeId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const dept_tree = ref([])
const loading = ref(false)

async function getTree() {
  loading.value = true
  try {
    dept_tree.value = props.excludeId != null && props.excludeId !== ''
      ? await getDeptTreeExclude(props.excludeId)
      : (await getDeptList()).data
  } finally {
    loading.value = false
  }
}

const value = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

onMounted(getTree)

defineExpose({
  // 手动重新拉取部门树（新增部门后如需刷新候选树）
  getTree,
})
</script>

<template>
  <!-- 默认配置在前，$attrs 在后：外部传入的同名属性可覆盖默认值 -->
  <el-tree-select v-model="value" :data="dept_tree" :loading="loading" :props="{ label: 'deptName', value: 'deptId', children: 'children' }" node-key="deptId" check-strictly default-expand-all v-bind="$attrs">
    <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </el-tree-select>
</template>

<style scoped></style>
