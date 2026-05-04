<template>
  <div class="loading-container" :class="{ visible: visible }">
    <canvas ref="canvasRef"></canvas>
    <div class="loading-icon">
      <div class="loading-ring">
        <div class="ring ring-outer"></div>
        <div class="ring ring-middle"></div>
        <div class="ring ring-inner"></div>
      </div>
    </div>
    <div class="loading-text">
      <span class="text-main">页面内容加载中</span>
      <span class="dots">
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    duration?: number;
  }>(),
  {
    duration: 2000,
  }
);

const emit = defineEmits<{
  complete: [];
}>();

let durationTimer: ReturnType<typeof setTimeout> | null = null;

const canvasRef = ref<HTMLCanvasElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let composer: EffectComposer;
let particles: THREE.Points;
let animationId: number;
let startTime: number;

interface ParticleState {
  idx: number;
  total: number;
  targetRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  size: number;
  startDelay: number;
  initialAngle: number;
}

let particleStates: ParticleState[] = [];

const COLORS = [
  new THREE.Color(0x00cccc),
  new THREE.Color(0xcc00cc),
  new THREE.Color(0x00cc00),
  new THREE.Color(0xcccc00),
  new THREE.Color(0xcc6600),
  new THREE.Color(0x6600cc),
];

const initScene = () => {
  if (!canvasRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0515);

  const width = window.innerWidth;
  const height = window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 400;

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0515, 1);

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.0, 0.4, 0.85);
  bloomPass.threshold = 0;
  bloomPass.strength = 1.0;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  startTime = Date.now();
  createParticles();
  animate();
  window.addEventListener('resize', handleResize);

  // 设置自动消失定时器
  if (durationTimer) clearTimeout(durationTimer);
  durationTimer = setTimeout(() => {
    emit('complete');
  }, props.duration);
};

const createParticles = () => {
  const count = 240; // 从150增加到240
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  particleStates = [];

  // 增加到四层轨道
  const layers = [
    { radius: 100, speed: 0.4, count: 60 }, // 第四层，更靠近中心
    { radius: 160, speed: 0.32, count: 60 },
    { radius: 220, speed: 0.24, count: 60 },
    { radius: 280, speed: 0.16, count: 60 },
  ];

  let idx = 0;
  layers.forEach((layer, layerIdx) => {
    for (let i = 0; i < layer.count; i++) {
      const i3 = idx * 3;
      const t = i / layer.count;

      // 初始角度，均匀分布
      const initialAngle = t * Math.PI * 2 + layerIdx * 0.3;

      // 初始位置在中心
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      particleStates.push({
        idx: idx,
        total: count,
        targetRadius: layer.radius + (Math.random() - 0.5) * 20,
        orbitSpeed: layer.speed * (0.85 + Math.random() * 0.3),
        orbitPhase: initialAngle,
        size: 0.55 + Math.random() * 0.35,
        startDelay: (layerIdx * layer.count + i) * 3,
        initialAngle: initialAngle,
      });

      const color = COLORS[(idx + layerIdx) % COLORS.length];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[idx] = particleStates[idx].size;
      idx++;
    }
  });

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const vertexShader = `
    varying vec3 vColor;
    attribute float size;
    uniform float uTime;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

      float pulse = 0.92 + sin(uTime * 1.5 + position.x * 0.05) * 0.08;
      gl_PointSize = size * 45.0 * pulse * (350.0 / -mvPosition.z);

      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    uniform float uTime;
    void main() {
      vec2 p = gl_PointCoord * 2.0 - 1.0;

      float d1 = abs(p.y - 0.866 * p.x) / 1.732;
      float d2 = abs(p.y + 0.866 * p.x) / 1.732;
      float d3 = abs(p.y + 0.5);

      float dist_to_edge = max(max(d1, d2), d3);
      float dist_to_center = min(min(d1, d2), d3);

      bool inside = dist_to_edge < 0.5;
      float border_width = 0.1;
      float border_dist = abs(dist_to_center - (0.5 - border_width / 2.0));

      if (!inside || border_dist > border_width / 2.0) discard;

      float pulse = 0.93 + sin(uTime * 1.5) * 0.07;
      float edge = smoothstep(border_width / 2.0, 0.0, border_dist);
      float glow = exp(-border_dist * 22.0) * 1.2;

      vec3 edge_color = vColor * 2.0;
      vec3 core_color = vColor * 1.0 + vec3(0.3);
      vec3 final_color = mix(edge_color, core_color, edge);
      final_color = final_color * (edge * 3.0 + glow * 1.5) * pulse;

      float outer_glow = smoothstep(0.43, 0.5, dist_to_edge) * 0.4;
      final_color += vColor * outer_glow * 1.5;

      gl_FragColor = vec4(final_color, edge * 0.8 + 0.25);
    }
  `;

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0.0 },
    },
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
};

const animate = () => {
  animationId = requestAnimationFrame(animate);

  const now = Date.now();
  const elapsed = now - startTime;
  const positions = particles.geometry.attributes.position.array as Float32Array;
  const count = positions.length / 3;

  // 扩散动画持续时间 - 加快速度
  const spreadDuration = 1000; // 1秒

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const state = particleStates[i];

    // 计算当前半径（考虑延迟和动画曲线）
    const adjustedElapsed = Math.max(0, elapsed - state.startDelay);
    const spreadProgress = Math.min(adjustedElapsed / spreadDuration, 1);

    // 使用缓动曲线
    const easedProgress = 1 - Math.pow(1 - spreadProgress, 3);
    const currentRadius = state.targetRadius * easedProgress;

    // 顺时针旋转：散开过程中就开始顺时针旋转，到位后直接匀速
    // 散开阶段旋转速度逐渐增加，到位后保持匀速
    const rotationSpeed = state.orbitSpeed * Math.min(spreadProgress * 2, 1);
    const angle = state.initialAngle - now * 0.001 * rotationSpeed;

    // 计算位置
    const x = Math.cos(angle) * currentRadius;
    const y = Math.sin(angle) * currentRadius;
    const z = 0;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }

  particles.geometry.attributes.position.needsUpdate = true;

  // 整体不旋转
  particles.rotation.y = 0;
  particles.rotation.x = 0;

  // 相机固定
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 400;
  camera.lookAt(0, 0, 0);

  const material = particles.material as THREE.ShaderMaterial;
  material.uniforms.uTime.value = now * 0.001;

  composer.render();
};

const handleResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
};

const cleanup = () => {
  if (animationId) cancelAnimationFrame(animationId);
  if (durationTimer) clearTimeout(durationTimer);
  if (renderer) renderer.dispose();
  if (particles) {
    particles.geometry.dispose();
    (particles.material as THREE.Material).dispose();
  }
  if (composer) composer.dispose();
  window.removeEventListener('resize', handleResize);
};

onMounted(() => {
  if (props.visible) initScene();
});

onUnmounted(() => cleanup());

watch(
  () => props.visible,
  newVal => {
    if (newVal) initScene();
    else cleanup();
  }
);
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0a0515;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
}

.loading-container.visible {
  opacity: 1;
  visibility: visible;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.loading-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.loading-ring {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
}

.loading-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, calc(-50% + 110px));
  z-index: 10;
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 3px;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  text-shadow:
    0 0 8px rgba(0, 204, 204, 0.8),
    0 0 15px rgba(0, 204, 204, 0.6),
    0 0 25px rgba(0, 204, 204, 0.4),
    0 0 40px rgba(204, 0, 204, 0.3);
  animation: textGlow 2s ease-in-out infinite;
}

.text-main {
  background: linear-gradient(135deg, #00cccc 0%, #cc00cc 50%, #00cc00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dots {
  display: inline-block;
  margin-left: 2px;
}

.dot {
  display: inline-block;
  animation: dotPulse 1.5s ease-in-out infinite;
  color: #00cccc;
  text-shadow:
    0 0 6px #00cccc,
    0 0 12px #00cccc;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 4px solid transparent;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring-outer {
  width: 100%;
  height: 100%;
  border-top-color: #00cccc;
  border-right-color: #00cccc;
  box-shadow:
    0 0 12px #00cccc,
    0 0 25px rgba(0, 204, 204, 0.5),
    0 0 35px rgba(0, 204, 204, 0.3);
  animation:
    ringExpandOuter 1s ease-out forwards,
    rotateOuter 3s linear infinite 1s;
}

.ring-middle {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  border-bottom-color: #cc00cc;
  border-left-color: #cc00cc;
  box-shadow:
    0 0 12px #cc00cc,
    0 0 25px rgba(204, 0, 204, 0.5),
    0 0 35px rgba(204, 0, 204, 0.3);
  animation:
    ringExpandMiddle 1s ease-out forwards,
    rotateMiddle 2.2s linear infinite 1s;
}

.ring-inner {
  width: calc(100% - 80px);
  height: calc(100% - 80px);
  border-top-color: #00cc00;
  border-right-color: #00cc00;
  box-shadow:
    0 0 12px #00cc00,
    0 0 25px rgba(0, 204, 0, 0.5),
    0 0 35px rgba(0, 204, 0, 0.3);
  animation:
    ringExpandInner 1s ease-out forwards,
    rotateInner 1.5s linear infinite 1s;
}

@keyframes ringExpandOuter {
  0% {
    width: 20px;
    height: 20px;
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    width: 100%;
    height: 100%;
    opacity: 1;
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes ringExpandMiddle {
  0% {
    width: 15px;
    height: 15px;
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    width: calc(100% - 40px);
    height: calc(100% - 40px);
    opacity: 1;
    transform: translate(-50%, -50%) rotate(-360deg);
  }
}

@keyframes ringExpandInner {
  0% {
    width: 10px;
    height: 10px;
    opacity: 0;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    width: calc(100% - 80px);
    height: calc(100% - 80px);
    opacity: 1;
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes rotateOuter {
  from {
    transform: translate(-50%, -50%) rotate(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(720deg);
  }
}

@keyframes rotateMiddle {
  from {
    transform: translate(-50%, -50%) rotate(-360deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(-720deg);
  }
}

@keyframes rotateInner {
  from {
    transform: translate(-50%, -50%) rotate(360deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(720deg);
  }
}

@keyframes textGlow {
  0%,
  100% {
    opacity: 0.8;
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    filter: brightness(1.2);
  }
}

@keyframes dotPulse {
  0%,
  60%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
