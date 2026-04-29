<template>
  <div class="login-wrapper">
    <div class="login-card">
      <!-- 动态网格背景 -->
      <div class="grid-bg"></div>
      <!-- 光效扫描线 -->
      <div class="light-scan"></div>
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
          <div class="input-wrapper" :class="{ focused: focusedField === 'username' }">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              class="modern-input"
              @focus="focusedField = 'username'"
              @blur="focusedField = ''"
            >
              <template #prefix>
                <div class="input-icon">
                  <i class="el-icon-user"></i>
                </div>
              </template>
            </el-input>
          </div>
        </el-form-item>
        <el-form-item prop="password" class="form-item">
          <div class="input-wrapper" :class="{ focused: focusedField === 'password' }">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              class="modern-input"
              @focus="focusedField = 'password'"
              @blur="focusedField = ''"
            >
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
        <el-text @click="handleWechatLogin" class="link wechat-link">微信登录</el-text>
        <span>|</span>
        <el-text type="primary" @click="onRegisterClick" class="link">立即注册</el-text>
      </div>
    </div>

    <!-- 微信登录二维码模态框（放在组件根级别，避免被父容器样式影响） -->
    <Teleport to="body">
      <el-dialog
        v-model="showWechatQrCode"
        title=""
        width="340px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        class="wechat-dialog"
        @close="clearWechatLoginPolling"
      >
        <div class="wechat-qr-code-container">
          <div class="wechat-icon-wrapper">
            <div class="wechat-icon"></div>
            <div class="wechat-logo-text">微信登录</div>
          </div>
          <div class="qr-code-wrapper">
            <qrcode-vue :value="wechatQrCodeUrl" :size="180" level="H" />
          </div>
          <p
            class="qr-code-status"
            :class="{
              'status-success': wechatLoginStatus === 'success',
              'status-failed': wechatLoginStatus === 'failed',
            }"
          >
            {{ wechatLoginStatusText }}
          </p>
        </div>
      </el-dialog>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { loginApi } from '../api/user';
import { api } from '@/api';
import { encrypt } from '../utils/crypto';
import { updateUserInfoCache } from '../utils/request';
import QrcodeVue from 'qrcode.vue'; // 导入二维码组件

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
const formRef = ref<any>(null);
const focusedField = ref('');

// 状态管理
const showWechatQrCode = ref(false);
const wechatQrCodeUrl = ref('');
const wechatLoginStatus = ref(''); // success, failed, pending
const wechatLoginStatusText = ref('');
const wechatLoginPolling = ref<number | null>(null);
const wechatLoginState = ref(''); // 唯一状态标识

const auth = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
  // 表单验证
  if (!formRef.value) {
    console.log('formRef is null');
    return;
  }

  formRef.value.validate((valid: boolean, invalidFields: any) => {
    if (valid) {
      loading.value = true;
      // 使用立即执行的异步函数
      (async () => {
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
      })();
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

// 微信登录处理
const handleWechatLogin = async () => {
  try {
    // 调用后端接口获取微信登录二维码
    const response = await api.wechat.getLoginQrCode();
    if (response && response.qrCodeUrl && response.state) {
      wechatQrCodeUrl.value = response.qrCodeUrl;
      wechatLoginState.value = response.state;
      wechatLoginStatus.value = 'pending';
      wechatLoginStatusText.value = '请使用微信扫码登录';
      showWechatQrCode.value = true;

      // 开始轮询登录状态
      startWechatLoginPolling();
    }
  } catch (error) {
    console.error('获取微信登录二维码失败:', error);
    ElMessage.error('获取微信登录二维码失败');
  }
};

// 开始轮询登录状态
const startWechatLoginPolling = () => {
  // 清除之前的轮询
  if (wechatLoginPolling.value !== null) {
    clearInterval(wechatLoginPolling.value);
  }

  // 每2秒轮询一次
  wechatLoginPolling.value = window.setInterval(async () => {
    try {
      const response = await api.wechat.checkLoginStatus({ state: wechatLoginState.value });
      if (response) {
        if (response.status === 'success' && response.userInfo) {
          // 登录成功
          wechatLoginStatus.value = 'success';
          wechatLoginStatusText.value = '登录成功，正在跳转...';
          if (wechatLoginPolling.value !== null) {
            clearInterval(wechatLoginPolling.value);
          }

          // 保存用户信息并跳转
          auth.setUserInfo(response.userInfo);
          updateUserInfoCache(response.userInfo);
          await router.push('/');
          showWechatQrCode.value = false;
        } else if (response.status === 'failed') {
          // 登录失败
          wechatLoginStatus.value = 'failed';
          wechatLoginStatusText.value = '登录失败，请重试';
          if (wechatLoginPolling.value !== null) {
            clearInterval(wechatLoginPolling.value);
          }
        }
        // 状态为pending时继续轮询
      }
    } catch (error) {
      console.error('检查微信登录状态失败:', error);
    }
  }, 2000);
};
// 清除微信登录轮询
const clearWechatLoginPolling = () => {
  if (wechatLoginPolling.value !== null) {
    clearInterval(wechatLoginPolling.value);
    wechatLoginPolling.value = null;
  }
};

// 组件卸载时清除轮询
onUnmounted(() => {
  clearWechatLoginPolling();
});
</script>

<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @spacing-md;
  width: 100%;
}

.login-form .el-form-item {
  width: 100%;
  max-width: 320px;
  margin: 0 !important;
}

.login-form .input-wrapper {
  width: 100%;
}

.login-form .modern-input {
  width: 100%;
}

.login-form .el-input__wrapper {
  width: 100% !important;
}

.login-form .el-button {
  width: 100%;
  max-width: 320px;
}

.form-item {
  position: relative;
}

.form-label {
  color: @text-secondary;
  font-size: @font-size-sm;
  margin-bottom: @spacing-xs;
  display: block;
}

.form-input {
  .input-dark();
  width: 100%;
  padding: @spacing-sm @spacing-md;
  height: 40px;
}

.password-toggle {
  position: absolute;
  right: @spacing-md;
  top: 50%;
  transform: translateY(-50%);
  color: @text-muted;
  cursor: pointer;
  transition: color @transition-fast;

  &:hover {
    color: @text-secondary;
  }
}

.login-btn {
  .btn-primary();
  width: 100%;
  height: 40px;
  margin-top: @spacing-sm;
}

.forgot-password {
  text-align: right;
  margin-top: @spacing-xs;

  a {
    color: @accent-blue;
    font-size: @font-size-sm;
    text-decoration: none;

    &:hover {
      color: lighten(@accent-blue, 10%);
      text-decoration: underline;
    }
  }
}

/* 输入框聚焦动画 */
.input-focus {
  animation: inputGlow 0.3s ease-out;
}

@keyframes inputGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(@accent-blue, 0.4);
  }
  100% {
    box-shadow: 0 0 0 10px rgba(@accent-blue, 0);
  }
}

/* 底部链接区域 */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: @spacing-md;
  padding-top: @spacing-md;
  border-top: 1px solid @border-color;

  .link {
    font-size: @font-size-sm;
    cursor: pointer;
    transition: color @transition-fast;

    &:hover {
      opacity: 0.8;
    }
  }

  .wechat-link {
    color: @accent-green !important;
  }

  span {
    color: @text-muted;
  }
}

/* 微信登录弹窗 */
:deep(.wechat-dialog) {
  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 0;
    background: rgba(30, 41, 59, 0.95) !important;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .el-dialog__close {
    color: rgba(255, 255, 255, 0.6);
    font-size: 18px;

    &:hover {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.wechat-qr-code-container {
  padding: 24px;
  text-align: center;
}

.wechat-icon-wrapper {
  margin-bottom: 16px;

  .wechat-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(7, 193, 96, 0.3);
    position: relative;

    /* 微信图标形状 */
    &::before {
      content: '';
      width: 20px;
      height: 20px;
      border: 3px solid #fff;
      border-radius: 50%;
      position: relative;
      box-sizing: border-box;
    }

    /* 微信图标内部图案 */
    &::after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 14px solid #fff;
      top: 30px;
      left: 50%;
      transform: translateX(-50%) rotate(-45deg);
    }
  }

  .wechat-logo-text {
    display: block;
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 600;
  }
}

.qr-code-wrapper {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.qr-code-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;

  &.status-success {
    color: #22c55e;
  }

  &.status-failed {
    color: #ef4444;
  }
}

/* 亮色主题 */
html.light {
  :deep(.wechat-dialog) {
    .el-dialog__body {
      background: #ffffff !important;
      border-color: #e2e8f0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .el-dialog__close {
      color: #64748b;

      &:hover {
        color: #1e293b;
      }
    }
  }

  .wechat-logo-text {
    color: #1e293b;
  }

  .qr-code-status {
    color: #64748b;

    &.status-success {
      color: #16a34a;
    }

    &.status-failed {
      color: #dc2626;
    }
  }

  .login-footer {
    border-top-color: #e2e8f0;

    span {
      color: #64748b;
    }

    .link {
      color: #3b82f6 !important;

      &:hover {
        color: #2563eb !important;
      }
    }

    .wechat-link {
      color: #16a34a !important;

      &:hover {
        color: #15803d !important;
      }
    }
  }
}
</style>