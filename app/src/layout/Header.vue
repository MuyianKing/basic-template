<script setup>
import useFullscreen from '@hooks/screen'
import BreadcrumbLayout from '@layout/Breadcrumb.vue'
import UserInfo from './User.vue'

const collapse = defineModel('collapse', {
  type: Boolean,
  default: false,
})

const appStore = useAppStore()
function handleTheme() {
  appStore.switchTheme()
}

const { toggleFullscreen } = useFullscreen()
function handleScreen() {
  toggleFullscreen()
}
</script>

<template>
  <div class="outer-header">
    <div class="header">
      <div class="header-left">
        <div class="collapse-btn" @click="collapse = !collapse">
          <i-ant-design-menu-unfold-outlined v-if="collapse" />
          <i-ant-design-menu-fold-outlined v-else />
        </div>
        <breadcrumb-layout class="breadcrumb-wrapper" />
      </div>
      <div class="header-right">
        <div class="header-user-con">
          <i-material-symbols-dark-mode-rounded v-if="appStore.theme === 'light'" class="cursor-pointer" @click="handleTheme" />
          <i-tabler-sun-filled v-else class="cursor-pointer" @click="handleTheme" />
          <i-icon-park-outline-full-screen class="cursor-pointer" @click="handleScreen" />
          <user-info />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.outer-header {
  height: var(--tab-height);
  transition: all linear 0.2s;
}

.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: var(--tab-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--tab-bg);
  background-size: 100% 100%;

  .header-left {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .collapse-btn {
    box-sizing: border-box;
    width: 25px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 10px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }

  .breadcrumb-wrapper {
    flex: 1;
    min-width: 0;
    margin-left: 12px;
  }
}

.header-right {
  float: right;
  padding-right: 20px;
}

.header-user-con {
  display: flex;
  height: var(--tab-height);
  align-items: center;

  & > * {
    margin-left: 20px;
  }
}
</style>
