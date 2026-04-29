<template>
  <div class="refresh-animation" v-if="visible">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits, withDefaults } from 'vue';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  VignetteEffect,
  NoiseEffect,
  BlendFunction,
} from 'postprocessing';

// 常量配置
const PARTICLE_COUNT = 180;
const PARTICLE_MIN_RADIUS = 80;
const PARTICLE_MAX_RADIUS = 180;
const PARTICLE_SIZE = 5;
const LINE_COUNT = 400;

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
let composer: EffectComposer;
let particles: THREE.Points;
let glowParticles: THREE.Points;
let textMesh: THREE.Mesh;
let animationId: number;
let particlePositions: Float32Array;
let lineMesh: THREE.LineSegments;

// 旋转速度控制
const isMouseInWindow = ref(true);

// 螺旋运动参数
let spiralAngle = 0;
let animationTime = 0;
let forwardProgress = 0;

// GSAP 时间线
let animationTimeline: gsap.core.Timeline | null = null;

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

  // 添加雾效增强深度感
  scene.fog = new THREE.Fog(0x0a0a1a, 100, 250);

  // 创建相机
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 120;

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x0a0a1a, 1);

  // 创建后期处理合成器
  composer = new EffectComposer(renderer);

  // 添加渲染通道
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // 添加光晕效果
  const bloomEffect = new BloomEffect({
    blendFunction: BlendFunction.SCREEN,
    intensity: 1.8,
    width: 4,
    height: 4,
    kernelSize: 3,
    luminanceThreshold: 0.3,
    luminanceSmoothing: 0.2,
  });

  // 添加暗角效果
  const vignetteEffect = new VignetteEffect({
    offset: 0.4,
    darkness: 0.35,
  });

  // 添加噪点效果
  const noiseEffect = new NoiseEffect({
    blendFunction: BlendFunction.OVERLAY,
    premultiply: true,
  });
  noiseEffect.blendMode.opacity.value = 0.03;

  // 创建效果通道
  const effectPass = new EffectPass(camera, bloomEffect, vignetteEffect, noiseEffect);
  effectPass.renderToScreen = true;
  composer.addPass(effectPass);

  // 创建粒子系统
  createParticles();
  createParticleLines();

  // 创建3D文字
  create3DText();

  // 创建GSAP动画时间线
  createGSAPAnimations();

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
 * 创建三角形粒子系统（带霓虹灯光晕效果）
 */
const createParticles = () => {
  const count = PARTICLE_COUNT;
  const minRadius = PARTICLE_MIN_RADIUS;
  const maxRadius = PARTICLE_MAX_RADIUS;
  const size = PARTICLE_SIZE;

  // 创建核心粒子
  const coreGeometry = new THREE.BufferGeometry();
  particlePositions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // 螺旋分布 - 从中心向外扩散
    const angle = (i / count) * Math.PI * 2;
    const radius = minRadius + (maxRadius - minRadius) * Math.sqrt(i / count);

    particlePositions[i * 3] = Math.cos(angle) * radius;
    particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;

    // 随机颜色
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    // 初始透明度
    opacities[i] = 0.7 + Math.random() * 0.3;
  }

  coreGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  coreGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 创建三角形纹理
  const triangleTexture = createTriangleTexture();
  for (let i = 0; i < count; i++) {
    opacities[i] = 0.8;
  }

  // 核心粒子材质
  const coreMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size * 4 },
    },
    vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uSize;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      uniform float uTime;
      void main() {
        // 创建完整的空心三角形
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        
        // 旋转
        float angle = uTime * 0.3 + gl_FragCoord.x * 0.01;
        float ca = cos(angle);
        float sa = sin(angle);
        vec2 pp = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);
        
        // 等边三角形顶点
        vec2 v1 = vec2(0.0, 0.866);
        vec2 v2 = vec2(-0.866, -0.433);
        vec2 v3 = vec2(0.866, -0.433);
        
        // 计算到三条边的距离
        float d1 = abs((pp.y - v1.y) * (v2.x - v1.x) - (pp.x - v1.x) * (v2.y - v1.y));
        float d2 = abs((pp.y - v2.y) * (v3.x - v2.x) - (pp.x - v2.x) * (v3.y - v2.y));
        float d3 = abs((pp.y - v3.y) * (v1.x - v3.x) - (pp.x - v3.x) * (v1.y - v3.y));
        
        float area = abs((v2.x - v1.x) * (v3.y - v1.y) - (v3.x - v1.x) * (v2.y - v1.y));
        float dist = (d1 + d2 + d3) / area;
        
        // 检查是否在三角形内
        float bary1 = ((v2.y - v3.y) * (pp.x - v3.x) + (v3.x - v2.x) * (pp.y - v3.y)) / area;
        float bary2 = ((v3.y - v1.y) * (pp.x - v3.x) + (v1.x - v3.x) * (pp.y - v3.y)) / area;
        float bary3 = 1.0 - bary1 - bary2;
        float inside = step(0.0, bary1) * step(0.0, bary2) * step(0.0, bary3);
        
        // 边框效果
        float borderWidth = 0.12;
        float border = smoothstep(borderWidth - 0.02, borderWidth + 0.02, dist);
        float triangle = inside * (1.0 - border);

        // 闪烁效果
        float flicker = 0.85 + sin(uTime * 2.5 + gl_FragCoord.y * 0.03) * 0.15;

        gl_FragColor = vec4(vColor * flicker, triangle);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particles = new THREE.Points(coreGeometry, coreMaterial);
  scene.add(particles);

  // 创建霓虹灯光晕层（外层发光）
  const glowGeometry = new THREE.BufferGeometry();
  glowGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  glowGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // 光晕材质（更大、更透明）
  const glowMaterial = new THREE.PointsMaterial({
    size: size * 15,
    vertexColors: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    map: triangleTexture,
    alphaTest: 0.03,
  });

  glowParticles = new THREE.Points(glowGeometry, glowMaterial);
  scene.add(glowParticles);
};

/**
 * 创建粒子连线（动态连接到当前粒子位置）
 */
const createParticleLines = () => {
  const count = LINE_COUNT;
  const particleCount = PARTICLE_COUNT;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(count * 6);
  const lineColors = new Float32Array(count * 6);

  // 为每个粒子连接到下一个粒子（形成螺旋链条）
  for (let i = 0; i < count; i++) {
    const startIndex = i % particleCount;
    const endIndex = (i + Math.floor(Math.random() * 5) + 1) % particleCount;

    // 初始化位置
    linePositions[i * 6] = particlePositions[startIndex * 3];
    linePositions[i * 6 + 1] = particlePositions[startIndex * 3 + 1];
    linePositions[i * 6 + 2] = particlePositions[startIndex * 3 + 2];
    linePositions[i * 6 + 3] = particlePositions[endIndex * 3];
    linePositions[i * 6 + 4] = particlePositions[endIndex * 3 + 1];
    linePositions[i * 6 + 5] = particlePositions[endIndex * 3 + 2];

    // 使用粒子颜色作为线段颜色
    const colorIndex = Math.floor(Math.random() * COLORS.length);
    const color = COLORS[colorIndex];
    lineColors[i * 6] = color.r * 0.8;
    lineColors[i * 6 + 1] = color.g * 0.8;
    lineColors[i * 6 + 2] = color.b * 0.8;
    lineColors[i * 6 + 3] = color.r * 1.2;
    lineColors[i * 6 + 4] = color.g * 1.2;
    lineColors[i * 6 + 5] = color.b * 1.2;
  }

  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

  // 创建发光线材质
  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineMesh);
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

  // 使用后期处理合成器渲染
  composer.render();
};

/**
 * 更新粒子位置
 */
const updateParticles = (): void => {
  const count = PARTICLE_COUNT;
  const lineCount = LINE_COUNT;
  const positions = particles.geometry.attributes.position.array as Float32Array;

  // 更新螺旋角度
  spiralAngle += 0.008;

  // 更新着色器时间
  const coreMaterial = particles.material as THREE.ShaderMaterial;
  coreMaterial.uniforms.uTime.value += 0.05;

  // 更新粒子大小（随前进进度增加）
  const sizeProgress = Math.min(1, forwardProgress * 2);
  coreMaterial.uniforms.uSize.value = PARTICLE_SIZE * 4 * (1 + sizeProgress);

  // 更新线段位置（动态跟随粒子）更新前进进度（降低速度）
  forwardProgress += 0.0008;

  for (let i = 0; i < count; i++) {
    // 粒子初始位置（在远处）
    const initialZ = -120 - (i / count) * 180;

    // 顺时针螺旋运动
    const angle = spiralAngle + (i / count) * Math.PI * 6;
    const radius = 50 + (i / count) * 80 + Math.sin(spiralAngle * 0.2 + i * 0.03) * 8;

    // 计算当前Z位置（向相机移动）
    const progress = (forwardProgress * 2 + i / count) % 1;
    const currentZ = initialZ + progress * 250; // 从-200移动到50

    // 当接近相机时放大
    const scaleFactor = 1 + Math.max(0, (currentZ + 80) / 120) * 1.5;

    positions[i * 3] = Math.cos(angle) * radius * scaleFactor;
    positions[i * 3 + 1] = Math.sin(angle) * radius * scaleFactor;
    positions[i * 3 + 2] = currentZ + Math.sin(animationTime * 0.003 + i * 0.015) * 3;
  }

  particles.geometry.attributes.position.needsUpdate = true;

  // 更新光晕层位置
  if (glowParticles) {
    const glowPositions = glowParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      glowPositions[i * 3] = positions[i * 3];
      glowPositions[i * 3 + 1] = positions[i * 3 + 1];
      glowPositions[i * 3 + 2] = positions[i * 3 + 2];
    }
    glowParticles.geometry.attributes.position.needsUpdate = true;

    // 光晕层独立缩放（更大的脉动）
    const glowScale = 1 + Math.sin(animationTime * 0.002) * 0.1;
    glowParticles.scale.set(glowScale, glowScale, glowScale);
  }

  // 更新线段位置（动态跟随粒子）
  if (lineMesh) {
    const linePositions = lineMesh.geometry.attributes.position.array as Float32Array;
    const lineColors = lineMesh.geometry.attributes.color.array as Float32Array;

    for (let i = 0; i < lineCount; i++) {
      const startIndex = i % count;
      const endIndex = (i + Math.floor(i * 0.15) + 2) % count; // 连接更远的粒子

      linePositions[i * 6] = positions[startIndex * 3];
      linePositions[i * 6 + 1] = positions[startIndex * 3 + 1];
      linePositions[i * 6 + 2] = positions[startIndex * 3 + 2];
      linePositions[i * 6 + 3] = positions[endIndex * 3];
      linePositions[i * 6 + 4] = positions[endIndex * 3 + 1];
      linePositions[i * 6 + 5] = positions[endIndex * 3 + 2];

      // 动态颜色变化（流动彩虹效果）
      const colorIndex = Math.floor((i + animationTime * 0.15) % COLORS.length);
      const color = COLORS[colorIndex];
      const brightness = 0.7 + Math.sin(animationTime * 0.015 + i * 0.08) * 0.5;

      lineColors[i * 6] = color.r * brightness;
      lineColors[i * 6 + 1] = color.g * brightness;
      lineColors[i * 6 + 2] = color.b * brightness;
      lineColors[i * 6 + 3] = color.r * brightness * 1.6;
      lineColors[i * 6 + 4] = color.g * brightness * 1.6;
      lineColors[i * 6 + 5] = color.b * brightness * 1.6;
    }
    lineMesh.geometry.attributes.position.needsUpdate = true;
    lineMesh.geometry.attributes.color.needsUpdate = true;
    lineMesh.rotation.copy(particles.rotation);
  }

  // 根据鼠标状态调整旋转速度
  const speed = isMouseInWindow.value ? 0.3 : 1;

  // 顺时针旋转（围绕Z轴）
  particles.rotation.z += 0.001 * speed;

  // 添加X和Y轴的轻微摆动
  particles.rotation.x = Math.sin(animationTime * 0.001) * 0.1;
  particles.rotation.y = Math.cos(animationTime * 0.0015) * 0.1;

  // 光晕层同步旋转
  if (glowParticles) {
    glowParticles.rotation.copy(particles.rotation);
  }

  // 呼吸缩放（更明显的脉动效果）
  const scale = 1 + Math.sin(animationTime * 0.003) * 0.08 + Math.sin(animationTime * 0.007) * 0.04;
  particles.scale.set(scale, scale, scale);

  // 更新动画时间
  animationTime++;
};

/**
 * 鼠标进入窗口
 */
const handleMouseEnter = (): void => {
  isMouseInWindow.value = true;
};

/**
 * 鼠标离开窗口
 */
const handleMouseLeave = (): void => {
  isMouseInWindow.value = false;
};

/**
 * 创建空心三角形纹理
 */
const createTriangleTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // 清空画布（透明）
  ctx.clearRect(0, 0, 64, 64);

  // 绘制空心三角形
  ctx.beginPath();
  ctx.moveTo(32, 8); // 上顶点
  ctx.lineTo(8, 56); // 左下顶点
  ctx.lineTo(56, 56); // 右下顶点
  ctx.closePath();

  // 设置线条样式
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
};

/**
 * 创建GSAP复杂动画
 */
const createGSAPAnimations = (): void => {
  // 创建时间线
  animationTimeline = gsap.timeline({
    repeat: -1,
    ease: 'none',
  });

  // 粒子系统缩放动画（呼吸效果）
  animationTimeline.to(
    particles.scale,
    {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
    },
    0
  );

  // 光晕层缩放动画（与粒子不同步）
  animationTimeline.to(
    glowParticles.scale,
    {
      x: 1.15,
      y: 1.15,
      z: 1.15,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
    },
    0.5
  );

  // 相机轻微摆动
  animationTimeline.to(
    camera.position,
    {
      x: 5,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
    },
    0
  );

  animationTimeline.to(
    camera.position,
    {
      y: 3,
      duration: 2.5,
      ease: 'sine.inOut',
      yoyo: true,
    },
    0.3
  );

  // 文字闪烁效果
  if (textMesh) {
    animationTimeline.to(
      textMesh.scale,
      {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 0.5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 3,
      },
      1
    );
  }
};

/**
 * 创建3D文字（嵌入到Canvas中）
 */
const create3DText = (): void => {
  // 创建文字画布
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // 清空画布（透明）
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 设置文字样式
  ctx.font = 'bold 52px Microsoft YaHei, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 绘制文字发光效果
  const textGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  textGradient.addColorStop(0, '#60a5fa');
  textGradient.addColorStop(0.3, '#818cf8');
  textGradient.addColorStop(0.5, '#a78bfa');
  textGradient.addColorStop(0.7, '#c084fc');
  textGradient.addColorStop(1, '#f472b6');

  // 最外层发光（青色）
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 35;
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = textGradient;
  ctx.fillText('页面内容加载中...', canvas.width / 2, canvas.height / 2);

  // 中间发光（紫色）
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 20;
  ctx.globalAlpha = 0.7;
  ctx.fillText('页面内容加载中...', canvas.width / 2, canvas.height / 2);

  // 内层文字（白色）
  ctx.shadowBlur = 5;
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('页面内容加载中...', canvas.width / 2, canvas.height / 2);

  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // 创建平面几何体
  const geometry = new THREE.PlaneGeometry(40, 10);

  // 创建材质
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.95,
  });

  // 创建网格
  textMesh = new THREE.Mesh(geometry, material);
  textMesh.position.z = 50; // 放置在粒子前方
  scene.add(textMesh);
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
 * 处理窗口resize
 */
const handleResize = (): void => {
  if (!canvasRef.value) return;

  const { width, height } = getViewportSize();

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (composer) {
    composer.setSize(width, height);
  }
};

/**
 * 清理资源
 */
const cleanup = (): void => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (animationTimeline) {
    animationTimeline.kill();
  }
  if (composer) {
    composer.dispose();
  }
  if (renderer) {
    renderer.dispose();
  }
  if (particles) {
    particles.geometry.dispose();
    (particles.material as THREE.Material).dispose();
  }
  if (glowParticles) {
    glowParticles.geometry.dispose();
    (glowParticles.material as THREE.Material).dispose();
  }
  if (textMesh) {
    textMesh.geometry.dispose();
    (textMesh.material as THREE.Material).dispose();
  }
  if (lineMesh) {
    lineMesh.geometry.dispose();
    (lineMesh.material as THREE.Material).dispose();
  }
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('mouseenter', handleMouseEnter);
  window.removeEventListener('mouseleave', handleMouseLeave);
};

onMounted(() => {
  initScene();
  window.addEventListener('resize', handleResize);
  window.addEventListener('mouseenter', handleMouseEnter);
  window.addEventListener('mouseleave', handleMouseLeave);
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
  0%,
  100% {
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
