<script setup>
import { ElTable, ElTableColumn } from 'element-plus'
import 'element-plus/es/components/table/style/css'
import 'element-plus/es/components/table-column/style/css'
import './index.css'

defineProps({
  config: {
    type: Array,
    default: () => [],
  },
  operationProps: {
    type: Object,
    default: () => ({}),
  },
  data: {
    type: Array,
    default: () => [],
  },
  tableLayout: {
    type: String,
    default: 'auto',
  },
})

function getMinWidth(column) {
  if (column.minWidth) {
    return `${column.minWidth}px`
  }
  return `${column.label.length}em`
}
</script>

<template>
  <el-table class="h-full" border stripe :data="data" :table-layout="tableLayout">
    <el-table-column v-for="item in config" :key="item.prop" :align="item.align || 'center'" v-bind="item">
      <template #default="scope">
        <slot :name="item.prop" v-bind="scope">
          {{ scope.row[item.prop] }}
        </slot>
      </template>
      <template #header="scope">
        <slot :name="`${item.prop}-header`" v-bind="scope">
          <div :style="{ minWidth: getMinWidth(item) }">
            {{ item.label }}
          </div>
        </slot>
      </template>
    </el-table-column>

    <el-table-column v-if="$slots.operation" fixed="right" width="80px" :align="operationProps.align || 'center'" v-bind="operationProps">
      <template #default="scope">
        <div class="flex smart-table-operation-wrapper">
          <slot name="operation" v-bind="scope" />
        </div>
      </template>
      <template #header="scope">
        <slot name="operation-header" v-bind="scope">
          操作
        </slot>
      </template>
    </el-table-column>
  </el-table>
</template>
