<script setup>
import avatar from '@img/user/avatar.png'
import { logout } from '@server/user'

// 用户名下拉菜单选择事件
const router = useRouter()
const user = useUserStore()

function handleDown(command) {
  if (command === 'loginout') {
    logout()
  } else if (command === 'user') {
    router.push('/user/info')
  }
}
</script>

<template>
  <el-dropdown class="user-name" trigger="click" @command="handleDown">
    <div class="el-dropdown-link inline-flex items-center cursor-pointer">
      <el-avatar :src="avatar" />
      <div class="ml-2">
        <span>{{ user.username }}</span>
      </div>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="loginout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
.el-dropdown-link {
  cursor: pointer;
}

.el-dropdown-menu__item {
  text-align: center;
}
</style>
