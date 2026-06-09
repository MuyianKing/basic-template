<script setup>
import useFullscreen from '@hooks/screen'
import TagsLayout from '@layout/Tags.vue'
import MaterialSymbolsDarkModeRounded from '~icons/material-symbols/dark-mode-rounded'
import TablerSunFilled from '~icons/tabler/sun-filled'
import UserInfo from './User.vue'

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
      <tags-layout class="tags-wrapper" />
      <div class="header-right">
        <div class="header-user-con">
          <material-symbols-dark-mode-rounded v-if="appStore.theme === 'light'" class="cursor-pointer" @click="handleTheme" />
          <tabler-sun-filled v-else class="cursor-pointer" @click="handleTheme" />
          <i-IconParkOutlineFullScreen class="cursor-pointer" @click="handleScreen" />
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

  .tags-wrapper {
    flex: 1;
    min-width: 0;
    margin-right: 15px;
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
