<!-- src/components/LoginForm.vue -->
<template>
  <div class="login-card">
    <div class="login-header">
      <div class="login-icon">
        <div class="icon-circle"></div>
      </div>
      <h2 class="login-title">欢迎回来</h2>
      <p class="login-subtitle">请输入您的账号和密码</p>
    </div>
    <el-form
      @submit.prevent="handleSubmit"
      :show-message="false"
      :rules="rules"
      :model="form"
      ref="formRef"
      class="login-form"
    >
      <el-form-item prop="username" class="form-item">
        <div class="input-wrapper">
          <el-input v-model="form.username" placeholder="请输入用户名" class="modern-input">
            <template #prefix>
              <div class="input-icon">
                <i class="el-icon-user"></i>
              </div>
            </template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item prop="password" class="form-item">
        <div class="input-wrapper">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" class="modern-input">
            <template #prefix>
              <div class="input-icon">
                <i class="el-icon-lock"></i>
              </div>
            </template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item class="form-item">
        <el-button type="primary" class="modern-button" native-type="submit" :loading="loading">
          <span class="button-text">登录</span>
        </el-button>
      </el-form-item>
    </el-form>
    <div class="login-footer">
      <span>还没注册？</span>
      <el-text type="primary" @click="onRegisterClick" class="link">立即注册</el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { loginApi } from '../api/user';
import { encrypt } from '../utils/crypto';
import { updateUserInfoCache } from '../utils/request';

defineProps<{
  rules: any;
}>();

const emit = defineEmits<{
  (e: 'register'): void;
}>();

const form = reactive({
  username: '',
  password: '',
});
const loading = ref(false);
const formRef = ref();

const auth = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
  // 表单验证
  if (!formRef.value) return;

  formRef.value.validate(async (valid: boolean, invalidFields: any) => {
    if (valid) {
      loading.value = true;
      try {
        // 前端加密密码
        const encryptedPwd = encrypt(form.password);

        // 请求后端
        const userInfo = await loginApi({
          username: form.username,
          password: encryptedPwd,
        });

        ElMessage.success('登录成功');
        auth.setUserInfo(userInfo);
        updateUserInfoCache(userInfo); // 更新内存缓存
        await router.push('/');
      } catch (err: any) {
        ElMessage.error(err.message || '登录失败');
      } finally {
        loading.value = false;
      }
    } else {
      // 遍历invalidFields对象，获取第一个错误信息
      for (const field in invalidFields) {
        if (invalidFields[field] && invalidFields[field].length > 0) {
          ElMessage.error(invalidFields[field][0].message);
          break;
        }
      }
    }
  });
};

const onRegisterClick = () => {
  emit('register');
};
</script>

<style scoped>
.login-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 50px 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.6s ease-out;
}

.login-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(64, 158, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: shine 6s linear infinite;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-card:hover::before {
  opacity: 1;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.login-card:hover {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  transform: translateY(-8px);
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  font-size: 14px;
  color: #606266;
}

.link {
  cursor: pointer;
  margin-left: 8px;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #409eff;
  transition: width 0.3s ease;
}

.link:hover::after {
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.login-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #69c0ff 100%);
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.icon-circle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  position: relative;
  z-index: 1;
}

.login-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
  position: relative;
  z-index: 1;
}

.login-form {
  width: 100%;
  position: relative;
  z-index: 1;
}

.form-item {
  margin-bottom: 24px;
  animation: fadeIn 0.6s ease-out;
}

.form-item:nth-child(1) {
  animation-delay: 0.1s;
}

.form-item:nth-child(2) {
  animation-delay: 0.2s;
}

.input-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.input-wrapper:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.modern-input {
  height: 52px;
  font-size: 16px;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  justify-content: center;
}

:deep(.modern-input) .el-input__wrapper {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

:deep(.modern-input) .el-input__inner {
  width: 100%;
  font-size: 16px;
  color: #303133;
  background: transparent;
  text-align: center;
}

.input-icon {
  display: none;
}

.modern-button {
  width: 100%;
  height: 52px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #409eff 0%, #69c0ff 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.modern-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.4);
}

.modern-button:active {
  transform: translateY(0);
}

.button-text {
  position: relative;
  z-index: 1;
  color: #ffffff;
}

.modern-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.modern-button:hover::before {
  left: 100%;
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
</style>
