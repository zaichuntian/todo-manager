<template>
  <div class="login-card">
    <!-- 动态网格背景 -->
    <div class="grid-bg"></div>
    <!-- 光效扫描线 -->
    <div class="light-scan"></div>
    <div class="login-header">
      <div class="login-icon">
        <div class="icon-circle"></div>
      </div>
      <h2 class="login-title">创建账号</h2>
      <p class="login-subtitle">请设置您的账号和密码</p>
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
        <div class="input-wrapper" :class="{ focused: focusedField === 'username' }">
          <div class="input-icon">
            <User :size="18" />
          </div>
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            class="modern-input"
            @focus="focusedField = 'username'"
            @blur="focusedField = ''"
          />
        </div>
      </el-form-item>
      <el-form-item prop="password" class="form-item">
        <div class="input-wrapper" :class="{ focused: focusedField === 'password' }">
          <div class="input-icon">
            <Lock :size="18" />
          </div>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="modern-input"
            @focus="focusedField = 'password'"
            @blur="focusedField = ''"
          />
        </div>
      </el-form-item>
      <el-form-item prop="confirmPassword" class="form-item">
        <div class="input-wrapper" :class="{ focused: focusedField === 'confirmPassword' }">
          <div class="input-icon">
            <Lock :size="18" />
          </div>
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            class="modern-input"
            @focus="focusedField = 'confirmPassword'"
            @blur="focusedField = ''"
          />
        </div>
      </el-form-item>

      <el-form-item class="form-item">
        <el-button type="primary" class="modern-button" native-type="submit" :loading="loading" ref="registerButton">
          <span class="button-text">注册</span>
        </el-button>
      </el-form-item>
    </el-form>
    <div class="login-footer">
      <span>已有账号？</span>
      <el-text type="primary" @click="onLoginClick" class="link">立即登录</el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { registerApi } from '@api/user';
import { encrypt } from '@utils/crypto';
import { User, Lock } from '@element-plus/icons-vue';
import gsap from 'gsap';

defineProps<{
  rules: any;
}>();

const emit = defineEmits<{
  (e: 'login'): void;
}>();

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});
const loading = ref(false);
const formRef = ref();
const focusedField = ref('');
const registerButton = ref<HTMLElement | null>(null);

const handleSubmit = async () => {
  // 表单验证
  if (!formRef.value) return;

  formRef.value.validate(async (valid: boolean, invalidFields: any) => {
    if (valid) {
      // 手动验证确认密码
      if (form.password !== form.confirmPassword) {
        ElMessage.error('两次输入密码不一致');
        return;
      }

      loading.value = true;
      try {
        // 前端加密密码
        const encryptedPwd = encrypt(form.password);

        // 请求后端
        await registerApi({
          username: form.username,
          password: encryptedPwd,
        });

        ElMessage.success('注册成功');
        // 注册成功后切换到登录页面
        emit('login');
      } catch (err: any) {
        ElMessage.error(err.message || '注册失败');
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

const onLoginClick = () => {
  emit('login');
};

// 页面加载动画
onMounted(() => {
  // 卡片入场动画
  const card = document.querySelector('.login-card');
  if (card) {
    gsap.fromTo(
      card,
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
  }

  // 输入框依次入场
  const inputs = document.querySelectorAll('.form-item');
  gsap.fromTo(
    inputs,
    { opacity: 0, x: -20 },
    {
      opacity: 1,
      x: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: 'power2.out',
    }
  );

  // 按钮弹性入场
  if (registerButton.value) {
    gsap.fromTo(
      registerButton.value,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.5, ease: 'back.out(1.7)' }
    );
  }
});
</script>

<style scoped lang="less">
@import '@/assets/styles/base/variables.less';

.login-form {
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  width: 100%;
  margin: 0;
}

.input-wrapper {
  position: relative;
  width: 100%;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;

  &.focused {
    border-color: rgba(106, 176, 255, 0.6);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 20px rgba(106, 176, 255, 0.15);
  }

  :deep(.el-input__wrapper) {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
  }

  :deep(.el-input__inner) {
    width: 100%;
    height: 48px;
    background: transparent;
    border: none;
    color: @text-primary;
    font-size: 14px;
    padding: 0 16px 0 48px;

    &::placeholder {
      color: @text-muted;
    }

    &:focus {
      box-shadow: none;
      outline: none;
    }
  }
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: @text-muted;
  transition: color 0.3s ease;
  z-index: 1;

  .input-wrapper.focused & {
    color: @accent-blue;
  }
}

.modern-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6ab0ff 0%, #3b82f6 100%);
  border: none;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(106, 176, 255, 0.35);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: @text-muted;
  font-size: 14px;

  .link {
    cursor: pointer;
    color: @accent-blue;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
