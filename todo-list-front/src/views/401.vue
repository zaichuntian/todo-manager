<template>
  <div class="error-page error-401">
    <ParticleAnimation />
    <div class="error-content">
      <div class="error-info">
        <h1 class="error-code">401</h1>
        <h2 class="error-title">Unauthorized Access</h2>
        <p class="error-description">
          You are not authorized to access this resource. Please login with valid credentials.
        </p>
        <div class="buttons">
          <el-button type="primary" @click="goBack" class="back-button">Go Back</el-button>
          <el-button type="primary" @click="goLogin" class="home-button">Go to Login</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ParticleAnimation from '@components/ParticleAnimation';
import '@styles/pages/error.css';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goLogin = () => {
  router.push('/login');
};
</script>
