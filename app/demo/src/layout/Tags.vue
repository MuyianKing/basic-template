<script setup>
import TypcnDeleteOutline from '~icons/typcn/delete-outline'
// import ContextMenu from '@muyianking/ui/es/core/context-menu'

const tags = useTagsStore()
const appStore = useAppStore()

const route = useRoute()
const router = useRouter()
const isActive = path => path === route.fullPath

const tagsList = computed(() => tags._tags_list)
const showTags = computed(() => tagsList.value.length > 0)

// 关闭单个标签
function closeTags(index) {
  const delItem = tagsList.value[index]

  tags.delTagsItem(index)
  // 删除的是当前激活的路由标签
  if (delItem.path === route.path) {
    // 往前后找有没有可替代的路由
    const item = tagsList.value[index] || tagsList.value[index - 1]
    if (item) {
      if (delItem.path === route.fullPath) {
        router.push(item.path)
      }
    } else {
      router.push('/')
    }
  }
}

// 关闭全部标签
function closeAll() {
  tags.clearTags()
  router.push('/')
}

// 关闭其他标签
function closeOther() {
  const curItem = tagsList.value.filter(item => item.path === route.fullPath)
  tags.closeTagsOther(curItem)
}

const context_menu_ref = ref()

const options = ref([])

function toggle(data) {
  options.value = [{
    label: '关闭标签',
    value: 'close',
    icon: 'carbon:close-large',
  }, {
    label: '当前标签全屏',
    value: 'full',
    icon: 'bx:fullscreen',
  }, {
    label: '关闭其他标签',
    value: 'other',
    icon: 'ant-design:switcher-outlined',
  }, {
    label: '关闭全部标签',
    value: 'all',
    icon: 'bx:bxs-rectangle',
  }]
  context_menu_ref.value.toggle(data)
}

// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars
function handleClick({ data, option }) {
  switch (option.value) {
    case 'close':
      closeTags(data.index)
      break
    case 'other':
      closeOther()
      break
    case 'all':
      closeAll()
      break
    case 'full':
      router.push(data.path)
      appStore.full_page = true
      break
    default:
      break
  }
}

function iconCloseTags(item) {
  closeTags(tagsList.value.findIndex(i => i.path === item.path))
}
</script>

<template>
  <div v-if="showTags" class="tags">
    <el-scrollbar class="flex-1 pr-4 h-full">
      <div class="flex h-full">
        <router-link v-for="(item, index) in tagsList" :key="index" :class="{ active: isActive(item.path) }" :title="item.title" :to="item.path" class="tags-li" @contextmenu.prevent="toggle({ index, path: item.path })">
          <span class="tags-li-title">{{ item.title }}</span>
          <mu-icon v-if="tagsList.length > 1 && item.path !== '/home'" class="tags-close-box" :icon="TypcnDeleteOutline" @click.stop.prevent="iconCloseTags(item)" />
        </router-link>
      </div>
    </el-scrollbar>
    <!-- <context-menu ref="context_menu_ref" :options="options" class="context-menu-box" @click="handleClick" /> -->
  </div>
</template>

<style scoped>
.tags {
  position: relative;
  display: flex;
  align-items: center;
  padding-right: 10px;
  user-select: none;
  height: 100%;

  :deep(.el-scrollbar__view) {
    height: 100%;
  }
}

.tags-li {
  position: relative;
  flex-shrink: 0;
  height: auto;
  overflow: hidden;
  cursor: pointer;
  background: transparent;
  padding: 5px 10px;
  width: 120px;
  text-align: center;
  display: flex;
  align-items: center;
  font-size: 14px;

  &:hover {
    .tags-close-box {
      display: block;
    }
  }
}

.tags-li.active {
  color: var(--tab-light-color);
  background-color: var(--bg-color);
}

.tags-li-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tags-close-box {
  display: none;
  margin-left: 5px;
  position: absolute;
  right: 5px;
}

.tags-li.active .tags-li-title {
  color: var(--tab-light-color);
}

.context-menu-box {
  background-color: var(--el-fill-color-light);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  padding: 10px;
  width: 150px !important;
  height: auto !important;
  top: 45px !important;
  line-height: 32px;

  :deep(.arrow) {
    top: 0;
  }

  :deep(.mu-context-menu-item) {
    display: flex;
    align-items: center;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
