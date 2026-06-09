<script setup>
import { ElLink } from 'element-plus'
import { closeLoading, error, loading } from '../../utils/message'

const props = defineProps({
  // 链接地址
  src: {
    type: String,
    default() {
      return ''
    },
  },
  // 获取下载地址的方法，方法返回的总是一个url
  srcFun: {
    type: [Function, null],
    default: null,
  },
  fileName: {
    type: String,
    default() {
      return ''
    },
  },
})

// 点击下载
async function handleClick() {
  if (!props.src && !props.srcFun) {
    return
  }

  try {
    loading('正在下载 ...')

    let src = ''
    if (props.src) {
      src = props.src
    } else if (props.srcFun) {
      src = await props.srcFun()
    }

    const a = document.createElement('a')
    a.href = src
    a.download = decodeURIComponent(props.fileName)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(src)
  } catch (e) {
    error(e, '下载失败')
  } finally {
    closeLoading()
  }
}
</script>

<template>
  <el-link @click="handleClick">
    <slot />
  </el-link>
</template>
