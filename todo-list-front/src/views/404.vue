<template>
  <div class="error-page error-404">
    <ParticleAnimation />
    <div class="error-content">
      <div class="error-info">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Not Found</h2>
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
import '@/assets/styles/pages/404.css';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/');
};
</script>
