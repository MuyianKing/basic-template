<script setup>
import MenuTreeSelect from '@comp/menu/Index.vue'
import { useSmartForm } from '@comp/smartui'
import { STATUS_OPTIONS } from '@const/common'
import { CACHE_OPTIONS, FRAME_OPTIONS, MENU_TYPE_OPTIONS } from '@const/menu'
import { api } from '@http'
import MenuModel from '@model/menu'

defineOptions({
  name: 'MuMenuEditDialog',
})

// 表单项按菜单类型显隐（config 为 computed，随 form.menuType 变化重建）：
// 目录(M)：是否外链 + 路由地址；菜单(C)：路由名称/是否外链/路由地址/权限字符/路由参数/是否缓存；按钮(F)：权限字符
const config = computed(() => {
  const items = [
    {
      label: '上级菜单',
      prop: 'parentId',
      rules: 'required',
    },
    {
      label: '菜单类型',
      prop: 'menuType',
      comp: 'radio',
      compProps: {
        options: MENU_TYPE_OPTIONS,
      },
    },
    {
      label: '显示排序',
      prop: 'orderNum',
      rules: 'required,integer',
    },
    {
      label: '菜单名称',
      prop: 'menuName',
      rules: 'required,maxLength=50',
    },
  ]

  if (form.value.menuType === 'C') {
    items.push({
      label: '路由名称',
      prop: 'routeName',
    })
  }

  if (form.value.menuType !== 'F') {
    items.push(
      {
        label: '是否外链',
        prop: 'isFrame',
        comp: 'radio',
        compProps: {
          options: FRAME_OPTIONS,
        },
      },
      {
        label: '路由地址',
        prop: 'path',
        rules: 'required,maxLength=200',
      },
    )
  }

  if (form.value.menuType !== 'M') {
    items.push({
      label: '权限字符',
      prop: 'perms',
      rules: 'maxLength=100',
    })
  }

  if (form.value.menuType === 'C') {
    items.push(
      {
        label: '路由参数',
        prop: 'query',
      },
      {
        label: '是否缓存',
        prop: 'isCache',
        comp: 'radio',
        compProps: {
          options: CACHE_OPTIONS,
        },
      },
    )
  }

  items.push({
    label: '菜单状态',
    prop: 'status',
    comp: 'radio',
    compProps: {
      options: STATUS_OPTIONS,
    },
  })

  return items
})

/**
 * 保存菜单：有 menuId 为修改，否则新增
 * @param {*} model 表单数据（经 MenuModel 规整）
 */
async function handleSubmit(model) {
  const result = model.menuId ? await api.menu.save(model) : await api.menu.add(model)
  // 请求失败时 http 已统一弹出错误提示，这里抛错避免弹窗误报“保存成功”
  if (!result) {
    throw new Error('保存失败')
  }
  return result
}

// 表单弹窗：字段规整与默认值在 MenuModel，行数据直接打开；form 参与上方 config 的类型联动
const { form, SmartForm, open } = useSmartForm({ Model: MenuModel })

defineExpose({
  open,
})
</script>

<template>
  <!-- close / refresh 不声明 emits，监听器经 attrs 透传：SmartForm 包装层展开 ...attrs，close 由 MuSmartForm 抛出、refresh 由 mu-form-dialog 抛出 -->
  <smart-form title="菜单信息" :config :server="handleSubmit">
    <!-- 上级菜单用菜单树选择器（含虚拟根节点「主类目」）；编辑时排除自身及子菜单（excludeId），避免把自己选为上级 -->
    <template #parentId="{ form: menuForm }">
      <menu-tree-select v-model="menuForm.parentId" :exclude-id="menuForm.menuId" class="w-full" />
    </template>
  </smart-form>
</template>

<style scoped></style>
