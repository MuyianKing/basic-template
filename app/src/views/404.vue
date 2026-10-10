<script setup>
const router = useRouter()

function goHome() {
  router.replace('/')
}

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}
</script>

<template>
  <div class="error-page flex h-full w-full flex-col items-center justify-center overflow-hidden box-border">
    <div class="relative flex flex-col items-center">
      <div class="error-icon absolute -top-10 -right-10 z-10 flex h-24 w-24 items-center justify-center rounded-full text-5xl">
        <i-ant-design-file-search-outlined />
      </div>
      <div class="error-code">
        404
      </div>
      <div class="error-title mt-8">
        页面不存在
      </div>
      <div class="error-desc mt-3">
        抱歉，你访问的页面不存在或已被移除，请检查地址是否正确
      </div>
      <div class="mt-10 flex items-center gap-4">
        <el-button type="primary" size="large" @click="goHome">
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  background: var(--el-bg-color-page);
}

.error-code {
  font-size: clamp(120px, 28vw, 200px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 8px;
  background: linear-gradient(135deg, var(--el-color-primary) 30%, var(--el-color-primary-light-5));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  user-select: none;
}

.error-icon {
  background: var(--el-bg-color);
  color: var(--el-color-primary);
  box-shadow: var(--el-box-shadow-light);
  animation: error-float 3s ease-in-out infinite;
}

@keyframes error-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.error-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
