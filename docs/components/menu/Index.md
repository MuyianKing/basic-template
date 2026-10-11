# MuMenuTreeSelect（上级菜单树选择器）

## 基本信息

- 源码：`app/src/components/menu/Index.vue`（经 `@comp/menu` 引用）
- 基于 element-plus 的 `el-tree-select` 封装，内部拉取菜单树数据
- 组件未声明的属性、事件与插槽全部透传给 el-tree-select，可按需覆盖默认配置

## 数据逻辑

- 数据来自 `@server/menu` 的 `getMenuTree(menuId)`：取 `/system/menu/list` 全量平铺列表，过滤出目录（M）与菜单（C）类型后组树——按钮（F）不能作为上级菜单
- 传入 `exclude-id` 时（编辑场景传自身 menuId），候选树排除自身及整个子树（沿父链判断），避免把自己或子孙选为上级
- 组件内部补充虚拟根节点「主类目」（menuId 0）：后端根级菜单 `parentId` 为 0，选中「主类目」即挂根级
- 树节点字段映射 `:props="{ label: 'menuName', value: 'menuId', children: 'children' }"`，`check-strictly` 允许父子节点独立选择（单选场景）

## Props

| 属性       | 类型            | 说明                                   |
| ---------- | --------------- | -------------------------------------- |
| modelValue | Number / String | 选中的上级菜单 ID（v-model）           |
| excludeId  | Number / String | 需要排除的菜单 ID，编辑时传自身 menuId |

## 插槽与透传

- 默认配置在前、`v-bind="$attrs"` 在后，外部同名属性可覆盖（如 `default-expand-all`、`clearable`）
- 所有插槽透传给 el-tree-select

## 使用示例

见菜单管理页弹窗 `app/src/views/menu/components/EditDialog.vue`：

```vue
<menu-tree-select v-model="menuForm.parentId" :exclude-id="menuForm.menuId" class="w-full" />
```
