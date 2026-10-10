import { cloneDeep } from 'lodash-es'
import { defineStore } from 'pinia'
import router from '@/router'
import { isHome } from '@/router/menu/index'

export function getHomePathData() {
  const route = router.getRoutes().filter(item => isHome(item.path))[0]

  return {
    name: route.name,
    title: route.meta.title,
    path: route.path,
  }
}

export default defineStore('tags', {
  state: () => ({
    // 不保存首页
    tagsList: [],
    // 重新加载页面
    reload: true,
  }),
  actions: {
    delTagsItem(index) {
      this.tagsList.splice(index - 1, 1)
    },
    setTagsItem(data) {
      if (isHome(data.path)) {
        return
      }
      this.tagsList.push(data)
    },
    clearTags() {
      this.tagsList = []
    },
    closeTagsOther(data) {
      this.tagsList = data
    },
  },
  getters: {
    _tags_list() {
      const list = cloneDeep(this.tagsList)
      list.unshift(getHomePathData())
      return list
    },
  },
})
