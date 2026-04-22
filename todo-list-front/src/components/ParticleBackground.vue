<template>
  <div ref="canvasContainer" class="particle-background"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';

const canvasContainer = ref<HTMLDivElement | null>(null);
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let particles: THREE.Points | null = null;
let animationId: number | null = null;

// 初始化 Three.js 背景
const initThreeBackground = () => {
  if (!canvasContainer.value) return;

  // 创建场景
  scene = new THREE.Scene();

  // 创建相机
  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  canvasContainer.value.appendChild(renderer.domElement);

  // 创建粒子系统
  const particleCount = 1000;
  const particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    // 随机位置
    positions[i] = (Math.random() - 0.5) * 10;
    positions[i + 1] = (Math.random() - 0.5) * 10;
    positions[i + 2] = (Math.random() - 0.5) * 10;

    // 随机颜色（蓝色系）
    colors[i] = 0.2 + Math.random() * 0.3; // R
    colors[i + 1] = 0.5 + Math.random() * 0.3; // G
    colors[i + 2] = 0.8 + Math.random() * 0.2; // B
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 创建粒子材质
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
  });

  // 创建粒子系统
  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate);

    if (particles) {
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  animate();
};

// 处理窗口大小变化
const handleResize = () => {
  if (!canvasContainer.value || !camera || !renderer) return;

  const width = canvasContainer.value.clientWidth;
  const height = canvasContainer.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// 组件挂载时初始化
onMounted(() => {
  initThreeBackground();
  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (canvasContainer.value && renderer?.domElement) {
    canvasContainer.value.removeChild(renderer.domElement);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.particle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style>
