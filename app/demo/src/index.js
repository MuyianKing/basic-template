import dayjs from 'dayjs'
import { createApp } from 'vue'
import App from '@/App.vue'
import pinia from '@/pinia'
import router from '@/router'

import '@style/theme.css'
import '@style/main.css'
import '@style/custome.css'
import '@style/utils.css'

// 全局属性
window.dayjs = dayjs

const app = createApp(App)
app.use(pinia)

useMenuStore().initDynamicRoutes(router).finally(() => {
  app
    .use(router)
    .mount('#app')
})
