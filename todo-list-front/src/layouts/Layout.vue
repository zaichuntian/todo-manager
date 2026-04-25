<template>
  <el-container style="height: 100vh">
    <!-- 关键：el-aside 的 width 改为动态绑定 -->
    <el-aside
      :width="isCollapsed ? '64px' : '200px'"
      class="sidebar-animate"
      style="background-color: #304156; position: relative; overflow: hidden"
    >
      <!-- Three.js 左侧菜单背景 -->
      <div class="sidebar-bg-container">
        <canvas ref="sidebarCanvas" class="sidebar-bg-canvas"></canvas>
      </div>
      <!-- 折叠时隐藏logo文字，避免溢出 -->
      <div class="logo" @click="goHomePage" :class="{ collapsed: isCollapsed }">
        <h3>Todo List</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        class="sidebar-menu"
        router
        background-color="rgba(0, 0, 0, .1)"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/todo">
          <el-icon><UserFilled /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><UserFilled /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header header-animate" style="position: relative; overflow: hidden">
        <!-- Three.js 顶部Header背景 -->
        <div class="header-bg-container">
          <canvas ref="headerCanvas" class="header-bg-canvas"></canvas>
        </div>
        <div class="breadcrumb-wrapper">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path === '/todo'">任务管理</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path === '/user'">用户管理</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path === '/category'">分类管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" effect="light">
            <div class="user-info">
              <div class="user-avatar">
                <el-avatar :size="36" :icon="UserFilled" />
              </div>
              <div class="user-details">
                <div class="user-name">{{ userInfo?.username || '用户' }}</div>
                <div class="user-role">{{ getUserRole(userInfo?.role) }}</div>
              </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <div class="dropdown-user-info">
                    <el-avatar :size="24" :icon="UserFilled" />
                    <div class="dropdown-user-details">
                      <div class="dropdown-user-name">{{ userInfo?.username || '用户' }}</div>
                      <div class="dropdown-user-role">{{ getUserRole(userInfo?.role) }}</div>
                    </div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon class="dropdown-item-icon"><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main main-animate">
        <router-view v-slot="{ Component }">
          <transition mode="out-in" @enter="enterAnimation" @leave="leaveAnimation">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ArrowDown, UserFilled, HomeFilled, SwitchButton } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import * as THREE from 'three';
import { useLayout } from '../hooks/useLayout';
import { useAnimation } from '@/hooks/useAnimation';
import { useCommon } from '@/hooks/useCommon.ts';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userInfo = authStore.userInfo;

const route = useRoute();
const { isCollapsed, activeMenu, handleLogout } = useLayout();
const { enterAnimation, leaveAnimation } = useAnimation();
const { goHomePage } = useCommon();

// Three.js 相关变量
const sidebarCanvas = ref<HTMLCanvasElement>();
const headerCanvas = ref<HTMLCanvasElement>();

let sidebarScene: THREE.Scene;
let sidebarCamera: THREE.PerspectiveCamera;
let sidebarRenderer: THREE.WebGLRenderer;
let sidebarParticles: THREE.Group;
let sidebarAnimationId: number;

let headerScene: THREE.Scene;
let headerCamera: THREE.PerspectiveCamera;
let headerRenderer: THREE.WebGLRenderer;
let headerParticles: THREE.Group;
let headerAnimationId: number;

// 初始化左侧菜单Three.js场景
const initSidebarThree = () => {
  if (!sidebarCanvas.value) return;

  // 创建场景
  sidebarScene = new THREE.Scene();

  // 创建相机
  sidebarCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  sidebarCamera.position.z = 2; // 调整相机位置，使三角形更大

  // 创建渲染器
  sidebarRenderer = new THREE.WebGLRenderer({
    canvas: sidebarCanvas.value,
    alpha: true,
    antialias: true,
  });
  sidebarRenderer.setSize(200, window.innerHeight);
  sidebarRenderer.setPixelRatio(window.devicePixelRatio);
  sidebarRenderer.setClearColor(0x000000, 0); // 确保背景完全透明

  // 创建粒子
  createSidebarParticles();

  // 开始动画
  animateSidebar();

  // 监听窗口大小变化
  window.addEventListener('resize', handleSidebarResize);
  // 监听菜单折叠变化
  watch(() => isCollapsed.value, handleSidebarResize);
};

// 创建左侧菜单粒子
const createSidebarParticles = () => {
  const particlesCount = 80;

  // 创建一个包含所有三角形的组
  const particlesGroup = new THREE.Group();

  // 为每个粒子创建一个独立的线条
  for (let i = 0; i < particlesCount; i++) {
    // 等边三角形顶点
    const triangleGeometry = new THREE.BufferGeometry();
    const triangleVertices = new Float32Array([
      0,
      0.0866,
      0, // 顶部
      -0.05,
      -0.0433,
      0, // 左下角
      0.05,
      -0.0433,
      0, // 右下角
      0,
      0.0866,
      0, // 回到顶部，形成闭合
    ]);
    triangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3));

    // 生成统一协调的颜色，以蓝色系为主
    const r = 0.4 + Math.random() * 0.3; // 0.4-0.7
    const g = 0.6 + Math.random() * 0.3; // 0.6-0.9
    const b = 0.8 + Math.random() * 0.2; // 0.8-1.0

    // 三角形材质 - 使用线条，加粗线条宽度
    const particlesMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      linewidth: 2, // 加粗线条
    });

    // 创建线条
    const line = new THREE.Line(triangleGeometry, particlesMaterial);

    // 优化位置分布，使排列更均匀
    const x = (Math.random() - 0.5) * 3; // 适当增大水平范围
    const y = (Math.random() - 0.5) * 16; // 增大垂直范围，使分布更均匀
    const z = (Math.random() - 0.5) * 1.5; // 适当增大深度范围
    line.position.set(x, y, z);

    // 随机旋转
    line.rotation.x = Math.random() * Math.PI * 2;
    line.rotation.y = Math.random() * Math.PI * 2;
    line.rotation.z = Math.random() * Math.PI * 2;

    // 优化缩放范围，使大小更协调
    const scale = 0.5 + Math.random() * 0.8; // 增大缩放范围，使三角形更大
    line.scale.set(scale, scale, scale);

    // 添加到组中
    particlesGroup.add(line);
  }

  sidebarParticles = particlesGroup;
  sidebarScene.add(sidebarParticles);
};

// 左侧菜单动画循环
const animateSidebar = () => {
  sidebarAnimationId = requestAnimationFrame(animateSidebar);

  // 整体缓慢旋转 - 适当增大旋转速度，使动画更明显
  sidebarParticles.rotation.y += 0.0003;
  sidebarParticles.rotation.x += 0.0001;

  // 为每个线条添加独立的旋转
  if (sidebarParticles instanceof THREE.Group) {
    sidebarParticles.children.forEach((child, index) => {
      if (child instanceof THREE.Line) {
        // 每个线条独立旋转 - 适当增大旋转速度，使动画更流畅
        child.rotation.x += 0.0001 + (index % 5) * 0.00005;
        child.rotation.y += 0.0001 + (index % 7) * 0.00005;
        child.rotation.z += 0.0001 + (index % 9) * 0.00005;
      }
    });
  }

  sidebarRenderer.render(sidebarScene, sidebarCamera);
};

// 处理左侧菜单大小变化
const handleSidebarResize = () => {
  if (!sidebarRenderer) return;

  const width = isCollapsed.value ? 64 : 200;
  sidebarRenderer.setSize(width, window.innerHeight);
  sidebarCamera.aspect = width / window.innerHeight;
  sidebarCamera.updateProjectionMatrix();
};

// 初始化顶部Header Three.js场景
const initHeaderThree = () => {
  if (!headerCanvas.value) return;

  // 创建场景
  headerScene = new THREE.Scene();

  // 创建相机
  headerCamera = new THREE.PerspectiveCamera(75, window.innerWidth / 60, 0.1, 1000);
  headerCamera.position.z = 3; // 调整相机位置，使三角形更大

  // 创建渲染器
  headerRenderer = new THREE.WebGLRenderer({
    canvas: headerCanvas.value,
    alpha: true,
    antialias: true,
  });
  headerRenderer.setSize(window.innerWidth, 60);
  headerRenderer.setPixelRatio(window.devicePixelRatio);
  headerRenderer.setClearColor(0x000000, 0); // 确保背景完全透明

  // 创建粒子
  createHeaderParticles();

  // 开始动画
  animateHeader();

  // 监听窗口大小变化
  window.addEventListener('resize', handleHeaderResize);
};

// 创建顶部Header粒子
const createHeaderParticles = () => {
  const particlesCount = 150;

  // 创建一个包含所有三角形的组
  const particlesGroup = new THREE.Group();

  // 为每个粒子创建一个独立的线条
  for (let i = 0; i < particlesCount; i++) {
    // 等边三角形顶点
    const triangleGeometry = new THREE.BufferGeometry();
    const triangleVertices = new Float32Array([
      0,
      0.1299,
      0, // 顶部
      -0.075,
      -0.065,
      0, // 左下角
      0.075,
      -0.065,
      0, // 右下角
      0,
      0.1299,
      0, // 回到顶部，形成闭合
    ]);
    triangleGeometry.setAttribute('position', new THREE.BufferAttribute(triangleVertices, 3));

    // 生成随机颜色
    const r = 0.6 + Math.random() * 0.4; // 0.6-1.0
    const g = 0.6 + Math.random() * 0.4; // 0.6-1.0
    const b = 0.8 + Math.random() * 0.2; // 0.8-1.0

    // 三角形材质 - 使用线条，加粗线条宽度
    const particlesMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      linewidth: 2, // 加粗线条
    });

    // 创建线条
    const line = new THREE.Line(triangleGeometry, particlesMaterial);

    // 随机位置
    const x = (Math.random() - 0.5) * 15;
    const y = (Math.random() - 0.5) * 2;
    const z = (Math.random() - 0.5) * 3;
    line.position.set(x, y, z);

    // 随机旋转
    line.rotation.x = Math.random() * Math.PI * 2;
    line.rotation.y = Math.random() * Math.PI * 2;
    line.rotation.z = Math.random() * Math.PI * 2;

    // 随机缩放
    const scale = 0.3 + Math.random() * 0.9;
    line.scale.set(scale, scale, scale);

    // 添加到组中
    particlesGroup.add(line);
  }

  headerParticles = particlesGroup;
  headerScene.add(headerParticles);
};

// 顶部Header动画循环
const animateHeader = () => {
  headerAnimationId = requestAnimationFrame(animateHeader);

  // 整体缓慢旋转
  headerParticles.rotation.y += 0.0004;

  // 为每个线条添加独立的旋转
  if (headerParticles instanceof THREE.Group) {
    headerParticles.children.forEach((child, index) => {
      if (child instanceof THREE.Line) {
        // 每个线条独立旋转
        child.rotation.x += 0.0002 + (index % 5) * 0.00005;
        child.rotation.y += 0.0002 + (index % 7) * 0.00005;
        child.rotation.z += 0.0002 + (index % 9) * 0.00005;
      }
    });
  }

  headerRenderer.render(headerScene, headerCamera);
};

// 处理顶部Header大小变化
const handleHeaderResize = () => {
  if (!headerRenderer) return;

  headerRenderer.setSize(window.innerWidth, 60);
  headerCamera.aspect = window.innerWidth / 60;
  headerCamera.updateProjectionMatrix();
};

// 组件挂载时初始化
onMounted(() => {
  // 延迟初始化，确保DOM已经渲染完成
  setTimeout(() => {
    initSidebarThree();
    initHeaderThree();
  }, 100);
});

// 组件卸载时清理
onUnmounted(() => {
  if (sidebarAnimationId) {
    cancelAnimationFrame(sidebarAnimationId);
  }
  if (headerAnimationId) {
    cancelAnimationFrame(headerAnimationId);
  }
  window.removeEventListener('resize', handleSidebarResize);
  window.removeEventListener('resize', handleHeaderResize);
  if (sidebarRenderer) {
    sidebarRenderer.dispose();
  }
  if (headerRenderer) {
    headerRenderer.dispose();
  }
});

// 获取用户角色
const getUserRole = (role: number | undefined) => {
  switch (role) {
    case 2:
      return '超级管理员';
    case 1:
      return '管理员';
    default:
      return '普通用户';
  }
};
</script>

<style scoped lang="less">
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  border-bottom: 1px solid rgba(43, 47, 58, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 1;

  // 折叠时隐藏文字，防止溢出
  &.collapsed {
    h3 {
      display: none;
    }
  }
}

.sidebar-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.sidebar-bg-canvas {
  width: 100%;
  height: 100%;
}

/* 进场动画 */
.sidebar-animate {
  animation: slideInLeft 0.6s ease-out forwards;
  opacity: 0;
  transform: translateX(-100%);
  animation-delay: 0.1s;
}

.header-animate {
  animation: slideInDown 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(-100%);
  animation-delay: 0.3s;
}

.main-animate {
  animation: fadeIn 0.8s ease-out forwards;
  opacity: 0;
  animation-delay: 0.5s;
}

/* 动画定义 */
@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  0% {
    opacity: 0;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  padding: 0 20px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.header-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.header-bg-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

:deep(.el-card) {
  background-color: transparent;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:hover {
    background-color: rgba(245, 247, 250, 0.8);
    backdrop-filter: blur(5px);
  }
}

.user-avatar {
  transition: transform 0.3s ease;

  .user-info:hover & {
    transform: scale(1.05);
  }
}

.user-details {
  text-align: left;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
  transition: transform 0.3s ease;

  .user-info:hover & {
    transform: translateY(1px);
  }
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.dropdown-user-details {
  text-align: left;
}

.dropdown-user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.dropdown-user-role {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

.dropdown-item-icon {
  margin-right: 8px;
  font-size: 14px;
}

.breadcrumb-wrapper {
  display: flex;
  padding: 12px 20px;
  background-color: transparent;
  position: relative;
  z-index: 1;
}

.main {
  width: 100%;
  padding: 20px;
  background-color: transparent;
}

.sidebar-menu {
  height: calc(100vh - 60px);
  border-right: none;
  /* 👇 这是 Element Plus 官方默认动画速度，完全同步 */
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

/* 侧边栏容器动画 → 和菜单速度完全一致 */
:deep(.el-aside) {
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
