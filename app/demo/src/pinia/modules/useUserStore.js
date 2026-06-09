import { defineStore } from 'pinia'

export default defineStore('user', {
  state: () => ({
    id: '',
    username: '',
    token: '',
  }),
  actions: {
    initUser(data) {
      if (data) {
        this.$patch(data)
      }
    },
    clearUser() {
      this.$reset()
    },
  },
  persist: {
    enabled: true,
  },
})
