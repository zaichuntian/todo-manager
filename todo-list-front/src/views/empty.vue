<template>
  <div class="empty-page">
    <ParticleAnimation :particle-count="2000" background-color="transparent" particle-shape="hexagon" />
    <div class="empty-content">
      <div class="empty-info">
        <div class="empty-icon">
          <el-icon :size="80"><DocumentRemove /></el-icon>
        </div>
        <h2 class="empty-title">No Data</h2>
        <p class="empty-description">There is no data available at the moment.</p>
        <div class="buttons">
          <el-button type="primary" @click="goBack" class="back-button">Go Back</el-button>
          <el-button type="primary" @click="goHome" class="home-button">Go Home</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import ParticleAnimation from '../components/ParticleAnimation';
import { DocumentRemove } from '@element-plus/icons-vue';

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

.empty-page {
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

.empty-content {
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

.empty-info {
  flex: 1;
  text-align: center;
  padding: 20px;
}

.empty-icon {
  margin-bottom: 30px;
  color: white;
  opacity: 0.8;
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

.empty-title {
  font-size: 36px;
  font-weight: bold;
  color: white;
  margin: 0 0 20px 0;
  font-family: 'Arial', sans-serif;
}

.empty-description {
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
:deep(.home-button) {
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
  .empty-content {
    flex-direction: column;
    gap: 40px;
  }

  .empty-title {
    font-size: 28px;
  }

  .empty-description {
    font-size: 16px;
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
