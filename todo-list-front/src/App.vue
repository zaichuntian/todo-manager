<template>
  <div class="app-container">
    <!-- Three.js 背景 -->
    <div class="bg-container">
      <canvas ref="bgCanvas" class="bg-canvas"></canvas>
    </div>

    <!-- 路由视图 -->
    <div class="content-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 全局错误提示 -->
    <el-notification
      v-if="errorMessage"
      :title="'错误'"
      :message="errorMessage"
      type="error"
      :duration="3000"
      @close="errorMessage = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onErrorCaptured } from 'vue';
import * as THREE from 'three';
import { ElNotification } from 'element-plus';

const bgCanvas = ref<HTMLCanvasElement>();
const errorMessage = ref('');

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let particles: THREE.Group;
let animationId: number;

// 全局错误捕获
const handleError = (err: Error, _instance: any, info: string) => {
  console.error('全局错误:', err);
  console.error('错误信息:', info);
  errorMessage.value = `发生错误: ${err.message}`;
  return true; // 阻止错误继续传播
};

// 注册全局错误捕获
onErrorCaptured(handleError);

// 全局未捕获错误处理
window.addEventListener('error', event => {
  console.error('未捕获的错误:', event.error);
  errorMessage.value = `发生未捕获的错误: ${event.error?.message || '未知错误'}`;
});

// 全局未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise拒绝:', event.reason);
  errorMessage.value = `发生Promise错误: ${event.reason?.message || '未知错误'}`;
});

// 初始化Three.js场景
const initThree = () => {
  if (!bgCanvas.value) return;

  try {
    // 创建场景
    scene = new THREE.Scene();

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3; // 调整相机位置，使三角形更大

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
      canvas: bgCanvas.value,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // 确保背景完全透明

    // 创建粒子
    createParticles();

    // 开始动画
    animate();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('Three.js初始化失败:', error);
    errorMessage.value = '背景动画初始化失败';
  }
};

// 创建粒子
const createParticles = () => {
  const particlesCount = 300;

  // 创建一个包含所有三角形的组
  const particlesGroup = new THREE.Group();

  // 为每个粒子创建一个独立的线条
  for (let i = 0; i < particlesCount; i++) {
    // 等边三角形顶点
    const triangleGeometry = new THREE.BufferGeometry();
    const triangleVertices = new Float32Array([
      0,
      0.1732,
      0, // 顶部
      -0.1,
      -0.0866,
      0, // 左下角
      0.1,
      -0.0866,
      0, // 右下角
      0,
      0.1732,
      0, // 回到顶部，形成闭合
    ]);
    triangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3));

    // 生成随机颜色
    const r = 0.5 + Math.random() * 0.5; // 0.5-1.0
    const g = 0.5 + Math.random() * 0.5; // 0.5-1.0
    const b = 0.7 + Math.random() * 0.3; // 0.7-1.0

    // 三角形材质 - 使用线条，加粗线条宽度
    const particlesMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      linewidth: 2, // 加粗线条
    });

    // 创建线条
    const line = new THREE.Line(triangleGeometry, particlesMaterial);

    // 随机位置
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 10;
    line.position.set(x, y, z);

    // 随机旋转
    line.rotation.x = Math.random() * Math.PI * 2;
    line.rotation.y = Math.random() * Math.PI * 2;
    line.rotation.z = Math.random() * Math.PI * 2;

    // 随机缩放 - 不同大小的三角形
    const scale = 0.3 + Math.random() * 1.2; // 更大的缩放范围
    line.scale.set(scale, scale, scale);

    // 添加到组中
    particlesGroup.add(line);
  }

  particles = particlesGroup;
  scene.add(particles);
};

// 动画循环
const animate = () => {
  try {
    animationId = requestAnimationFrame(animate);

    // 整体缓慢旋转
    if (particles) {
      particles.rotation.y += 0.0005;
      particles.rotation.x += 0.0002;

      // 为每个线条添加独立的旋转
      if (particles instanceof THREE.Group) {
        particles.children.forEach((child, index) => {
          if (child instanceof THREE.Line) {
            // 每个线条独立旋转
            child.rotation.x += 0.0003 + (index % 5) * 0.0001;
            child.rotation.y += 0.0003 + (index % 7) * 0.0001;
            child.rotation.z += 0.0003 + (index % 9) * 0.0001;
          }
        });
      }
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  } catch (error) {
    console.error('动画循环错误:', error);
    // 停止动画以避免持续错误
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }
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
  z-index: 0;
  pointer-events: none;
}

.bg-canvas {
  width: 100%;
  height: 100%;
}

.content-container {
  position: relative;
  z-index: 1;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
