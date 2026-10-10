<script setup>
import { WEB_NAME } from '@app'
import SubMenu from '@layout/side-bar/components/SubMenu.vue'
import { hasResource } from '@server/user'

const route = useRoute()
const router = useRouter()
const onRoutes = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

/**
 * 拼接父子级完整路径
 * @param {string} parentPath 父级完整路径
 * @param {string} path 当前路由 path
 */
function resolvePath(parentPath, path) {
  return path.startsWith('/') ? path : `${parentPath}/${path}`.replace(/\/+/g, '/')
}

/**
 * 根据路由配置生成菜单，子路由 path 为相对路径，逐级拼接为完整路径
 * @param {Array} routes 路由
 * @param {string} parentPath 父级完整路径
 */
function createMenuList(routes, parentPath = '') {
  return routes
    .filter(item => hasResource(item.meta?.resource))
    .map((item) => {
      const path = resolvePath(parentPath, item.path)
      const menu = { path, meta: item.meta }

      if (item.children && item.children.length > 0) {
        menu.children = createMenuList(item.children, path)
      }

      return menu
    })
}

// 菜单折叠
const collapse = defineModel({
  type: Boolean,
  default: false,
})

const width = computed(() => {
  return collapse.value ? 'calc(var(--el-menu-icon-width) + var(--el-menu-base-level-padding) * 2)' : '220px'
})

// 菜单：只渲染 admin 路由下的子路由
const adminChildren = router.options.routes.find(item => item.name === 'admin')?.children || []
const sideMenu = createMenuList(adminChildren)

onMounted(() => {
  if (document.body.clientWidth < 1000) {
    collapse.value = !collapse.value
  }
})
</script>

<template>
  <div :style="{ width }" class="anchor-index">
    <el-menu :collapse :default-active="onRoutes" class="sidebar-el-menu" unique-opened router>
      <div class="web-name-wrapper">
        <div v-show="!collapse" class="web-name">
          <el-link underline="hover" class="logo" href="/#/">
            {{ WEB_NAME }}
          </el-link>
        </div>
      </div>
      <template v-for="item in sideMenu" :key="item.path">
        <sub-menu :menu="item" />
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.anchor-index {
  user-select: none;
  transition: all linear 0.2s;
}

.sidebar-el-menu {
  position: relative;
  height: 100%;
  overflow-y: auto;
  flex-shrink: 0;
  background-color: var(--side-bg);

  :deep(.el-menu) {
    background-color: var(--side-bg);
  }

  :deep(.el-menu-item) {
    &:hover {
      background-color: var(--side-hover-bg);
      color: var(--side-hover-text);
    }

    &.is-active {
      background-color: var(--color-primary);
      color: #fff;
    }
  }

  &::-webkit-scrollbar {
    width: 0 !important;
  }
}

.web-name-wrapper {
  height: var(--tab-height);
  display: flex;
  align-items: center;
  padding-left: 20px;
  padding-right: 5px;
  color: white;

  .web-name {
    min-width: 0;
    display: flex;
    align-items: center;
    flex: 1;
    margin-right: 5px;
  }

  .logo {
    color: var(--side-light-color);
    font-size: 20px;
    padding-left: 4px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu) {
  border-right: 0 !important;
}
</style>
