<script setup>
import { getSuffix, getType } from '@muyianKing/utils'
import { computed, inject, nextTick, ref } from 'vue'
import { closeLoading, error, loading } from '../../utils/message'
import { MuIcon } from '../icon'
import WavesurferComp from '../wavesurfer/Index.vue'
import VscodeIconsFolderTypeAudioOpened from '~icons/vscode-icons/folder-type-audio-opened';
import VscodeIconsFileTypeExcel from '~icons/vscode-icons/file-type-excel';
import VscodeIconsFileTypePowerpoint from '~icons/vscode-icons/file-type-powerpoint';
import VscodeIconsFileTypeWord from '~icons/vscode-icons/file-type-word';

const props = defineProps({
  file: {
    type: Object,
    default() {
      return null
    },
  },
  noDownload: {
    type: Boolean,
    default: false,
  },
  card: {
    type: Boolean,
    default: false,
  },
  height: {
    type: String,
    default: '100px',
  },
  width: {
    type: String,
    default: '100px',
  },
})

const { previewFileUrl, downloadFile } = inject('GLOBAL_CUSTOM_CONFIG', {})

const wavesurfer_src = ref('')

function handleDownload() {
  if ((getType(props.file.name) || getType(props.file.path)) === 'audio') {
    nextTick(() => {
      wavesurfer_src.value = previewFileUrl ? previewFileUrl(props.file.path, props.file.prefix) : props.file.path
    })
    return
  }

  if (props.noDownload) {
    return
  }

  try {
    loading('正在打开文件...')
    downloadFile && downloadFile(props.file)
  } catch (e) {
    error(e, '打开文件失败')
  } finally {
    closeLoading()
  }
}

const _style = computed(() => {
  return {
    height: props.height || (props.card ? '100px' : ''),
    width: props.width || (props.card ? '100px' : ''),
  }
})

const icon_map = {
  audio: VscodeIconsFolderTypeAudioOpened,
  xls: VscodeIconsFileTypeExcel,
  xlsx: VscodeIconsFileTypeExcel,
  ppt: VscodeIconsFileTypePowerpoint,
  pptx: VscodeIconsFileTypePowerpoint,
  file: VscodeIconsFileTypeWord,
}

const icon_comp = computed(() => {
  return icon_map[getSuffix(props.file?.name)] || icon_map[getType(props.file?.name)]
})

const _name = computed(() => {
  return props.file.org_name || props.file.fileName || props.file.name
})
</script>

<template>
  <template v-if="file && file.name">
    <div v-if="card" class="mu-file-card-item" :style="_style" v-bind="$attrs" @click="handleDownload">
      <div class="flex-1-0 card-top">
        <mu-icon :icon="icon_comp" size="40" />
      </div>
      <div class="line-clamp-1 card-file-name" :title="_name">
        {{ _name }}
      </div>
    </div>

    <span v-else v-bind="$attrs" class="mu-file-item" @click="handleDownload">
      {{ _name }}
    </span>
    <wavesurfer-comp v-model="wavesurfer_src" v-bind="$attrs" />
  </template>
</template>
