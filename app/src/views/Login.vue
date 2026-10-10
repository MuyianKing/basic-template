<script setup>
import { WEB_NAME } from '@app'
import { error } from '@muyianking/ui'
import { clearUserData, login } from '@server/user'

defineOptions({
  name: 'UserLoginNoAlive',
})

const router = useRouter()

const form = reactive({
  loginname: '',
  password: '',
})

// 登录
const loginRef = useTemplateRef('loginRef')
async function submitForm() {
  loginRef.value.validate(async (valid) => {
    if (valid) {
      login(form).then((res) => {
        afterLogin(res)
      }).catch((e) => {
        error(e)
      })
    }
  })
}

// 登录成功
const userStore = useUserStore()
function afterLogin(data) {
  userStore.initUser(data)
  router.push('/')
}

onMounted(() => {
  clearUserData()
})
</script>

<template>
  <div class="login-wrapper text-center">
    <div class="login-box-wrapper text-[0px]">
      <div class="main-part">
        <div class="left">
          <img class="max-h-full w-[80%] mx-auto" src="@img/login/left.png">
        </div>
        <div class="right">
          <div class="login-container">
            <div class="w-full text-center text-4xl mb-8">{{ WEB_NAME }}</div>
            <div class="login-form">
              <el-form ref="loginRef" :model="form" label-position="top" size="large">
                <mu-form-item label="账号" prop="loginname" required>
                  <mu-input v-model="form.loginname" placeholder="请输入账号">
                    <template #prefix>
                      <i-iconoir-user class="w-[26px] h-[26px] text-[#409eff]" />
                    </template>
                  </mu-input>
                </mu-form-item>
                <mu-form-item label="密码" prop="password" required>
                  <mu-input v-model="form.password" placeholder="请输入密码" show-password type="password" @keyup.enter="submitForm">
                    <template #prefix>
                      <i-fluent-emoji-high-contrast-locked class="w-[23px] h-[23px] text-[#409eff]" />
                    </template>
                  </mu-input>
                </mu-form-item>
              </el-form>
              <el-button class="login-btn py-0" @click="submitForm">登录</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
* {
  transition: all ease 0.4s;
}

.login-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(@img/login/bg.jpg);
  background-size: cover;

  .login-box-wrapper {
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 72%;
    height: 60%;
  }

  .main-part {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 16px;

    .left {
      width: 60%;
      height: 100%;
      padding: 10px;
      background-image: url(@img/login/left-bg.jpg);
      background-size: 100% 100%;
      background-position: center top;
      background-repeat: no-repeat;

      img {
        position: relative;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .right {
      width: 40%;
      height: 100%;
      background: #fff;

      .login-container {
        position: relative;
        top: 50%;
        transform: translateY(-50%);

        height: fit-content;
        width: 100%;
        padding: 20%;
      }
    }
  }

  .login-btn {
    width: 100%;
    height: 40px;
    line-height: 40px;
    background-image: linear-gradient(to right, rgb(31, 104, 242), rgb(65, 159, 252));
    text-align: center;
    color: white;
    margin-top: 20px;
    border: none;
  }

  img {
    pointer-events: none;
  }
}

@media screen and (max-width: 1000px) {
  .left {
    display: none;
  }

  .login-box-wrapper {
    max-width: 600px !important;
    height: 500px !important;

    & > img {
      height: 100%;
      width: 100%;
    }
  }

  .right {
    width: 100% !important;
    margin: 0 auto;
    background-color: transparent !important;
    background-image: url(@img/login/left-bg.jpg) !important;
    background-size: 100% 100% !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
  }
}

:deep(.mu-form-item__label) {
  width: 100%;
}
</style>
