<template>
  <div class="error-page error-403">
    <div class="error-content">
      <div class="error-illustration">
        <div ref="container" class="three-container"></div>
      </div>
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
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { initThreeScene, cleanUpThree, createHexagon, startHexagonFloatAnimation } from '../utils/three-utils';
import * as THREE from 'three';

const router = useRouter();
const container = ref<HTMLDivElement | null>(null);
let sceneObj: any = null;
let hexagons: THREE.Line[] = [];

const goBack = () => {
  router.go(-1);
};

const goHome = () => {
  router.push('/');
};

onMounted(() => {
  // 初始化 Three.js
  if (container.value) {
    sceneObj = initThreeScene(container.value);

    // 设置背景颜色
    sceneObj.scene.background = new THREE.Color(0x303243);

    // 创建六边形
    hexagons = [
      createHexagon(sceneObj.scene, 1.5, new THREE.Vector3(-2, 1.5, 0), 0x2196f3, 0), // 蓝色
      createHexagon(sceneObj.scene, 1, new THREE.Vector3(-1.5, -1, 0), 0x4caf50, 1), // 绿色
      createHexagon(sceneObj.scene, 1.2, new THREE.Vector3(0.5, 0, 0), 0xff9800, 2), // 橙色
      createHexagon(sceneObj.scene, 0.8, new THREE.Vector3(2.5, 1.5, 0), 0x9c27b0, 3), // 紫色
      createHexagon(sceneObj.scene, 0.7, new THREE.Vector3(0.5, -2.5, 0), 0xf44336, 4), // 红色
    ];

    // 开始六边形浮动动画
    sceneObj.animationId = startHexagonFloatAnimation(sceneObj.scene, sceneObj.camera, sceneObj.renderer, hexagons);
  }
});

onUnmounted(() => {
  if (sceneObj) {
    cleanUpThree(sceneObj.renderer, sceneObj.animationId);
  }
});
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

.error-illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.three-container {
  width: 100%;
  height: 400px;
  max-width: 400px;
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
