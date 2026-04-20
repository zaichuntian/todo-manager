<template>
  <div class="login">
    <div class="login-container">
      <transition name="card-fade">
        <!-- 登录卡片 -->
        <el-card v-if="!isRegister" class="login-card">
          <div class="login-header">
            <h2 class="login-title">欢迎登录</h2>
            <p class="login-subtitle">请输入您的账号和密码</p>
          </div>
          <el-form @submit.prevent="handleLogin" :rules="rules" :model="form" ref="formRef" class="login-form">
            <el-form-item prop="username" class="form-item">
              <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" class="login-input" />
            </el-form-item>
            <el-form-item prop="password" class="form-item">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                class="login-input"
              />
            </el-form-item>
            <el-form-item class="form-item">
              <el-button type="primary" class="login-button" native-type="submit" :loading="loading"> 登录 </el-button>
            </el-form-item>
          </el-form>
          <div class="login-footer">
            <span>还没注册，</span>
            <el-text type="primary" @click="toggleCard" class="link">去注册</el-text>
          </div>
        </el-card>

        <!-- 注册卡片 -->
        <el-card v-else class="login-card">
          <div class="login-header">
            <h2 class="login-title">欢迎注册</h2>
            <p class="login-subtitle">请设置您的账号和密码</p>
          </div>
          <el-form
            @submit.prevent="handleRegister"
            :rules="rules"
            :model="registerForm"
            ref="registerFormRef"
            class="login-form"
          >
            <el-form-item prop="username" class="form-item">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                class="login-input"
              />
            </el-form-item>
            <el-form-item prop="password" class="form-item">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                class="login-input"
              />
            </el-form-item>
            <el-form-item class="form-item">
              <el-button type="primary" class="login-button" native-type="submit" :loading="registerLoading">
                注册
              </el-button>
            </el-form-item>
          </el-form>
          <div class="login-footer">
            <span>已有账号，</span>
            <el-text type="primary" @click="toggleCard" class="link">去登录</el-text>
          </div>
        </el-card>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { loginApi, registerApi } from '../api/user';
import { encrypt } from '../utils/crypto';
import { ElMessage } from 'element-plus';

// 状态管理
const isRegister = ref(false);

// 登录表单
const form = reactive({
  username: '',
  password: '',
});
const loading = ref(false);
const formRef = ref();

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
});
const registerLoading = ref(false);
const registerFormRef = ref();

const auth = useAuthStore();
const router = useRouter();

// 验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 20, message: '密码长度应在4-20个字符之间', trigger: 'blur' },
  ],
};

// 切换卡片
const toggleCard = () => {
  isRegister.value = !isRegister.value;
};

// 登录处理
const handleLogin = async () => {
  // 表单验证
  if (!formRef.value) return;

  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true;
      try {
        // ✅ 前端加密密码
        const encryptedPwd = encrypt(form.password);

        // ✅ 请求后端
        const res = await loginApi({
          username: form.username,
          password: encryptedPwd,
        });

        // @ts-ignore
        if (res.code === 200) {
          ElMessage.success('登录成功');
          // @ts-ignore
          auth.setToken(res.data.token);
          // @ts-ignore
          localStorage.setItem('userUuid', res.data.userUuid);
          await router.push('/');
        } else {
          // @ts-ignore
          ElMessage.error(res.msg);
        }
      } catch (err) {
        console.log(err);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 注册处理
const handleRegister = async () => {
  // 表单验证
  if (!registerFormRef.value) return;

  registerFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      registerLoading.value = true;
      try {
        // ✅ 前端加密密码
        const encryptedPwd = encrypt(registerForm.password);

        // ✅ 请求后端
        const res = await registerApi({
          username: registerForm.username,
          password: encryptedPwd,
        });

        // @ts-ignore
        if (res.code === 200) {
          ElMessage.success('注册成功');
          // 注册成功后切换到登录页面
          isRegister.value = false;
        } else {
          // @ts-ignore
          ElMessage.error(res.msg);
        }
      } catch (err) {
        console.log(err);
      } finally {
        registerLoading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 0 20px;
}

.login-card {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.login-card:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}

.link {
  cursor: pointer;
  margin-left: 5px;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* 卡片过渡动画 */
/* 定义冒泡动画 */
@keyframes bubbleUp {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  25% {
    opacity: 0.25;
    transform: translateY(30px);
  }
  50% {
    opacity: 0.5;
    transform: translateY(20px);
  }
  75% {
    opacity: 0.75;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 定义淡出动画 */
@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  25% {
    opacity: 0.75;
    transform: translateY(-7.5px);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-15px);
  }
  75% {
    opacity: 0.25;
    transform: translateY(-22.5px);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
  }
}

.card-fade-enter-active {
  animation: bubbleUp 0.8s linear;
  position: relative;
  z-index: 2;
}

.card-fade-leave-active {
  animation: fadeOut 0.5s linear;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(80px);
}

.card-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-form {
  width: 100%;
}

.form-item {
  margin-bottom: 20px;
}

.login-input {
  height: 48px;
  font-size: 16px;
  border-radius: 14px;
  background: #ffffff;
  transition: all 0.3s ease;
}

:deep(.login-input) .el-input__wrapper {
  border-radius: 14px !important;
}

.login-input:hover {
  border-color: #69c0ff;
  background: #f0f9ff;
  box-shadow: 0 4px 12px rgba(105, 192, 255, 0.3);
  transform: translateY(-1px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0, 1);
}

.login-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #409eff 0%, #69c0ff 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:active {
  transform: translateY(0);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeIn 0.6s ease-out;
}

.form-item {
  animation: fadeIn 0.6s ease-out;
}

.form-item:nth-child(1) {
  animation-delay: 0.1s;
}

.form-item:nth-child(2) {
  animation-delay: 0.2s;
}

.form-item:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
