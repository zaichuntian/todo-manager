<template>
  <div class="refresh-animation" v-if="visible">
    <canvas ref="canvasRef"></canvas>
    <div class="loading-content">
      <div class="loading-ring"></div>
      <div class="loading-text">
        <span class="bounce-text">
          <span class="char" style="animation-delay: 0s">页</span>
          <span class="char" style="animation-delay: 0.4s">面</span>
          <span class="char" style="animation-delay: 0.8s">内</span>
          <span class="char" style="animation-delay: 1.2s">容</span>
          <span class="char" style="animation-delay: 1.6s">加</span>
          <span class="char" style="animation-delay: 2s">载</span>
          <span class="char" style="animation-delay: 2.4s">中</span>
        </span>
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

// 类型定义
type ParticleConfig = {
  count: number;
  minRadius: number;
  maxRadius: number;
  velocity: number;
  size: number;
};

type LineConfig = {
  count: number;
  maxDistance: number;
};

// 常量配置
const PARTICLE_CONFIG: ParticleConfig = {
  count: 300,
  minRadius: 60,
  maxRadius: 120,
  velocity: 0.08,
  size: 5,
};

const LINE_CONFIG: LineConfig = {
  count: 800, // 增加连线数量
  maxDistance: 80, // 减小最大距离，只连接邻近粒子
};

const COLORS = [
  new THREE.Color(0x3b82f6), // blue
  new THREE.Color(0x8b5cf6), // purple
  new THREE.Color(0xec4899), // pink
  new THREE.Color(0x10b981), // green
  new THREE.Color(0xf59e0b), // yellow
  new THREE.Color(0x06b6d4), // cyan
  new THREE.Color(0xa855f7), // violet
];

// Props & Emits
const props = withDefaults(
  defineProps<{
    visible: boolean;
    duration?: number;
  }>(),
  {
    duration: 5000,
  }
);

const emit = defineEmits<{
  (e: 'complete'): void;
}>();

// Refs
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Three.js Objects
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particles: THREE.Points;
let animationId: number;
let particlePositions: Float32Array;
let particleVelocities: Float32Array;
let lineMesh: THREE.LineSegments;

/**
 * 初始化Three.js场景
 */
const initScene = () => {
  if (!canvasRef.value || !props.visible) return;

  const container = canvasRef.value;
  const { width, height } = getViewportSize();

  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 120;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x0a0a1a, 1);

  // 创建粒子系统
  createParticles();
  createParticleLines();

  // 开始动画
  animate();

  // 设置完成回调
  setTimeout(() => {
    emit('complete');
  }, props.duration);
};

/**
 * 获取视口尺寸
 */
const getViewportSize = (): { width: number; height: number } => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

/**
 * 创建粒子系统
 */
const createParticles = () => {
  const { count, minRadius, maxRadius, velocity, size } = PARTICLE_CONFIG;
  const geometry = new THREE.BufferGeometry();
  particlePositions = new Float32Array(count * 3);
  particleVelocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // 球形分布
    const { x, y, z } = generateSphericalPosition(minRadius, maxRadius);
    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    // 随机速度
    particleVelocities[i * 3] = (Math.random() - 0.5) * velocity;
    particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * velocity;
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * velocity;

    // 随机颜色
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
};

/**
 * 生成球形分布位置
 */
const generateSphericalPosition = (minRadius: number, maxRadius: number): { x: number; y: number; z: number } => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = minRadius + Math.random() * (maxRadius - minRadius);

  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
};

/**
 * 创建粒子连线（每个粒子连接到最近的几个粒子）
 */
const createParticleLines = () => {
  const { count, maxDistance } = LINE_CONFIG;
  const { count: particleCount } = PARTICLE_CONFIG;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(count * 6);

  // 为每个粒子寻找邻近粒子并创建连线
  const usedPairs = new Set<string>();
  let lineIndex = 0;

  for (let i = 0; i < particleCount && lineIndex < count; i++) {
    // 找到距离当前粒子最近的粒子
    const neighbors = findNearestNeighbors(i, particleCount, maxDistance);

    for (const neighborIndex of neighbors) {
      if (lineIndex >= count) break;

      // 避免重复连线
      const pairKey = [i, neighborIndex].sort((a, b) => a - b).join('-');
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);

      // 设置连线位置
      setLinePosition(linePositions, lineIndex, i, neighborIndex);
      lineIndex++;
    }
  }

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x4f46e5,
    transparent: true,
    opacity: 0.25,
  });

  lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineMesh);
};

/**
 * 找到距离指定粒子最近的几个粒子
 */
const findNearestNeighbors = (
  index: number,
  particleCount: number,
  maxDistance: number
): number[] => {
  const neighbors: { index: number; distance: number }[] = [];
  const x1 = particlePositions[index * 3];
  const y1 = particlePositions[index * 3 + 1];
  const z1 = particlePositions[index * 3 + 2];

  for (let i = 0; i < particleCount; i++) {
    if (i === index) continue;

    const x2 = particlePositions[i * 3];
    const y2 = particlePositions[i * 3 + 1];
    const z2 = particlePositions[i * 3 + 2];

    const distance = Math.sqrt(
      Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
    );

    if (distance < maxDistance) {
      neighbors.push({ index: i, distance });
    }
  }

  // 按距离排序，取最近的5个
  neighbors.sort((a, b) => a.distance - b.distance);
  return neighbors.slice(0, 5).map(n => n.index);
};

/**
 * 设置连线位置
 */
const setLinePosition = (
  linePositions: Float32Array,
  lineIndex: number,
  p1Index: number,
  p2Index: number
): void => {
  const offset = lineIndex * 6;
  linePositions[offset] = particlePositions[p1Index * 3];
  linePositions[offset + 1] = particlePositions[p1Index * 3 + 1];
  linePositions[offset + 2] = particlePositions[p1Index * 3 + 2];
  linePositions[offset + 3] = particlePositions[p2Index * 3];
  linePositions[offset + 4] = particlePositions[p2Index * 3 + 1];
  linePositions[offset + 5] = particlePositions[p2Index * 3 + 2];
};

/**
 * 动画循环
 */
const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (particles && particlePositions) {
    updateParticles();
    updateCamera();
  }

  if (lineMesh) {
    updateLines();
  }

  renderer.render(scene, camera);
};

/**
 * 更新粒子位置和旋转
 */
const updateParticles = (): void => {
  const { count } = PARTICLE_CONFIG;
  const { maxDistance } = LINE_CONFIG;
  const positions = particles.geometry.attributes.position.array as Float32Array;

  for (let i = 0; i < count; i++) {
    // 更新位置
    positions[i * 3] += particleVelocities[i * 3];
    positions[i * 3 + 1] += particleVelocities[i * 3 + 1];
    positions[i * 3 + 2] += particleVelocities[i * 3 + 2];

    // 边界检测
    const dist = Math.sqrt(
      positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2
    );
    if (dist > maxDistance) {
      particleVelocities[i * 3] *= -0.8;
      particleVelocities[i * 3 + 1] *= -0.8;
      particleVelocities[i * 3 + 2] *= -0.8;
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;

  // 顺时针旋转
  particles.rotation.x -= 0.0015;
  particles.rotation.y -= 0.0025;
  particles.rotation.z -= 0.001;

  // 呼吸缩放
  const scale = 1 + Math.sin(Date.now() * 0.001) * 0.03;
  particles.scale.set(scale, scale, scale);
};

/**
 * 更新相机位置
 */
const updateCamera = (): void => {
  camera.position.x = Math.sin(Date.now() * 0.0005) * 5;
  camera.position.y = Math.cos(Date.now() * 0.0003) * 3;
  camera.lookAt(0, 0, 0);
};

/**
 * 更新连线旋转
 */
const updateLines = (): void => {
  lineMesh.rotation.x -= 0.0015;
  lineMesh.rotation.y -= 0.0025;
  lineMesh.rotation.z -= 0.001;
};

/**
 * 处理窗口resize
 */
const handleResize = (): void => {
  if (!canvasRef.value) return;

  const { width, height } = getViewportSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

onMounted(() => {
  initScene();
  window.addEventListener('resize', handleResize);
});

/**
 * 清理资源
 */
const cleanup = (): void => {
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
  if (lineMesh) {
    lineMesh.geometry.dispose();
    (lineMesh.material as THREE.Material).dispose();
  }
  window.removeEventListener('resize', handleResize);
};

onMounted(() => {
  initScene();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  cleanup();
});
</script>

<style scoped>
.refresh-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0a0a1a;
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

.bounce-text {
  display: flex;
  gap: 2px;
}

.char {
  display: inline-block;
  animation: charBounce 2.8s ease-in-out infinite;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  letter-spacing: 4px;
}

@keyframes charBounce {
  0%, 100% {
    transform: translateY(0);
    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
  }
  10% {
    transform: translateY(-12px) scale(1.1);
    filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.8));
  }
  20% {
    transform: translateY(0);
    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
  }
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