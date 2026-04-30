<template>
  <div class="home-page page-container">
    <!-- 添加粒子背景动画 -->
    <ParticleStarAnimation />

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
import { ref, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import { api } from '@/api';
import { gsap } from 'gsap';
import '@/assets/css/pages/home.css';
import ParticleStarAnimation from '@/components/ParticleStarAnimation.vue';

const tableData = ref<any[]>([]);
const total = ref(0);
const loginUserUuid = ref(localStorage.getItem('userUuid') || '');

// 计算完成的任务数
const completedTasks = computed(() => {
  return tableData.value.filter(task => task.status === 1).length;
});

// 计算未完成的任务数
const pendingTasks = computed(() => {
  return tableData.value.filter(task => task.status === 0).length;
});

// 格式化时间
const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

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
  getList();
});
</script>
