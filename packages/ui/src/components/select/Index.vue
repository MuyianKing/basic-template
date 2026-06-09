<script setup>
import { vLoadmore } from '@mu/directives'
import { ElOption, ElOptionGroup, ElSelect, vLoading } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import PinyinMatch from 'pinyin-match'
import { computed, getCurrentInstance } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default() {
      return []
    },
  },
  modelValue: {
    type: [String, Number, Boolean, Array],
    default() {
      return ''
    },
  },
  placeholder: {
    type: String,
    default: '',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  // 显示全部
  all: {
    type: Boolean,
    default: false,
  },
  emptyValue: {
    type: [String, null, undefined, Number, Boolean],
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // 禁用的选项：选项值组成的数组
  disabledOptions: {
    type: [String, Number, Boolean, Array],
    default() {
      return []
    },
  },
  // 只读
  readonly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:modelValue', 'change', 'bottom'])

// 提示信息
const placeholder_comp = computed(() => {
  // 只读没有提示
  if (props.readonly) {
    return ''
  }

  if (props.placeholder) {
    return props.placeholder
  }

  const instance = getCurrentInstance()
  // 如果父组件有label属性，取label
  if (instance?.parent?.props?.label) {
    return `请选择${instance.parent.props.label.replace('：', '').replace(':', '')}`
  }

  return '请选择'
})

function change(val) {
  emits('update:modelValue', val)
  emits('change', { value: val, options: props.options })
}

// 触底触发
function handleBottom() {
  emits('bottom')
}

// 禁用选项
const _d_p = computed(() => {
  if (!props.disabledOptions) {
    return []
  }
  return Array.isArray(props.disabledOptions) ? props.disabledOptions : [props.disabledOptions]
})

// 自定义搜索
const filterOptions = ref([])
function filterMethod(val) {
  if (!val) {
    filterOptions.value = props.options
  } else {
    const options = cloneDeep(props.options)
    filterOptions.value = options.filter((item) => {
      if (item.children) {
        // 筛选分组中的选项
        item.children = item.children.filter(child => PinyinMatch.match(child.label, val) !== false)
        // 有子项则返回
        return item.children.length > 0
      }
      return PinyinMatch.match(item.label, val) !== false
    })
  }
}

watchEffect(() => {
  filterOptions.value = props.options
})
</script>

<template>
  <el-select :model-value="modelValue" :disabled="readonly || disabled" :placeholder="placeholder_comp" :clearable="clearable" filterable :filter-method="filterMethod" :class="{ 'mu-select-readonly-item': readonly }" @change="change">
    <div v-loadmore="handleBottom" class="relative">
      <el-option v-if="all" :value="emptyValue">全部</el-option>

      <!-- 分组 -->
      <template v-for="item in filterOptions" :key="item.value">
        <template v-if="item.children">
          <el-option-group :label="item.label">
            <el-option v-for="child in item.children" :key="child.value" :label="child.label" :value="child.value" :disabled="_d_p.includes(item.value)" />
          </el-option-group>
        </template>

        <el-option v-else :label="item.label" :value="item.value" :disabled="_d_p.includes(item.value)" />
      </template>
    </div>
    <div v-loading="loading" class="mu-select-loading-item" />
  </el-select>
</template>
