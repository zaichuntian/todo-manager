<template>
  <el-container style="height: 100vh; overflow: hidden">
    <!-- 关键：el-aside 的 width 改为动态绑定 -->
    <el-aside
      :width="isCollapsed ? '64px' : '200px'"
      class="sidebar-animate"
      style="
        background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
        position: relative;
        overflow: hidden;
        height: 100%;
      "
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
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        <el-menu-item index="/category">
          <el-icon><FolderOpened /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header
        class="header header-animate"
        style="position: relative; overflow: hidden; background: linear-gradient(135deg, #1e293b 0%, #334155 100%)"
      >
        <!-- 确保粒子组件在这里 -->
        <div class="breadcrumb-wrapper">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path === '/todo'">任务管理</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path === '/user'">用户管理</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path === '/category'">分类管理</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- 主题切换按钮 -->
          <button class="theme-toggle-btn" @click="themeStore.toggleTheme" title="切换主题">
            <el-icon :size="20">
              <component :is="themeStore.theme === 'dark' ? Sunny : Moon" />
            </el-icon>
          </button>
          <el-dropdown trigger="hover" effect="light">
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
                <el-dropdown-item @click="goProfile">
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

      <el-main class="main main-animate" style="background: transparent; position: relative">
        <!-- Three.js 背景动画 - 使用fixed定位确保在底层 -->
        <div class="background-particles">
          <canvas ref="mainCanvas"></canvas>
        </div>
        <!-- 内容区域 -->
        <div class="content-wrapper">
          <router-view v-slot="{ Component }">
            <transition mode="out-in" @enter="enterAnimation" @leave="leaveAnimation">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
  ArrowDown,
  UserFilled,
  HomeFilled,
  SwitchButton,
  Sunny,
  Moon,
  List,
  FolderOpened,
} from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import * as THREE from 'three';
import { useLayout } from '../hooks/useLayout';
import { useAnimation } from '@/hooks/useAnimation';
import { useCommon } from '@/hooks/useCommon.ts';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

const authStore = useAuthStore();
const userInfo = authStore.userInfo;
const themeStore = useThemeStore();

const route = useRoute();
const { isCollapsed, activeMenu, handleLogout } = useLayout();
const { enterAnimation, leaveAnimation } = useAnimation();
const { goHomePage, goProfile } = useCommon();

// Three.js 相关变量
const sidebarCanvas = ref<HTMLCanvasElement>();
const mainCanvas = ref<HTMLCanvasElement>();

let sidebarScene: THREE.Scene;
let sidebarCamera: THREE.PerspectiveCamera;
let sidebarRenderer: THREE.WebGLRenderer;
let sidebarParticles: THREE.Group;
let sidebarAnimationId: number;

let mainScene: THREE.Scene;
let mainCamera: THREE.PerspectiveCamera;
let mainRenderer: THREE.WebGLRenderer;
let mainParticles: THREE.Points;
let mainAnimationId: number;

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

let headerRenderer: THREE.WebGLRenderer;
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
  const particlesCount = 120; // 增加粒子数量

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
      opacity: 0.6 + Math.random() * 0.3, // 随机不透明度
      blending: THREE.AdditiveBlending,
      linewidth: 2, // 加粗线条
    });

    // 创建线条
    const line = new THREE.Line(triangleGeometry, particlesMaterial);

    // 调整初始位置，使粒子从可见区域附近开始
    const x = (Math.random() - 0.5) * 4; // 水平范围
    const y = -8 + Math.random() * 16; // 从-8到8，覆盖整个可见区域
    const z = (Math.random() - 0.5) * 2; // 深度范围
    line.position.set(x, y, z);

    // 初始旋转（固定角度，不再随机旋转）
    line.rotation.x = Math.PI / 2;
    line.rotation.y = 0;
    line.rotation.z = 0;

    // 优化缩放范围，使大小更协调
    const scale = 0.4 + Math.random() * 1.0; // 扩大缩放范围
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

  // 移除整体旋转，改为从下往上冒泡
  if (sidebarParticles instanceof THREE.Group) {
    sidebarParticles.children.forEach((child, index) => {
      if (child instanceof THREE.Line) {
        // 调整移动速度，使其更加适中
        child.position.y += 0.001 + (index % 5) * 0.003; // 不同速度，更均匀

        // 到达顶部后重置到底部
        if (child.position.y > 8) {
          child.position.y = -8 - Math.random() * 2; // 从-8到-12，更快进入可见区域
          child.position.x = (Math.random() - 0.5) * 2; // 随机水平位置
        }

        // 轻微上下浮动，增加气泡效果
        child.position.y += Math.sin(Date.now() * 0.001 + index) * 0.003;
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

// 监听菜单折叠变化，重新生成粒子
watch(
  () => isCollapsed.value,
  () => {
    // 清除旧粒子
    if (sidebarParticles) {
      sidebarScene.remove(sidebarParticles);
    }
    // 重新创建粒子
    createSidebarParticles();
  }
);

// 初始化主内容区域Three.js场景
const initMainThree = () => {
  if (!mainCanvas.value) return;

  // 创建场景
  mainScene = new THREE.Scene();

  // 创建相机
  mainCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  mainCamera.position.z = 5;

  // 创建渲染器
  mainRenderer = new THREE.WebGLRenderer({
    canvas: mainCanvas.value,
    alpha: true,
    antialias: true,
  });
  mainRenderer.setSize(window.innerWidth, window.innerHeight);
  mainRenderer.setPixelRatio(window.devicePixelRatio);
  mainRenderer.setClearColor(0x000000, 0);

  // 创建粒子
  createMainParticles();

  // 开始动画
  animateMain();

  // 监听窗口大小变化
  window.addEventListener('resize', handleMainResize);
};

// 创建主内容区域粒子
const createMainParticles = () => {
  const particlesCount = 1000;

  const particlesGeometry = new THREE.BufferGeometry();
  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x409eff,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  mainParticles = new THREE.Points(particlesGeometry, particlesMaterial);
  mainScene.add(mainParticles);
};

// 主内容区域动画循环
const animateMain = () => {
  mainAnimationId = requestAnimationFrame(animateMain);

  if (mainParticles) {
    mainParticles.rotation.y += 0.001;
  }

  if (mainRenderer && mainScene && mainCamera) {
    mainRenderer.render(mainScene, mainCamera);
  }
};

// 处理主内容区域大小变化
const handleMainResize = () => {
  if (!mainCamera || !mainRenderer) return;

  mainCamera.aspect = window.innerWidth / window.innerHeight;
  mainCamera.updateProjectionMatrix();
  mainRenderer.setSize(window.innerWidth, window.innerHeight);
};

// 组件挂载时初始化
onMounted(() => {
  // 延迟初始化，确保DOM已经渲染完成
  setTimeout(() => {
    initSidebarThree();
    initMainThree();
  }, 100);
  // 初始化主题
  themeStore.initTheme();
});

// 组件卸载时清理
onUnmounted(() => {
  if (sidebarAnimationId) {
    cancelAnimationFrame(sidebarAnimationId);
  }
  if (headerAnimationId) {
    cancelAnimationFrame(headerAnimationId);
  }
  if (mainAnimationId) {
    cancelAnimationFrame(mainAnimationId);
  }
  window.removeEventListener('resize', handleSidebarResize);
  window.removeEventListener('resize', handleMainResize);
  if (sidebarRenderer) {
    sidebarRenderer.dispose();
  }
  if (headerRenderer) {
    headerRenderer.dispose();
  }
  if (mainRenderer) {
    mainRenderer.dispose();
  }
  if (mainParticles && mainParticles.geometry) {
    mainParticles.geometry.dispose();
  }
  if (mainParticles && mainParticles.material) {
    (mainParticles.material as THREE.Material).dispose();
  }
});
</script>

<style scoped lang="less">
@import '@/assets/styles/base/variables.less';
@import '@/assets/styles/base/mixins.less';

:deep(.el-dropdown-menu__item i) {
  margin-right: 0;
}

.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.particles-container {
  width: 100%;
  height: 100%;
}

/* Header 容器 - 确保子元素z-index生效 */
.header {
  position: relative !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 24px !important;
  height: 64px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 确保header内部元素正确布局 */
.header > * {
  position: relative;
  z-index: 10;
}

/* Canvas背景容器 - 放在底层 */
.header-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; /* 底层 */
  pointer-events: none;
}

.header-bg-canvas {
  width: 100%;
  height: 100%;
}

/* 面包屑容器 - 在Canvas之上，居左显示 */
.breadcrumb-wrapper {
  position: relative;
  z-index: 10; /* 在Canvas之上 */
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
  margin-left: 14px;

  :deep(.el-breadcrumb) {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: rgba(255, 255, 255, 0.9) !important;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: #409eff !important;
      }
    }

    &:last-child .el-breadcrumb__inner {
      color: #409eff !important;
      font-weight: 600;
    }

    .el-breadcrumb__separator {
      color: rgba(255, 255, 255, 0.35) !important;
      margin: 0 8px;
      font-size: 12px;
    }
  }
}

/* 顶部右侧区域 - 在Canvas之上 */
.header-right {
  position: relative;
  z-index: 10; /* 在Canvas之上 */
  display: flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  display: flex;
  flex-direction: column;

  .user-name {
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    font-weight: 500;
  }

  .user-role {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
  }
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* 主题切换按钮 */
.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.25s ease;
  margin-right: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(106, 176, 255, 0.4);
    color: #6ab0ff;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.98);
  }
}

/* 下拉框用户信息 */
.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.dropdown-user-details {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.dropdown-user-name {
  color: var(--el-bg-color-start);
  font-size: 14px;
  font-weight: 600;
}

.dropdown-user-role {
  color: #909399;
  font-size: 12px;
}

/* 下拉项图标 */
.dropdown-item-icon {
  margin-right: 8px;
}

/* 侧边栏Canvas背景 */
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

/* 主内容区域Canvas背景 */
.main-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.main-bg-canvas {
  width: 100%;
  height: 100%;
}

/* 路由视图容器 */
:deep(.router-view-wrapper) {
  position: relative !important;
  z-index: 100 !important;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
}

/* 确保路由视图内的所有元素都在背景之上 */
:deep(.router-view-wrapper > *) {
  position: relative !important;
  z-index: 101 !important;
}

/* 主内容区域Canvas背景 */
.main-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.main-bg-canvas {
  width: 100%;
  height: 100%;
}

/* 背景动画容器 - 固定定位在最底层 */
.background-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
}

.background-particles canvas {
  width: 100%;
  height: 100%;
}

/* 内容区域 - 在背景之上 */
.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

/* Logo样式 */
.logo {
  position: relative;
  z-index: 1;
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  border-bottom: 1px solid rgba(43, 47, 58, 0.8);
  cursor: pointer;

  &.collapsed h3 {
    display: none;
  }
}

/* 侧边栏菜单 */
.sidebar-menu {
  position: relative;
  z-index: 1;
}
</style>