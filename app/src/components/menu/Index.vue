<script setup>
/**
 * 上级菜单树选择器：基于 element-plus 的 el-tree-select 封装，内部拉取菜单树（仅目录与菜单，按钮不能作上级），
 * 并补充虚拟根节点「主类目」（menuId 0，选中即挂根级）。
 * 组件未声明的属性、事件与插槽全部透传给 el-tree-select，可按需覆盖默认配置。
 */
import { getMenuTree } from '@server/menu'

defineOptions({
  name: 'MuMenuTreeSelect',
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: undefined,
  },
  // 需要排除的菜单ID：编辑时传自身 menuId，候选树排除自己及子菜单，避免把自己选为上级
  excludeId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const menu_tree = ref([])
const loading = ref(false)

async function getTree() {
  loading.value = true
  try {
    const tree = await getMenuTree(props.excludeId != null && props.excludeId !== '' ? props.excludeId : null)
    // 虚拟根节点「主类目」：后端根级菜单 parentId 为 0
    menu_tree.value = [{ menuId: 0, menuName: '主类目', children: tree }]
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
  // 手动重新拉取菜单树（新增菜单后如需刷新候选树）
  getTree,
})
</script>

<template>
  <!-- 默认配置在前，$attrs 在后：外部传入的同名属性可覆盖默认值 -->
  <el-tree-select v-model="value" :data="menu_tree" :loading="loading" :props="{ label: 'menuName', value: 'menuId', children: 'children' }" node-key="menuId" check-strictly default-expand-all v-bind="$attrs">
    <template v-for="(_, name) in $slots" :key="name" #[name]="scope">
      <slot :name="name" v-bind="scope" />
    </template>
  </el-tree-select>
</template>

<style scoped></style>
