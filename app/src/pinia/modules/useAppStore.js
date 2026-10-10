import { defineStore } from 'pinia'

function switchTheme(themeClass) {
  const allThemes = ['dark', 'light']
  // 移除所有可能存在的主题类
  allThemes.forEach((cls) => {
    document.documentElement.classList.remove(cls)
  })

  // 添加新的主题类
  if (themeClass) {
    document.documentElement.classList.add(themeClass)
  }
}

export default defineStore('appinfo', {
  state: () => ({
    // 页面是否全屏
    full_page: false,
    app_name: '系统名称',
    theme: 'dark',
  }),
  actions: {
    initData(data) {
      if (data) {
        this.$patch(data)
      }
    },
    clear() {
      this.$reset()
    },
    // 启动时应用持久化的主题类，避免刷新后主题丢失
    initTheme() {
      switchTheme(this.theme)
    },
    switchTheme() {
      if (this.theme === 'dark') {
        this.theme = 'light'
      } else {
        this.theme = 'dark'
      }
      switchTheme(this.theme)
    },
  },
  persist: {
    enabled: true,
  },
})
