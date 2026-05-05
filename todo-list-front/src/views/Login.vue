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
import ParticleBackground from '@components/effect/ParticleBackground';
import LoginForm from '@components/auth/LoginForm';
import RegisterForm from '@components/auth/RegisterForm';
import { loginRules, registerRules } from '@utils/validationRules';
import '@styles/pages/login.css';

// 状态管理
const isRegister = ref(false);
const rules = computed(() => (isRegister.value ? registerRules : loginRules));

// 切换卡片
const toggleCard = () => {
  isRegister.value = !isRegister.value;
};
</script>
