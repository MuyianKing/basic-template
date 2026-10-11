<script setup>
import { BASE_URL } from '@app'
import { SEX_OPTIONS } from '@const/common'
import { api } from '@http'
import defaultAvatar from '@img/user/avatar.png'
import { error, success } from '@muyianking/ui'
import { logout, uploadAvatar } from '@server/user'

defineOptions({
  name: 'MuProfileIndex',
})

const activeTab = ref('info')

// 当前用户信息与所属角色/岗位（GET /system/user/profile 返回 { data: 用户, roleGroup, postGroup }）
const userInfo = ref({})
const roleGroup = ref('')
const postGroup = ref('')

// 头像为相对路径时补上接口根地址
const avatarUrl = computed(() => {
  const avatar = userInfo.value.avatar
  if (!avatar) {
    return defaultAvatar
  }
  return avatar.startsWith('http') ? avatar : BASE_URL + avatar
})

async function getInfo() {
  const res = await api.user.profile()
  if (!res?.data) {
    return
  }
  userInfo.value = res.data
  roleGroup.value = res.roleGroup || ''
  postGroup.value = res.postGroup || ''
  Object.assign(infoForm.value, {
    nickName: res.data.nickName,
    phonenumber: res.data.phonenumber,
    email: res.data.email,
    sex: res.data.sex || '0',
  })
}

// ---------------- 基本资料 ----------------

const infoFormRef = ref()
const infoForm = ref({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '0',
})

const infoRules = {
  nickName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { max: 30, message: '用户昵称不能超过30个字符', trigger: 'blur' },
  ],
  phonenumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入用户邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
    { max: 50, message: '用户邮箱不能超过50个字符', trigger: 'blur' },
  ],
}

async function handleSaveInfo() {
  const valid = await infoFormRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }
  const result = await api.user.updateProfile({ ...infoForm.value })
  // 请求失败时 http 已统一弹出错误提示
  if (!result) {
    return
  }
  // 同步昵称到布局头部
  useUserStore().nickname = infoForm.value.nickName
  success('保存成功')
  getInfo()
}

// ---------------- 修改密码 ----------------

const pwdFormRef = ref()
const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const pwdRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 20, message: '新密码长度为5到20个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => (value === pwdForm.value.newPassword ? callback() : callback(new Error('两次输入的密码不一致'))),
      trigger: 'blur',
    },
  ],
}

async function handleSavePwd() {
  const valid = await pwdFormRef.value.validate().catch(() => false)
  if (!valid) {
    return
  }
  const result = await api.user.updatePwd({ oldPassword: pwdForm.value.oldPassword, newPassword: pwdForm.value.newPassword })
  if (!result) {
    return
  }
  success('密码修改成功，请重新登录')
  logout()
}

// ---------------- 头像上传 ----------------

function handleBeforeUpload(file) {
  const isImage = ['image/jpeg', 'image/png'].includes(file.type)
  if (!isImage) {
    error('上传头像图片只能是 JPG/PNG 格式')
    return false
  }
  if (file.size / 1024 / 1024 > 5) {
    error('上传头像图片大小不能超过 5MB')
    return false
  }
  return true
}

async function handleUpload({ file }) {
  const imgUrl = await uploadAvatar(file)
  if (!imgUrl) {
    return
  }
  userInfo.value.avatar = imgUrl
  // 同步头像到布局头部
  useUserStore().avatar = imgUrl
  success('头像上传成功')
}

getInfo()
</script>

<template>
  <div class="h-full flex gap-2 p-2">
    <!-- 左侧：个人信息 -->
    <div class="w-80 shrink-0 h-full overflow-auto bg-[var(--el-bg-color)] px-4 py-5">
      <h2 class="text-base font-bold">个人信息</h2>

      <el-upload class="mt-6 flex justify-center" accept=".jpg, .jpeg, .png" :show-file-list="false" :before-upload="handleBeforeUpload" :http-request="handleUpload">
        <div class="group relative w-25 h-25 rounded-full overflow-hidden cursor-pointer">
          <el-avatar :size="100" :src="avatarUrl" />
          <div class="absolute inset-0 hidden group-hover:flex items-center justify-center bg-[rgba(0,0,0,0.4)] text-white text-xl">
            <i-ep-plus />
          </div>
        </div>
      </el-upload>

      <ul class="mt-8">
        <li class="flex items-center gap-2 py-3 text-sm text-[var(--el-text-color-regular)]">
          <i-ep-user class="text-base" />用户名称
          <span class="ml-auto min-w-0 truncate">{{ userInfo.userName }}</span>
        </li>
        <li class="flex items-center gap-2 py-3 text-sm text-[var(--el-text-color-regular)]">
          <i-ep-iphone class="text-base" />手机号码
          <span class="ml-auto min-w-0 truncate">{{ userInfo.phonenumber }}</span>
        </li>
        <li class="flex items-center gap-2 py-3 text-sm text-[var(--el-text-color-regular)]">
          <i-ep-message class="text-base" />用户邮箱
          <span class="ml-auto min-w-0 truncate">{{ userInfo.email }}</span>
        </li>
        <li class="flex items-center gap-2 py-3 text-sm text-[var(--el-text-color-regular)]">
          <i-ep-office-building class="text-base" />所属部门
          <span class="ml-auto min-w-0 truncate">{{ userInfo.dept?.deptName }}</span>
        </li>
        <li class="flex items-center gap-2 py-3 text-sm text-[var(--el-text-color-regular)]">
          <i-ep-user-filled class="text-base" />所属角色
          <span class="ml-auto min-w-0 truncate">{{ roleGroup }}</span>
        </li>
        <li class="flex items-center gap-2 py-3 text-sm text-[var(--el-text-color-regular)]">
          <i-ep-alarm-clock class="text-base" />创建日期
          <span class="ml-auto min-w-0 truncate">{{ userInfo.createTime }}</span>
        </li>
      </ul>
    </div>

    <!-- 右侧：基本资料 / 修改密码 -->
    <div class="flex-1 min-w-0 h-full overflow-auto bg-[var(--el-bg-color)] px-6 py-5">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本资料" name="info">
          <el-form ref="infoFormRef" :model="infoForm" :rules="infoRules" label-width="80px" class="max-w-[420px]">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="infoForm.nickName" maxlength="30" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phonenumber" maxlength="11">
              <el-input v-model="infoForm.phonenumber" maxlength="11" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="infoForm.email" maxlength="50" />
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="infoForm.sex">
                <el-radio v-for="item in SEX_OPTIONS" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="80px" class="max-w-[420px]">
            <el-form-item label="旧密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password maxlength="20" />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password maxlength="20" />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password maxlength="20" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSavePwd">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
