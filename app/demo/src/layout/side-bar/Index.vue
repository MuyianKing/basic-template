<script setup>
import { WEB_NAME } from '@app'
import SubMenu from '@layout/side-bar/components/SubMenu.vue'
import { hasResource } from '@server/user'

const route = useRoute()
const onRoutes = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

/**
 * 根据资源配置生成菜单
 * @param {Array} routes 路由
 */
function createMenuList(routes) {
  const new_routes = []

  routes.forEach((route) => {
    if (hasResource(route.meta?.resource)) {
      const new_route = {
        path: route.path,
        meta: route.meta,
        is_frame: route.is_frame,
        resources_id: route.resources_id,
      }

      if (route.children && route.children.length > 0) {
        new_route.children = createMenuList(route.children)
      }

      // 路由包含组件或者有儿子才渲染
      new_routes.push(new_route)
    }
  })

  return new_routes
}

// 菜单折叠
const collapse = defineModel({
  type: Boolean,
  default: false,
})

const width = computed(() => {
  return collapse.value ? 'calc(var(--el-menu-icon-width) + var(--el-menu-base-level-padding) * 2)' : '220px'
})

// 菜单
const sideMenu = ref([])
function setMenu() {
  const dynamicRouterStore = useMenuStore()
  sideMenu.value = createMenuList(dynamicRouterStore.list)
}

setMenu()

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
        <i-fa-indent v-if="collapse" class="collapse-btn" @click="collapse = !collapse" />
        <i-fa-dedent v-else class="collapse-btn" @click="collapse = !collapse" />
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

  .collapse-btn {
    color: var(--side-light-color);
    cursor: pointer;
    font-size: 14px !important;
    position: relative;
    top: 2px;
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
