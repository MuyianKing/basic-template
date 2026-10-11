<script setup>
import { WEB_NAME } from '@app'
import { api } from '@http'
import { clearUserData, getUserInfoByToken } from '@server/user'

defineOptions({
  name: 'UserLoginNoAlive',
})

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  code: '',
  uuid: '',
})

// 验证码
const captcha = reactive({
  enabled: true,
  img: '',
})

// 获取验证码
async function refreshCaptcha() {
  const res = await api.auth.captchaImage()
  if (!res) {
    return
  }
  // 后端返回 Python 风格布尔字符串（'True'/'False'），统一按字符串小写判断
  captcha.enabled = String(res.captchaEnabled).toLowerCase() !== 'false'
  captcha.img = `data:image/gif;base64,${res.img}`
  form.uuid = res.uuid
  form.code = ''
}

// 登录
const loginRef = useTemplateRef('loginRef')
async function submitForm() {
  loginRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    const res = await api.auth.login({
      username: form.username,
      password: form.password,
      code: form.code,
      uuid: form.uuid,
    })
    // 请求失败时 http 已统一弹出错误提示，刷新验证码后等待重新输入
    if (!res) {
      refreshCaptcha()
      return
    }
    afterLogin(res)
  })
}

// 登录成功
const userStore = useUserStore()
async function afterLogin(res) {
  userStore.initUser({ token: res.token })
  const info = await getUserInfoByToken()
  userStore.initUser(info)
  router.push('/')
}

onMounted(() => {
  clearUserData()
  refreshCaptcha()
})
</script>

<template>
  <div class="login-page relative h-full w-full overflow-hidden bg-white">
    <!-- 左侧波浪装饰：双层十瓣花瓣圆缓慢旋转（36° 为一瓣周期，循环无缝），仿 cool-admin -->
    <svg class="pointer-events-none absolute inset-0 z-0 hidden h-full w-full -scale-x-100 lg:block" aria-hidden="true">
      <use href="#login-wave-bg" />
    </svg>
    <svg class="absolute h-0 w-0" aria-hidden="true">
      <symbol id="login-wave-bg" viewBox="0 0 500 350">
        <g transform="translate(670,-17) scale(100)" opacity="0.3" style="fill: color-mix(in srgb, var(--el-color-primary) 70%, #2c3142)">
          <path stroke-width="0" d="M4.10125 0 C4.10125 0.5525 4.3542 0.8338 4.1835 1.3593 S3.6427 1.9637 3.318 2.4107 S3.0325 3.2339 2.5855 3.5587 S1.7928 3.7298 1.2674 3.9005 S0.5525 4.3988 0 4.3988 S-0.7419 4.0713 -1.2674 3.9005 S-2.1385 3.8834 -2.5855 3.5587 S-2.9932 2.8576 -3.318 2.4107 S-4.0127 1.8847 -4.1835 1.3593 S-4.1013 0.5525 -4.1013 0 S-4.3542 -0.8338 -4.1835 -1.3593 S-3.6427 -1.9637 -3.318 -2.4107 S-3.0325 -3.2339 -2.5855 -3.5587 S-1.7928 -3.7298 -1.2674 -3.9005 S-0.5525 -4.3988 0 -4.3988 S0.7419 -4.0713 1.2674 -3.9005 S2.1385 -3.8834 2.5855 -3.5587 S2.9932 -2.8576 3.318 -2.4107 S4.0127 -1.8847 4.1835 -1.3593 S4.1013 -0.5525 4.1013 0">
            <animateTransform attributeName="transform" type="rotate" dur="10s" repeatCount="indefinite" values="0;36" />
          </path>
        </g>
        <g transform="translate(746,-56) scale(100)" opacity="0.9" style="fill: color-mix(in srgb, var(--el-color-primary) 70%, #2c3142)">
          <path stroke-width="0" d="M4.9215 0 C4.9215 0.663 5.225 1.0006 5.0202 1.6311 S4.3713 2.3564 3.9816 2.8928 S3.639 3.8807 3.1026 4.2704 S2.1514 4.4757 1.5208 4.6806 S0.663 5.2785 0 5.2785 S-0.8903 4.8855 -1.5208 4.6806 S-2.5662 4.6601 -3.1026 4.2704 S-3.5919 3.4292 -3.9816 2.8928 S-4.8153 2.2617 -5.0202 1.6311 S-4.9215 0.663 -4.9215 0 S-5.225 -1.0006 -5.0202 -1.6311 S-4.3713 -2.3564 -3.9816 -2.8928 S-3.639 -3.8807 -3.1026 -4.2704 S-2.1514 -4.4757 -1.5208 -4.6806 S-0.663 -5.2785 0 -5.2785 S0.8903 -4.8855 1.5208 -4.6806 S2.5662 -4.6601 3.1026 -4.2704 S3.5919 -3.4292 3.9816 -2.8928 S4.8153 -2.2617 5.0202 -1.6311 S4.9215 -0.663 4.9215 0">
            <animateTransform attributeName="transform" type="rotate" dur="6s" repeatCount="indefinite" values="0;36" />
          </path>
        </g>
      </symbol>
    </svg>

    <!-- 右侧登录区 -->
    <div class="relative z-10 ml-auto flex h-full w-full items-center justify-center lg:w-[48%]">
      <div class="w-full max-w-[400px] px-5 lg:-translate-x-10">
        <div class="mb-10 flex flex-col items-center">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#333a4a] text-xl font-bold text-white">{{ WEB_NAME.charAt(0) }}</div>
            <span class="text-3xl font-bold tracking-wide">{{ WEB_NAME }}</span>
          </div>
          <p class="mt-3 text-sm text-[#9ca0a8]">后台权限管理系统</p>
        </div>

        <el-form ref="loginRef" :model="form" label-position="top" size="large">
          <mu-form-item label="账号" prop="username" required>
            <mu-input v-model="form.username" placeholder="请输入账号" />
          </mu-form-item>
          <mu-form-item label="密码" prop="password" required>
            <mu-input v-model="form.password" placeholder="请输入密码" show-password type="password" @keyup.enter="submitForm" />
          </mu-form-item>
          <mu-form-item v-if="captcha.enabled" label="验证码" prop="code" required>
            <div class="flex w-full items-center gap-2">
              <mu-input v-model="form.code" class="flex-1" placeholder="请输入验证码" @keyup.enter="submitForm" />
              <img v-if="captcha.img" class="h-10 cursor-pointer rounded-md" :src="captcha.img" title="点击刷新验证码" @click="refreshCaptcha">
            </div>
          </mu-form-item>
        </el-form>

        <el-button class="mt-1 w-full rounded-lg" type="primary" size="large" @click="submitForm">登录</el-button>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-5 z-10 text-center text-sm text-[#a3a7b0]">Copyright © {{ WEB_NAME }}</div>
  </div>
</template>

<style lang="css" scoped>
/* 登录页固定浅色观感，不受全局暗黑主题影响 */
.login-page {
  --el-text-color-primary: #303133;
  --el-text-color-regular: #606266;
  --el-text-color-secondary: #909399;
  --el-text-color-placeholder: #a8abb2;
  --el-fill-color-light: #f5f6f8;
  --el-fill-color-blank: #ffffff;
  --el-border-color: #dcdfe6;
}

:deep(.el-input__wrapper) {
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  box-shadow: none;
}

:deep(.el-input__wrapper.is-focus) {
  background-color: var(--el-fill-color-blank);
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item__label) {
  padding-bottom: 6px;
  color: var(--el-text-color-secondary);
}

/* 参考稿为简洁风格，隐藏必填星号 */
:deep(.el-form-item.is-required .el-form-item__label::before) {
  display: none;
}
</style>
