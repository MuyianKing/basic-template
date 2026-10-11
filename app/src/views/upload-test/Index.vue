<script setup>
import { error } from '@muyianking/ui'

defineOptions({
  name: 'MuUploadTest',
})

// 单张图片：v-model 为 { id, name, path } 或 null
const singleImage = ref(null)

// 多张图片：v-model 为数组
const multipleImages = ref([])

// 任意类型文件（含进度条）
const files = ref([])

// 上传状态与结果记录
const uploadingCount = ref(0)
const uploadLogs = ref([])

function handleUploadStart() {
  uploadingCount.value += 1
}

function handleUploadFinish(id) {
  uploadingCount.value = Math.max(0, uploadingCount.value - 1)
  uploadLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    id,
  })
  if (uploadLogs.value.length > 20) {
    uploadLogs.value.pop()
  }
}

function handleError() {
  error('上传失败，请查看网络请求')
}
</script>

<template>
  <div class="h-full overflow-auto p-2">
    <div class="grid grid-cols-1 gap-2 xl:grid-cols-2">
      <!-- 单张图片 -->
      <div class="bg-[var(--el-bg-color)] p-4">
        <h3 class="mb-3 text-sm font-bold">单张图片（v-model 单对象）</h3>
        <mu-upload v-model="singleImage" type="image" @error="handleError" />
        <p class="mt-3 text-xs text-[var(--el-text-color-secondary)] break-all">值：{{ singleImage ? JSON.stringify(singleImage) : 'null' }}</p>
      </div>

      <!-- 多张图片 -->
      <div class="bg-[var(--el-bg-color)] p-4">
        <h3 class="mb-3 text-sm font-bold">多张图片（multiple，最多 5 张）</h3>
        <mu-upload v-model="multipleImages" type="image" multiple :max-count="5" @error="handleError" />
        <p class="mt-3 text-xs text-[var(--el-text-color-secondary)]">已上传 {{ multipleImages?.length || 0 }} 张</p>
      </div>

      <!-- 文件 -->
      <div class="bg-[var(--el-bg-color)] p-4">
        <h3 class="mb-3 text-sm font-bold">文件上传（type="file"，多选 + 进度条）</h3>
        <mu-upload v-model="files" type="file" multiple progress @upload-start="handleUploadStart" @upload-finish="handleUploadFinish" @error="handleError" />
        <p class="mt-3 text-xs text-[var(--el-text-color-secondary)]">进行中：{{ uploadingCount }}，共 {{ files?.length || 0 }} 个文件</p>
      </div>

      <!-- 上传记录 -->
      <div class="bg-[var(--el-bg-color)] p-4">
        <h3 class="mb-3 text-sm font-bold">上传记录（upload-finish 返回的资源 id）</h3>
        <p v-if="uploadLogs.length === 0" class="text-xs text-[var(--el-text-color-secondary)]">暂无记录</p>
        <ul v-else class="max-h-50 overflow-auto text-xs text-[var(--el-text-color-regular)]">
          <li v-for="(log, index) in uploadLogs" :key="index" class="truncate py-1">
            [{{ log.time }}] {{ log.id }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
