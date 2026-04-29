<template>
  <div class="home-page page-container">
    <!-- Three.js 背景 -->
    <div class="three-bg" ref="threeBg"></div>

    <el-card class="common-card">
      <div class="page-header">
        <h2>我的任务概览</h2>
        <div class="task-stats">
          <el-tag type="info">共 {{ total }} 条任务</el-tag>
          <el-tag type="success" style="margin-left: 10px">已完成 {{ completedTasks }} 条</el-tag>
          <el-tag type="warning" style="margin-left: 10px">未完成 {{ pendingTasks }} 条</el-tag>
        </div>
      </div>
      <div class="task-card-list">
        <div v-for="task in tableData" :key="task.uuid" class="task-card-wrapper" :data-task-id="task.uuid">
          <el-card shadow="hover" class="task-card todo-card">
            <!-- 上部分：标题（header 插槽，占 20%） -->
            <template #header>
              <div class="card-header">
                <span class="task-title">{{ task.title }}</span>
                <span class="task-category">{{ task.category?.name || '未分类' }}</span>
              </div>
            </template>

            <!-- 中间部分：内容（默认插槽，占 60%） -->
            <div class="task-body">
              <p class="task-content">{{ task.content || '暂无描述' }}</p>
            </div>

            <div class="task-footer">
              <div class="task-info">
                <div class="creator-badge">
                  <span class="creator-icon"></span>
                  <span class="creator">{{ task.user?.username || '未知用户' }}</span>
                </div>
                <span class="task-time">{{ formatTime(task.createdAt) }}</span>
              </div>

              <span :class="['task-status', task.status === 1 ? 'completed' : '']">
                <span class="status-dot"></span>
                {{ task.status === 1 ? '已完成' : '未完成' }}
              </span>
            </div>
          </el-card>
        </div>

        <el-empty v-if="tableData.length === 0" description="暂无任务" style="grid-column: 1 / -1; margin-top: 50px" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import dayjs from 'dayjs';
import { api } from '@/api';
import * as THREE from 'three';
import { gsap } from 'gsap';

const tableData = ref<any[]>([]);
const total = ref(0);
const loginUserUuid = ref(localStorage.getItem('userUuid') || '');
const threeBg = ref<HTMLElement | null>(null);

// 计算完成的任务数
const completedTasks = computed(() => {
  return tableData.value.filter(task => task.status === 1).length;
});

// 计算未完成的任务数
const pendingTasks = computed(() => {
  return tableData.value.filter(task => task.status === 0).length;
});

// Three.js 相关
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let particles: THREE.Points | null = null;

// 格式化时间
const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

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
  const particlesCount = 1000;

  const posArray = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 10;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x409eff,
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);

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

  animate();
};

// 处理窗口大小变化
const handleResize = () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

// 动画显示任务卡片
const animateTaskCards = () => {
  // 确保所有卡片先重置到初始位置
  gsap.set('.todo-card', {
    y: 0,
    opacity: 1,
    clearProps: 'all',
  });
};

// 获取任务列表
const getList = async () => {
  try {
    // 直接使用 api.todo.getList
    const res: any = await api.todo.getList({ pageNum: 1, pageSize: 100 });

    if (res && res.list) {
      // 显示所有任务，不分状态
      tableData.value = res.list;
      total.value = res.total;
      // 等待 DOM 更新后执行动画
      setTimeout(animateTaskCards, 100);
    } else {
      console.error('响应数据格式错误:', res);
    }
  } catch (err) {
    console.error('获取任务失败', err);
  }
};

onMounted(() => {
  loginUserUuid.value = localStorage.getItem('userUuid') || '';
  initThreeBackground();
  window.addEventListener('resize', handleResize);
  getList();
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
@import '../assets/css/variables.less';
@import '../assets/css/mixins.less';

/* 页面容器 */
.home-page {
  position: relative;
  min-height: 100vh;
  padding: @spacing-lg;
  z-index: 1;
  box-sizing: border-box;
}

/* Three.js 背景 */
.three-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: @spacing-xxl;
  padding-bottom: @spacing-md;
  border-bottom: 1px solid @border-color;

  .page-title {
    color: @text-primary;
    font-size: @font-size-xxl;
    font-weight: 600;
    margin: 0;
  }

  .page-subtitle {
    color: @text-muted;
    font-size: @font-size-sm;
    margin-top: @spacing-xs;
  }
}

/* 统计摘要 */
.stats-summary {
  display: flex;
  align-items: center;
  gap: @spacing-xl;

  .stat-item {
    text-align: center;

    .stat-num {
      display: block;
      font-size: @font-size-xxl;
      font-weight: 700;
      color: @text-primary;
    }

    .stat-text {
      font-size: @font-size-xs;
      color: @text-muted;
    }

    &.completed .stat-num {
      color: rgba(@accent-green, 0.9);
    }

    &.pending .stat-num {
      color: rgba(@accent-yellow, 0.9);
    }
  }
}

/* 任务卡片列表 */
.task-card-list {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(300px, 2fr)) !important;
  gap: @spacing-lg !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

:deep(.task-card-wrapper .el-card__body) {
  padding-top: 0;
}

/* 覆盖 Element Plus 卡片的默认 hover 效果 */
:deep(.task-card-wrapper .el-card) {
  background: transparent !important;
  border: none !important;

  &:hover {
    opacity: 1 !important; /* 强制不透明 */
  }
}

:deep(.task-card-wrapper .el-card__body) {
  background: transparent !important;
  opacity: 1 !important; /* 强制不透明 */

  &:hover {
    opacity: 1 !important; /* 强制 hover 时不透明 */
  }
}

/* 任务卡片 - 完整设计 */
.task-card-wrapper {
  border: 1px solid @border-color !important;
  border-radius: @radius-lg !important;
  padding: 0;
  cursor: pointer;
  transition: all @transition-normal;
  position: relative;
  overflow: hidden;
  opacity: 1 !important; /* 确保默认不透明 */

  /* 顶部渐变条 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, @accent-purple, @accent-blue);
    opacity: 0.7;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(@accent-blue, 0.3) !important;
    opacity: 1 !important; /* 强制 hover 时不透明 */

    &::before {
      opacity: 1;
    }
  }

  &.completed {
    opacity: 0.7;
    border-color: rgba(@accent-green, 0.2) !important;

    &::before {
      background: linear-gradient(90deg, @accent-green, rgba(@accent-green, 0.5));
    }
  }
}

/* 卡片内容区域 */
.task-card-content {
  padding: @spacing-md;
}

:deep(.el-card__header) {
  border-bottom: none;
}

:deep(.el-card__body) {
  padding-top: 14px;
}

/* 任务头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid @border-color-light;

  .task-title {
    color: @text-primary;
    font-size: @font-size-md;
    font-weight: 600;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task-category {
    display: inline-block;
    background: rgba(@accent-purple, 0.1);
    border: 1px solid rgba(@accent-purple, 0.15);
    color: rgba(@accent-purple, 0.7);
    font-size: @font-size-xs;
    padding: 2px @spacing-sm;
    border-radius: @radius-sm;
  }
}

/* 任务内容 */
.task-body {
  border-bottom: 1px solid @border-color-light;

  .task-content {
    color: @text-secondary;
    font-size: @font-size-sm;
    margin: 0 0 @spacing-md 0;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 任务底部 - 修改为水平排列 */
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;

  .task-info {
    display: flex;
    flex-direction: row; /* 修改为水平排列 */
    align-items: center;
    gap: @spacing-md;

    .creator-row {
      display: flex;
      align-items: center;
      gap: @spacing-xs;

      .creator-icon {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: rgba(@accent-blue, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: rgba(@accent-blue, 0.8);
      }

      .creator {
        color: rgba(@accent-blue, 0.9);
        font-size: @font-size-xs;
        font-weight: 500;
      }
    }

    .task-time {
      color: @text-muted;
      font-size: 11px;
    }
  }

  .task-status {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px @spacing-sm;
    border-radius: @radius-sm;
    font-size: @font-size-xs;
    font-weight: 500;
    background: rgba(@accent-yellow, 0.12);
    color: rgba(@accent-yellow, 0.85);

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(@accent-yellow, 0.8);
    }

    &.completed {
      background: rgba(@accent-green, 0.12);
      color: rgba(@accent-green, 0.85);

      .status-dot {
        background: rgba(@accent-green, 0.8);
      }
    }
  }
}
</style>
