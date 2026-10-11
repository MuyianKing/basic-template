<script setup>
import { OPER_STATUS_OPTIONS, OPER_TYPE_OPTIONS } from '@const/log'
import { success } from '@muyianking/ui'
import { getLabelByVal } from '@muyianking/utils'
import { useClipboard } from '@vueuse/core'
import FluentArrowDown20Filled from '~icons/fluent/arrow-down-20-filled'
import FluentArrowSwap20Filled from '~icons/fluent/arrow-swap-20-filled'
import FluentArrowUp20Filled from '~icons/fluent/arrow-up-20-filled'
import FluentCopy20Regular from '~icons/fluent/copy-20-regular'
import FluentInfo20Filled from '~icons/fluent/info-20-filled'
import FluentPerson20Filled from '~icons/fluent/person-20-filled'

defineOptions({
  name: 'MuOperLogDetailDialog',
})

const show = ref(false)
const log = ref({})

// legacy 模式兜底非 https 内网环境
const { copy } = useClipboard({ legacy: true })

// 请求方法标签颜色
const methodTagTypes = {
  GET: 'success',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger',
}

function open(row) {
  log.value = row || {}
  show.value = true
}

// 请求/返回参数为 JSON 字符串，格式化后展示，解析失败时原样展示
function formatJson(value) {
  if (!value) {
    return ''
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

async function handleCopy(value) {
  await copy(value)
  success('复制成功')
}

defineExpose({
  open,
})
</script>

<template>
  <mu-dialog v-model="show" title="操作日志详细" width="960px">
    <div class="flex flex-col gap-4 text-sm">
      <section class="overflow-hidden rounded-md border border-solid border-[var(--el-border-color-lighter)]">
        <header class="flex items-center gap-1.5 bg-[var(--el-fill-color-light)] px-4 py-2.5 font-semibold">
          <fluent-info20-filled class="text-[var(--el-color-primary)]" />
          基本信息
        </header>
        <div class="grid grid-cols-2 gap-x-8 gap-y-2.5 px-4 py-3.5">
          <div class="flex">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">操作模块</span>
            <span class="break-all">{{ log.title }}</span>
          </div>
          <div class="flex">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">业务类型</span>
            <span>{{ getLabelByVal(OPER_TYPE_OPTIONS, log.businessType) || log.businessType }}</span>
          </div>
          <div class="flex">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">操作时间</span>
            <span>{{ log.operTime }}</span>
          </div>
          <div class="flex">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">执行状态</span>
            <el-tag :type="log.status === 0 ? 'success' : 'danger'">{{ getLabelByVal(OPER_STATUS_OPTIONS, log.status) || log.status }}</el-tag>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-md border border-solid border-[var(--el-border-color-lighter)]">
        <header class="flex items-center gap-1.5 bg-[var(--el-fill-color-light)] px-4 py-2.5 font-semibold">
          <fluent-person20-filled class="text-[var(--el-color-primary)]" />
          操作人员
        </header>
        <div class="grid grid-cols-2 gap-x-8 gap-y-2.5 px-4 py-3.5">
          <div class="flex">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">操作人员</span>
            <span class="break-all">{{ log.operName }}</span>
          </div>
          <div class="flex">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">所属部门</span>
            <span class="break-all">{{ log.deptName }}</span>
          </div>
          <div class="flex col-span-2">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">操作地址</span>
            <span class="break-all">{{ log.operIp }} {{ log.operLocation }}</span>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-md border border-solid border-[var(--el-border-color-lighter)]">
        <header class="flex items-center gap-1.5 bg-[var(--el-fill-color-light)] px-4 py-2.5 font-semibold">
          <fluent-arrow-swap20-filled class="text-[var(--el-color-primary)]" />
          请求信息
        </header>
        <div class="grid grid-cols-2 gap-x-8 gap-y-2.5 px-4 py-3.5">
          <div class="flex col-span-2">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">请求地址</span>
            <span class="flex items-center gap-2 break-all">
              <el-tag v-if="log.requestMethod" :type="methodTagTypes[log.requestMethod] || 'info'">{{ log.requestMethod }}</el-tag>
              {{ log.operUrl }}
            </span>
          </div>
          <div class="flex col-span-2">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">操作方法</span>
            <span class="break-all">{{ log.method }}</span>
          </div>
          <div class="flex">
            <span class="w-20 shrink-0 text-[var(--el-text-color-secondary)]">消耗时间</span>
            <span>{{ log.costTime }} 毫秒</span>
          </div>
        </div>
      </section>

      <section class="overflow-hidden rounded-md border border-solid border-[var(--el-border-color-lighter)]">
        <header class="flex items-center gap-1.5 bg-[var(--el-fill-color-light)] px-4 py-2.5 font-semibold">
          <fluent-arrow-up20-filled class="text-[var(--el-color-primary)]" />
          请求参数
        </header>
        <div class="relative m-3.5 rounded-md border border-solid border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)]">
          <pre class="max-h-48 overflow-auto px-4 py-3 text-xs leading-5 whitespace-pre-wrap break-all">{{ formatJson(log.operParam) }}</pre>
          <el-button size="small" class="absolute top-2 right-2" @click="handleCopy(formatJson(log.operParam))">
            <template #icon>
              <fluent-copy20-regular />
            </template>
            复制
          </el-button>
        </div>
      </section>

      <section class="overflow-hidden rounded-md border border-solid border-[var(--el-border-color-lighter)]">
        <header class="flex items-center gap-1.5 bg-[var(--el-fill-color-light)] px-4 py-2.5 font-semibold">
          <fluent-arrow-down20-filled class="text-[var(--el-color-primary)]" />
          返回参数
        </header>
        <div class="relative m-3.5 rounded-md border border-solid border-[var(--el-border-color-lighter)] bg-[var(--el-fill-color-light)]">
          <pre class="max-h-48 overflow-auto px-4 py-3 text-xs leading-5 whitespace-pre-wrap break-all">{{ formatJson(log.jsonResult) }}</pre>
          <el-button size="small" class="absolute top-2 right-2" @click="handleCopy(formatJson(log.jsonResult))">
            <template #icon>
              <fluent-copy20-regular />
            </template>
            复制
          </el-button>
        </div>
      </section>

      <section v-if="log.errorMsg" class="overflow-hidden rounded-md border border-solid border-[var(--el-border-color-lighter)]">
        <header class="flex items-center gap-1.5 bg-[var(--el-fill-color-light)] px-4 py-2.5 font-semibold">
          <fluent-info20-filled class="text-[var(--el-color-danger)]" />
          错误信息
        </header>
        <div class="px-4 py-3.5 text-[var(--el-color-danger)] break-all">
          {{ log.errorMsg }}
        </div>
      </section>
    </div>
  </mu-dialog>
</template>

<style scoped></style>
