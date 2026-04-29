<template>
  <div class="login">
    <!-- Three.js 背景 -->
    <ParticleBackground />

    <div class="login-container">
      <transition name="card-fade" mode="out-in">
        <!-- 登录卡片 -->
        <LoginForm v-if="!isRegister" key="login" :rules="rules" @register="toggleCard" />

        <!-- 注册卡片 -->
        <RegisterForm v-else key="register" :rules="rules" @login="toggleCard" />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ParticleBackground from '../components/ParticleBackground.vue';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import { loginRules, registerRules } from '../utils/validationRules';

// tsparticles-vue3 会自动加载，无需手动调用

// 状态管理
const isRegister = ref(false);
const rules = computed(() => (isRegister.value ? registerRules : loginRules));

// 切换卡片
const toggleCard = () => {
  isRegister.value = !isRegister.value;
};
</script>

<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: @spacing-xl;
}

.login-card {
  .card-dark();
  .card-hover();
  padding: @spacing-xxl;
}

.login-header {
  text-align: center;
  margin-bottom: @spacing-xl;
}

.login-title {
  color: @text-primary;
  font-size: @font-size-xxl;
  font-weight: 700;
  margin: 0 0 @spacing-xs 0;
}

.login-subtitle {
  color: @text-muted;
  font-size: @font-size-sm;
}

.form-toggle {
  .flex-center();
  justify-content: center;
  gap: @spacing-lg;
  margin-bottom: @spacing-xl;
}

.toggle-btn {
  padding: @spacing-sm @spacing-lg;
  border-radius: @radius-md;
  cursor: pointer;
  transition: all @transition-normal;
  font-size: @font-size-sm;
  font-weight: 500;

  &.active {
    background: rgba(@accent-blue, 0.2);
    color: @accent-blue;
    border: 1px solid rgba(@accent-blue, 0.3);
  }

  &.inactive {
    background: transparent;
    color: @text-muted;
    border: 1px solid transparent;

    &:hover {
      color: @text-secondary;
      border-color: @border-color;
    }
  }
}

.form-container {
  min-height: 300px;
}

/* 表单切换动画 */
.form-enter-active,
.form-leave-active {
  transition: all @transition-normal;
}

.form-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.form-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.wechat-login {
  margin-top: @spacing-lg;
  padding-top: @spacing-lg;
  border-top: 1px solid @border-color;
}

.wechat-title {
  text-align: center;
  color: @text-muted;
  font-size: @font-size-sm;
  margin-bottom: @spacing-md;
}

.wechat-qrcode {
  .flex-center();
  gap: @spacing-lg;
}

.qrcode-container {
  .card-dark();
  padding: @spacing-md;
}

.qrcode-tips {
  color: @text-secondary;
  font-size: @font-size-sm;
}
</style>
