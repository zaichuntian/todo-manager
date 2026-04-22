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

// 状态管理
const isRegister = ref(false);
const rules = computed(() => (isRegister.value ? registerRules : loginRules));

// 切换卡片
const toggleCard = () => {
  isRegister.value = !isRegister.value;
};
</script>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
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

/* 卡片过渡动画 */
/* 定义冒泡动画 */
@keyframes bubbleUp {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 定义淡出动画 */
@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}

.card-fade-enter-active {
  animation: bubbleUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
}

.card-fade-leave-active {
  animation: fadeOut 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.card-fade-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

.card-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
