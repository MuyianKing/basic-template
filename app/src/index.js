import dayjs from 'dayjs'
import { createApp } from 'vue'
import App from '@/App.vue'
import pinia from '@/pinia'
import router from '@/router'

// element-plus 暗色变量表，需在 theme.css 之前引入，避免覆盖项目主色
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@style/theme.css'
import '@style/main.css'
import '@style/custome.css'
import '@style/utils.css'

// 全局属性
window.dayjs = dayjs

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
