<template>
  <div class="error-page error-401">
    <ParticleAnimation :particle-count="2500" background-color="transparent" particle-shape="hexagon" />
    <div class="error-content">
      <div class="error-info">
        <h1 class="error-code">401</h1>
        <h2 class="error-title">Unauthorized Access</h2>
        <p class="error-description">
          You are not authorized to access this resource. Please login with valid credentials.
        </p>
        <div class="buttons">
          <el-button type="primary" @click="goBack" class="back-button">Go Back</el-button>
          <el-button type="primary" @click="goLogin" class="login-button">Go to Login</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ParticleAnimation from '../components/ParticleAnimation';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goLogin = () => {
  router.push('/login');
};
</script>

<style scoped lang="less">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.error-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #304156;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
  max-width: 900px;
  width: 90%;
  position: relative;
  z-index: 10;
}

:deep(.particle-animation) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.error-info {
  flex: 1;
  text-align: center;
  padding: 20px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: white;
  margin: 0 0 20px 0;
  font-family: 'Arial', sans-serif;
  letter-spacing: 10px;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

.error-title {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
  font-weight: 400;
}

.error-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 40px 0;
  line-height: 1.5;
}

.buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

:deep(.back-button),
:deep(.login-button) {
  padding: 10px 40px;
  font-size: 16px;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: none;
  border: 2px solid #4caf50;
  background-color: white;
  color: #4caf50;
  opacity: 1 !important;
  transform: translate(0px, 0px) !important;
  cursor: pointer;

  &:hover {
    transform: translate(0px, 0px) !important;
    box-shadow: none;
    background-color: #4caf50;
    color: white;
  }
}

@media (max-width: 768px) {
  .error-content {
    flex-direction: column;
    gap: 40px;
  }

  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 20px;
  }

  .buttons {
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  :deep(.back-button),
  :deep(.login-button) {
    width: 100%;
    max-width: 200px;
  }
}
</style>
