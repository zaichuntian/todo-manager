<template>
  <div class="particle-star-container" :class="{ 'light-theme': themeStore.isLight, 'dark-theme': themeStore.isDark }">
    <div class="three-bg" ref="threeBg"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();

const threeBg = ref<HTMLElement | null>(null);

// Three.js 相关
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let particles: THREE.Points | null = null;

// 暗色主题粒子颜色 - 明亮的蓝色
const DARK_COLOR = 0x409eff;
// 亮色主题粒子颜色 - 中等蓝色，更明显
const LIGHT_COLOR = 0x60a5fa;

// 根据主题获取粒子颜色
const getParticleColor = () => {
  return themeStore.isDark ? DARK_COLOR : LIGHT_COLOR;
};

// 根据主题获取粒子大小
const getParticleSize = () => {
  return themeStore.isDark ? 0.02 : 0.025;
};

// 根据主题获取透明度
const getOpacity = () => {
  return themeStore.isDark ? 0.6 : 0.65;
};

// 根据主题获取粒子数量
const getParticleCount = () => {
  return themeStore.isDark ? 1000 : 1000;
};

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
  const particlesCount = getParticleCount();

  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: getParticleSize(),
    color: getParticleColor(),
    transparent: true,
    opacity: getOpacity(),
    sizeAttenuation: true,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  // 动画循环
  animate();
};

// 更新粒子属性
const updateParticleProperties = () => {
  if (particles && particles.material instanceof THREE.PointsMaterial) {
    particles.material.color.setHex(getParticleColor());
    particles.material.size = getParticleSize();
    particles.material.opacity = getOpacity();
  }
};

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

// 处理窗口大小变化
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

// 监听主题变化
watch(
  () => themeStore.theme,
  () => {
    updateParticleProperties();
  }
);

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
}

/* 暗色主题样式 */
.dark-theme .three-bg {
  opacity: 0.6;
}

/* 亮色主题样式 - 提高透明度 */
.light-theme .three-bg {
  opacity: 0.7;
}
</style>
