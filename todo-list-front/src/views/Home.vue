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
import '@/assets/styles/pages/home.css';

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
