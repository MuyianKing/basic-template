<script setup>
import FluentBook32Filled from '~icons/fluent/book-32-filled'
import FluentBriefcase32Filled from '~icons/fluent/briefcase-32-filled'
import FluentBuilding32Filled from '~icons/fluent/building-32-filled'
import FluentClipboardTextEdit32Filled from '~icons/fluent/clipboard-text-edit-32-filled'
import FluentPeopleTeam20Filled from '~icons/fluent/people-team-20-filled'
import FluentPerson32Filled from '~icons/fluent/person-32-filled'
import FluentTextBulletListSquare32Filled from '~icons/fluent/text-bullet-list-square-32-filled'

defineOptions({
  name: 'MuHomeIndex',
})

const router = useRouter()
const userStore = useUserStore()

// 按时段问候
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) {
    return '夜深了'
  }
  if (hour < 12) {
    return '早上好'
  }
  if (hour < 18) {
    return '下午好'
  }
  return '晚上好'
})

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

// 快捷入口：指向系统管理各模块
const shortcuts = [
  { title: '用户管理', desc: '账号与分配角色', icon: FluentPerson32Filled, path: '/system/user' },
  { title: '部门管理', desc: '组织架构维护', icon: FluentBuilding32Filled, path: '/system/dept' },
  { title: '岗位管理', desc: '岗位职责配置', icon: FluentBriefcase32Filled, path: '/system/post' },
  { title: '角色管理', desc: '角色与菜单权限', icon: FluentPeopleTeam20Filled, path: '/system/role' },
  { title: '菜单管理', desc: '菜单与按钮权限', icon: FluentTextBulletListSquare32Filled, path: '/system/menu' },
  { title: '字典管理', desc: '业务枚举维护', icon: FluentBook32Filled, path: '/system/dict' },
  { title: '操作日志', desc: '系统操作留痕', icon: FluentClipboardTextEdit32Filled, path: '/system/log/operlog' },
]

const techStacks = ['Vue 3.5', 'Element Plus', '@muyianking/ui', 'Tailwind CSS', 'Pinia', 'Rsbuild']

function go(path) {
  router.push(path)
}
</script>

<template>
  <div class="p-4">
    <!-- 欢迎横幅 -->
    <div class="flex items-center justify-between rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-color-primary-light-9)] p-6">
      <div>
        <div class="text-xl font-semibold">{{ greeting }}，{{ userStore.nickname || userStore.username || '管理员' }}</div>
        <div class="mt-2 text-sm opacity-60">欢迎回来，祝工作顺利 ~</div>
      </div>
      <div class="hidden text-sm opacity-60 md:block">{{ today }}</div>
    </div>

    <!-- 快捷入口 -->
    <div class="mt-4 text-base font-medium">快捷入口</div>
    <div class="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
      <div v-for="item in shortcuts"
           :key="item.path"
           class="cursor-pointer rounded-lg border border-[var(--el-border-color-lighter)] bg-[var(--el-bg-color)] p-4 transition-colors hover:border-[var(--el-color-primary)]"
           @click="go(item.path)"
      >
        <component :is="item.icon" class="text-xl text-[var(--el-color-primary)]" />
        <div class="mt-2 text-sm font-medium">{{ item.title }}</div>
        <div class="mt-1 text-xs opacity-50">{{ item.desc }}</div>
      </div>
    </div>

    <!-- 版本信息 -->
    <div class="mt-4 text-base font-medium">技术栈</div>
    <div class="mt-3 flex flex-wrap gap-2">
      <span v-for="item in techStacks"
            :key="item"
            class="rounded-full border border-[var(--el-border-color-lighter)] bg-[var(--el-bg-color)] px-3 py-1 text-xs"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
