<template>
  <div class="particle-star-container">
    <div class="three-bg" ref="threeBg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const threeBg = ref<HTMLElement | null>(null);

// Three.js 相关
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let particles: THREE.Points | null = null;

// 初始化 Three.js 背景
const initThreeBackground = () => {
  if (!threeBg.value) return;

  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // 添加到 DOM
  if (threeBg.value.firstChild) {
    threeBg.value.removeChild(threeBg.value.firstChild);
  }
  threeBg.value.appendChild(renderer.domElement);

  // 创建粒子
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 1000;

  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x409eff,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  // 动画循环
  const animate = () => {
    requestAnimationFrame(animate);
    if (particles) {
      particles.rotation.y += 0.001;
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  animate();
};

// 处理窗口大小变化
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

onMounted(() => {
  initThreeBackground();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  // 清理 Three.js 资源
  if (renderer) {
    renderer.dispose();
  }
  if (particles && particles.geometry) {
    particles.geometry.dispose();
  }
  if (particles && particles.material) {
    (particles.material as THREE.Material).dispose();
  }
});
</script>

<style scoped lang="less">
.particle-star-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.three-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}
</style>
