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

const canvasRef = ref<HTMLCanvasElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particles: THREE.Points;
let animationId: number;
let particlePositions: Float32Array;
let particleVelocities: Float32Array;
let lineMesh: THREE.LineSegments;

const initScene = () => {
  if (!canvasRef.value || !props.visible) return;

  const container = canvasRef.value;
  const width = window.innerWidth;
  const height = window.innerHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 120;

  renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x0a0a1a, 1);

  createParticles();
  createParticleLines();

  animate();

  setTimeout(() => {
    emit('complete');
  }, props.duration);
};

const createParticles = () => {
  const particleCount = 300;
  const geometry = new THREE.BufferGeometry();
  particlePositions = new Float32Array(particleCount * 3);
  particleVelocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0x3b82f6),
    new THREE.Color(0x8b5cf6),
    new THREE.Color(0xec4899),
    new THREE.Color(0x10b981),
    new THREE.Color(0xf59e0b),
    new THREE.Color(0x06b6d4),
    new THREE.Color(0xa855f7),
  ];

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 60 + Math.random() * 60;

    particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = r * Math.cos(phi);

    particleVelocities[i * 3] = (Math.random() - 0.5) * 0.08;
    particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.08;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 5,
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

const createParticleLines = () => {
  const lineCount = 200;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineCount * 6);

  for (let i = 0; i < lineCount; i++) {
    const i1 = Math.floor(Math.random() * 300);
    const i2 = Math.floor(Math.random() * 300);

    linePositions[i * 6] = particlePositions[i1 * 3];
    linePositions[i * 6 + 1] = particlePositions[i1 * 3 + 1];
    linePositions[i * 6 + 2] = particlePositions[i1 * 3 + 2];
    linePositions[i * 6 + 3] = particlePositions[i2 * 3];
    linePositions[i * 6 + 4] = particlePositions[i2 * 3 + 1];
    linePositions[i * 6 + 5] = particlePositions[i2 * 3 + 2];
  }

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.2,
  });

  lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineMesh);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  if (particles && particlePositions) {
    const positions = particles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < 300; i++) {
      positions[i * 3] += particleVelocities[i * 3];
      positions[i * 3 + 1] += particleVelocities[i * 3 + 1];
      positions[i * 3 + 2] += particleVelocities[i * 3 + 2];

      const dist = Math.sqrt(positions[i * 3] ** 2 + positions[i * 3 + 1] ** 2 + positions[i * 3 + 2] ** 2);
      if (dist > 120) {
        particleVelocities[i * 3] *= -0.8;
        particleVelocities[i * 3 + 1] *= -0.8;
        particleVelocities[i * 3 + 2] *= -0.8;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    particles.rotation.x -= 0.0015;
    particles.rotation.y -= 0.0025;
    particles.rotation.z -= 0.001;

    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.03;
    particles.scale.set(scale, scale, scale);

    camera.position.x = Math.sin(Date.now() * 0.0005) * 5;
    camera.position.y = Math.cos(Date.now() * 0.0003) * 3;
    camera.lookAt(0, 0, 0);
  }

  if (lineMesh) {
    lineMesh.rotation.x -= 0.0015;
    lineMesh.rotation.y -= 0.0025;
    lineMesh.rotation.z -= 0.001;
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
  if (lineMesh) {
    lineMesh.geometry.dispose();
    (lineMesh.material as THREE.Material).dispose();
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