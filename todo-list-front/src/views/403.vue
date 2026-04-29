<template>
  <div class="error-page error-403">
    <ParticleAnimation />
    <div class="error-content">
      <div class="error-info">
        <h1 class="error-code">403</h1>
        <h2 class="error-title">Access Denied</h2>
        <div class="buttons">
          <el-button type="primary" @click="goBack" class="back-button">上一页</el-button>
          <el-button type="primary" @click="goHome" class="home-button">首页</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ParticleAnimation from '../components/ParticleAnimation';
import '@/assets/css/pages/error.css';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/');
};
</script>