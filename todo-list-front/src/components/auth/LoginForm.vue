<template>
  <div class="login-wrapper">
    <div class="login-card">
      <!-- 动态网格背景 -->
      <div class="grid-bg"></div>
      <!-- 光效扫描线 -->
      <div class="light-scan"></div>
      <div class="login-header">
        <!-- 用户头像展示（始终显示，有用户信息显示头像，否则显示默认图标） -->
        <div class="user-avatar-wrapper">
          <el-avatar :size="64" :icon="User" :src="auth.userInfo?.avatar" class="user-avatar" />
          <div class="user-name" v-if="auth.userInfo?.username">{{ auth.userInfo.username }}</div>
        </div>
        <h2 class="login-title">欢迎回来</h2>
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
              @focus="handleInputFocus('username', $event)"
              @blur="handleInputBlur('username', $event)"
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
              @focus="handleInputFocus('password', $event)"
              @blur="handleInputBlur('password', $event)"
            />
          </div>
        </el-form-item>
        <el-form-item class="form-item">
          <el-button type="primary" class="modern-button" native-type="submit" :loading="loading" ref="loginButtonRef">
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
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { loginApi } from '@api/user';
import { api } from '@/api';
import { encrypt } from '@utils/crypto';
import { updateUserInfoCache } from '@utils/request';
import QrcodeVue from 'qrcode.vue';
import gsap from 'gsap';
import { User, Lock } from '@element-plus/icons-vue';
import { ElAvatar } from 'element-plus';

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

// GSAP 动画 refs
const loginButtonRef = ref<InstanceType<typeof HTMLButtonElement> | null>(null);

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

  // 使用 Promise 方式处理验证
  const valid = await new Promise<boolean>(resolve => {
    formRef.value!.validate((valid: boolean, invalidFields: any) => {
      if (!valid && invalidFields) {
        // 遍历invalidFields对象，获取第一个错误信息
        for (const field in invalidFields) {
          if (invalidFields[field] && invalidFields[field].length > 0) {
            ElMessage.error(invalidFields[field][0].message);
            break;
          }
        }
      }
      resolve(valid);
    });
  });

  if (!valid) {
    return;
  }

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
};

const onRegisterClick = (): void => {
  emit('register');
};

// 输入框聚焦动画
const handleInputFocus = (field: string, event: FocusEvent): void => {
  focusedField.value = field;

  const target = event.target as HTMLElement;
  const wrapper = target.closest('.input-wrapper') as HTMLElement;

  if (wrapper) {
    gsap.fromTo(
      wrapper,
      { scale: 0.98, boxShadow: 'none' },
      {
        scale: 1,
        boxShadow: '0 0 30px rgba(106, 176, 255, 0.4)',
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
      }
    );

    // 图标脉冲效果
    const icon = wrapper.querySelector('.input-icon');
    if (icon) {
      gsap.fromTo(
        icon,
        { scale: 1 },
        {
          scale: 1.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        }
      );
    }
  }
};

// 输入框失焦动画
const handleInputBlur = (_field: string, event: FocusEvent): void => {
  focusedField.value = '';

  const target = event.target as HTMLElement;
  const wrapper = target.closest('.input-wrapper') as HTMLElement;

  if (wrapper) {
    gsap.to(wrapper, {
      scale: 1,
      boxShadow: 'none',
      duration: 0.3,
      ease: 'power2.out',
    });
  }
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
  if (loginButtonRef.value) {
    gsap.fromTo(
      loginButtonRef.value,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.4, ease: 'back.out(1.7)' }
    );
  }
});

// 微信登录处理
const handleWechatLogin = async (): Promise<void> => {
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
@import '@/assets/styles/base/variables.less';

.login-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

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
  gap: 16px;
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

.wechat-link {
  color: @accent-green;
}
</style>
