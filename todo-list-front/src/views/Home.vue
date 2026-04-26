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
              <div class="card-header" :style="{ backgroundColor: task.category?.color || '#f5f7fa' }">
                <span class="task-title">title: {{ task.title }}</span>
                <span class="task-category">{{ task.category?.name || '未分类' }}</span>
              </div>
            </template>

            <!-- 中间部分：内容（默认插槽，占 60%） -->
            <div class="card-body">
              <p class="task-content">{{ task.content || '暂无描述' }}</p>
            </div>

            <!-- 下部分：底部信息（footer 插槽，占 20%） -->
            <template #footer>
              <div class="card-footer">
                <div class="footer-left">
                  <!-- 新增：创建人 -->
                  <span class="creator">{{ task.user?.username || '未知用户' }}</span>
                  <span class="divider">|</span>
                  <!-- 原创建时间 -->
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatTime(task.createdAt) }}</span>
                </div>
                <div class="footer-right">
                  <el-button
                    v-if="task.status === 0 && isMyTask(task)"
                    type="primary"
                    size="small"
                    @click="handleComplete(task)"
                    class="complete-btn"
                  >
                    完成任务
                  </el-button>
                  <el-tag v-else :type="task.status === 1 ? 'success' : 'warning'" size="small">{{
                    task.status === 1 ? '已完成' : '未完成'
                  }}</el-tag>
                </div>
              </div>
            </template>
          </el-card>
        </div>

        <el-empty v-if="tableData.length === 0" description="暂无任务" style="grid-column: 1 / -1; margin-top: 50px" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ElMessageBox } from 'element-plus';
import { Clock } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { api } from '@/api';
import { showSuccessMessage, showInfoMessage } from '@/utils/common';

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

// 判断是否是自己的任务
const isMyTask = (row: any) => {
  return row.userUuid === loginUserUuid.value;
};

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

  // 然后执行入场动画
  gsap.from('.todo-card', {
    duration: 0.2,
    y: 50,
    opacity: 0,
    stagger: 0.1,
    ease: 'back.out(1.7)',
    onComplete: () => {
      // 动画结束后再次重置，确保所有卡片在同一水平线上
      gsap.set('.todo-card', {
        y: 0,
        clearProps: 'all',
      });
    },
  });
};

// 获取任务列表
const getList = async () => {
  try {
    console.log('开始获取任务列表');
    // 直接使用 api.todo.getList
    const res: any = await api.todo.getList({ pageNum: 1, pageSize: 100 });

    console.log('任务数据:', res);
    console.log('任务列表:', res?.list);
    console.log('任务总数:', res?.total);

    if (res && res.list) {
      console.log('设置任务数据:', res.list);
      // 显示所有任务，不分状态
      tableData.value = res.list;
      total.value = res.total;
      console.log('tableData 值:', tableData.value);
      console.log('tableData 长度:', tableData.value.length);

      // 打印第一个任务的详细信息，特别是 category 字段
      if (tableData.value.length > 0) {
        console.log('第一个任务的详细信息:', tableData.value[0]);
        console.log('第一个任务的 category 信息:', tableData.value[0].category);
        console.log('第一个任务的 category.color:', tableData.value[0].category?.color);
      }

      // 等待 DOM 更新后执行动画
      setTimeout(animateTaskCards, 100);
    } else {
      console.error('响应数据格式错误:', res);
    }
  } catch (err) {
    console.error('获取任务失败', err);
  }
};

// 完成任务（带确认）
const handleComplete = async (task: any) => {
  try {
    await ElMessageBox.confirm('确认将此任务标记为已完成吗？', '任务确认', {
      confirmButtonText: '确认完成',
      cancelButtonText: '取消',
      type: 'success',
    });

    // 动画效果
    const taskElement = document.querySelector(`[data-task-id="${task.uuid}"]`);
    if (taskElement) {
      gsap.to(taskElement, {
        duration: 0.5,
        scale: 0.9,
        opacity: 0,
        y: -50,
        ease: 'power2.out',
        onComplete: async () => {
          await api.todo.updateStatus(task.uuid, 1);
          showSuccessMessage('任务已完成！');
          getList();
        },
      });
    } else {
      await api.todo.updateStatus(task.uuid, 1);
      showSuccessMessage('任务已完成！');
      getList();
    }
  } catch {
    showInfoMessage('已取消操作');
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
.home-page {
  position: relative;
  min-height: 100vh;
  padding: 20px;
  background: transparent;
  z-index: 0;
  overflow: hidden;
}

.three-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.common-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  backdrop-filter: blur(10px);

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    margin: 0;
  }

  .task-stats {
    display: flex;
    align-items: center;
    gap: 10px;

    .el-tag {
      font-size: 14px;
      padding: 4px 12px;
    }
  }
}

.task-card-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    gap: 12px;
    padding: 16px 12px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    padding: 12px 10px;
  }
}

/* 响应式适配：不同屏幕自动减少列数 */
@media (max-width: 1539px) {
  .task-card-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 1280px) {
  .task-card-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 979px) {
  .task-card-list {
    grid-template-columns: 1fr;
  }
}

.task-card-wrapper {
  box-sizing: border-box;
  position: relative;
  display: block;
  padding-bottom: 20px;
}

.todo-card {
  width: 100%;
  height: 220px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  opacity: 1 !important;
  z-index: 1;
  vertical-align: top;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-card) {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }

  :deep(.el-card__header) {
    height: 60px;
    display: flex;
    /* align-items: center; */
    justify-content: space-between;
    margin: 0;
    padding: 0;
    border-bottom: none;
  }

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 16px;
    margin: 0;
  }

  :deep(.el-card__footer) {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-radius: 0 0 16px 16px;
    margin: 0;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    height: 200px;
  }

  @media (max-width: 480px) {
    height: 180px;
  }
}

.todo-card .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  transition: all 0.3s ease;
  padding: 12px 16px;
  border-radius: 16px 16px 0 0;
  backdrop-filter: blur(12px);

  .task-title {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .task-category {
    color: #f0f0f0;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
}

.todo-card .card-body {
  padding: 16px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  .task-content {
    margin: 0;
    color: #333333;
    font-size: 14px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-align: justify;
  }
}

.todo-card .card-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  backdrop-filter: blur(12px);
  border-radius: 0 0 16px 16px;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #555555;
    font-size: 12px;

    .el-icon {
      font-size: 12px;
      color: #888888;
    }

    .creator {
      font-weight: 600;
      color: #333333;
    }

    .divider {
      color: #dcdfe6;
    }
  }

  .footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .complete-btn {
    transition: all 0.3s ease;
    border-radius: 6px;
    font-size: 12px;
    color: #ffffff;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      background: rgba(64, 158, 255, 1);
    }
  }
}
</style>
