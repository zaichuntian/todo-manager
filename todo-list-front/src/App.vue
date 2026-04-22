<template>
  <div class="app-container">
    <!-- Three.js 背景 -->
    <div class="bg-container">
      <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    </div>

    <!-- 路由视图 -->
    <div class="content-container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const bgCanvas = ref<HTMLCanvasElement>();

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particles: THREE.Points;
let animationId: number;

// 初始化Three.js场景
const initThree = () => {
  if (!bgCanvas.value) return;

  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: bgCanvas.value,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // 创建粒子
  createParticles();

  // 开始动画
  animate();

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
};

// 创建粒子
const createParticles = () => {
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1500;

  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x409eff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
};

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate);

  particles.rotation.y += 0.001;

  renderer.render(scene, camera);
};

// 处理窗口大小变化
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

onMounted(() => {
  initThree();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
.app-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.bg-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-canvas {
  width: 100%;
  height: 100%;
}

.content-container {
  position: relative;
  z-index: 1;
}
</style>
