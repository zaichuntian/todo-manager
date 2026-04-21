<template>
  <div class="error-page error-403">
    <ParticleAnimation :particle-count="2500" background-color="transparent" particle-shape="hexagon" />
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

const router = useRouter();

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/');
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
  background: #303243;
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
  z-index: 2;
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
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin: 0 0 40px 0;
  font-weight: 400;
}

.buttons {
  display: flex;
  gap: 20px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

:deep(.back-button),
:deep(.home-button) {
  width: 108px;
  height: 32px;
  padding: 10px 30px;
  font-size: 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: none;
  background-color: #fff;
  color: #4caf50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  opacity: 1 !important;
  transform: translate(0px, 0px) !important;
  cursor: pointer;
  font-weight: bolder;

  &:hover {
    transform: translate(0px, 0px) !important;
    box-shadow: 0 2px 50px 15px #4caf50;
    color: white;
    background-color: #4caf50;
  }
}

@media (max-width: 768px) {
  .error-content {
    flex-direction: column;
    gap: 40px;
  }

  .error-info {
    text-align: center;
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
  :deep(.home-button) {
    width: 100%;
    max-width: 200px;
  }
}
</style>
