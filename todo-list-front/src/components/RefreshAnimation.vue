<template>
  <div class="refresh-animation" v-if="visible">
    <canvas ref="canvasRef"></canvas>
    <div class="loading-content">
      <div class="loading-ring"></div>
      <div class="loading-text">
        <span>页面内容加载中</span>
        <span class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits, withDefaults } from 'vue';
import * as THREE from 'three';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    duration?: number; // 动画持续时间（毫秒）
  }>(),
  {
    duration: 5000, // 默认5秒
  }
);

const emit = defineEmits<{
  (e: 'complete'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particles: THREE.Points;
let animationId: number;


const initScene = () => {
  if (!canvasRef.value || !props.visible) return;

  const container = canvasRef.value;
  const width = window.innerWidth;
  const height = window.innerHeight;

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f172a);

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 100;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  // 创建粒子
  createParticles();

  // 开始动画
  animate();

  // 设置完成回调
  setTimeout(() => {
    emit('complete');
  }, props.duration);
};

const createParticles = () => {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const colorPalette = [
    new THREE.Color(0x3b82f6), // blue
    new THREE.Color(0x8b5cf6), // purple
    new THREE.Color(0xec4899), // pink
    new THREE.Color(0x10b981), // green
    new THREE.Color(0xf59e0b), // yellow
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 4 + 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 4,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (particles) {
    // 顺时针旋转动画
    particles.rotation.x -= 0.002;
    particles.rotation.y -= 0.003;
    particles.rotation.z -= 0.001;

    // 轻微缩放动画
    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
    particles.scale.set(scale, scale, scale);
  }

  renderer.render(scene, camera);
};

const handleResize = () => {
  if (!canvasRef.value) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

onMounted(() => {
  initScene();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (renderer) {
    renderer.dispose();
  }
  if (particles) {
    particles.geometry.dispose();
    (particles.material as THREE.Material).dispose();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.refresh-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0f172a;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.loading-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-ring {
  width: 80px;
  height: 80px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #ffffff;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: dotPulse 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>