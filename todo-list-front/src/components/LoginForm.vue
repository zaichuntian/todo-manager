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
        <el-text type="success" @click="handleWechatLogin" class="link wechat-link">微信登录</el-text>
        <el-text type="primary" @click="onRegisterClick" class="link register-link">立即注册</el-text>
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
  .flex-wrap();
  flex-direction: column;
  gap: @spacing-md;
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
</style>
