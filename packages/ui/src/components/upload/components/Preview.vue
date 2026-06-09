<script setup>
import { getType } from '@muyianKing/utils'
import { vLoading } from 'element-plus'
import { computed } from 'vue'
import { MuIcon } from '../../icon'
import PreviewComp from '../../preview/Index.vue'
import PixelarticonsTrash from '~icons/pixelarticons/trash';
import RiFolderUploadLine from '~icons/ri/folder-upload-line';

const props = defineProps({
  file: {
    type: [String, Array, Object],
    default: '',
  },
  // 展示方式 line-一行一附件 card-卡片形式
  listType: {
    type: String,
    default: 'card',
  },
})

const emits = defineEmits(['delete', 're-upload'])

// 删除
function handleDel(row) {
  emits('delete', row)
}

// 重新上传
function handleChange(row, real) {
  if (!real) {
    return
  }

  emits('re-upload', row)
}

const _files = computed(() => {
  if (!props.file)
    return []

  const files = Array.isArray(props.file) ? props.file : typeof props.file === 'object' ? [props.file] : [{ path: props.file }]

  return files.map((item) => {
    return {
      ...item,
      type: getType(item.path) || getType(item.name),
    }
  })
})
</script>

<template>
  <div v-for="_file in _files" :key="_file.id" v-loading="_file.loading" class="mu-upload-preview-wrapper" @click="handleChange(_file, listType !== 'card')">
    <preview-comp :files="_file" height="100px" width="100px" no-preview :card="listType === 'card'" no-download />
    <div v-if="listType === 'card'" class="delete-wrapper" @click.stop>
      <mu-icon class="icon-close" :icon="PixelarticonsTrash" size="24px" @click="handleDel(_file)" />
      <mu-icon class="ml-2" :icon="RiFolderUploadLine" size="24px" @click="handleChange(_file, true)" />
    </div>
    <mu-icon v-else class="icon-close ml-2" :icon="PixelarticonsTrash" size="18px" @click.stop="handleDel(_file)" />
  </div>
</template>
