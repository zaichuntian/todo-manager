<template>
  <div class="profile-page page-container">
    <!-- tsparticles 背景 -->
    <div class="particles-bg">
      <vue-particles id="tsparticles" @particles-loaded="particlesLoaded" :options="particlesOptions" />
    </div>

    <el-card class="common-card profile-card">
      <div class="profile-header">
        <div class="profile-avatar">
          <el-avatar :size="120" :icon="UserFilled" />
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{{ typedUserInfo?.username || '用户' }}</h2>
          <p class="profile-role">
            <el-text :type="computeRoleTextColor">{{ getUserRole(typedUserInfo?.role) }}</el-text>
          </p>
          <div class="profile-stats">
            <div class="stat-item">
              <el-icon><Timer /></el-icon>
              <span class="stat-value">{{ totalTasks }}</span>
              <span class="stat-label">总任务</span>
            </div>
            <div class="stat-item">
              <el-icon><Check /></el-icon>
              <span class="stat-value">{{ completedTasks }}</span>
              <span class="stat-label">已完成</span>
            </div>
            <div class="stat-item">
              <el-icon><Close /></el-icon>
              <span class="stat-value">{{ pendingTasks }}</span>
              <span class="stat-label">未完成</span>
            </div>
          </div>
        </div>
      </div>

      <el-card class="common-card">
        <div class="profile-content">
          <el-tabs type="border-card">
            <el-tab-pane label="个人信息">
              <div class="info-section">
                <el-form :model="form" label-width="120px" class="user-form">
                  <el-form-item label="用户名" disabled>
                    <el-input v-model="form.username" placeholder="用户名" />
                  </el-form-item>
                  <el-form-item label="角色" disabled>
                    <el-input v-model="form.role" placeholder="角色" />
                  </el-form-item>
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" placeholder="请输入邮箱" type="email" />
                  </el-form-item>
                  <el-form-item label="手机" prop="phone">
                    <el-input v-model="form.phone" placeholder="请输入手机号" />
                  </el-form-item>
                  <el-form-item label="创建时间" disabled>
                    <el-input v-model="form.createdAt" placeholder="创建时间" />
                  </el-form-item>
                  <el-form-item label="最后登录" disabled>
                    <el-input v-model="form.updatedAt" placeholder="最后登录" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="handleSubmit" :loading="loading">保存修改</el-button>
                    <el-button @click="resetForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="最近任务">
              <div class="recent-tasks">
                <el-empty v-if="recentTasks.length === 0" description="暂无任务" />
                <el-card v-for="task in recentTasks" :key="task.uuid" shadow="hover" class="recent-task-card">
                  <div class="task-header">
                    <span class="task-title">{{ task.title }}</span>
                    <el-tag :type="task.status === 1 ? 'success' : 'warning'" size="small">
                      {{ task.status === 1 ? '已完成' : '未完成' }}
                    </el-tag>
                  </div>
                  <div class="task-body">
                    <p class="task-content">{{ task.content || '暂无描述' }}</p>
                  </div>
                  <div class="task-footer">
                    <span class="task-category">{{ task.category?.name || '未分类' }}</span>
                    <span class="task-time">{{ formatTime(task.createdAt) }}</span>
                  </div>
                </el-card>
              </div>
            </el-tab-pane>

            <el-tab-pane label="任务统计">
              <div class="stats-section">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-card shadow="hover" class="stat-card">
                      <div class="stat-card-content">
                        <el-icon class="stat-icon"><Timer /></el-icon>
                        <div class="stat-card-info">
                          <span class="stat-card-value">{{ totalTasks }}</span>
                          <span class="stat-card-label">总任务</span>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card shadow="hover" class="stat-card success">
                      <div class="stat-card-content">
                        <el-icon class="stat-icon"><Check /></el-icon>
                        <div class="stat-card-info">
                          <span class="stat-card-value">{{ completedTasks }}</span>
                          <span class="stat-card-label">已完成</span>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  <el-col :span="8">
                    <el-card shadow="hover" class="stat-card warning">
                      <div class="stat-card-content">
                        <el-icon class="stat-icon"><Close /></el-icon>
                        <div class="stat-card-info">
                          <span class="stat-card-value">{{ pendingTasks }}</span>
                          <span class="stat-card-label">未完成</span>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>

                <div class="chart-section">
                  <el-card shadow="hover" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px)">
                    <template #header>
                      <div class="card-header">
                        <span>任务完成情况</span>
                      </div>
                    </template>
                    <div class="chart-container">
                      <div class="chart-item">
                        <div class="chart-label">已完成</div>
                        <div class="chart-bar">
                          <div class="chart-progress success" :style="{ width: completionRate + '%' }"></div>
                        </div>
                        <div class="chart-value">{{ completionRate }}%</div>
                      </div>
                      <div class="chart-item">
                        <div class="chart-label">未完成</div>
                        <div class="chart-bar">
                          <div class="chart-progress warning" :style="{ width: 100 - completionRate + '%' }"></div>
                        </div>
                        <div class="chart-value">{{ 100 - completionRate }}%</div>
                      </div>
                    </div>
                  </el-card>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { UserFilled, Timer, Check, Close } from '@element-plus/icons-vue';
import gsap from 'gsap';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/api';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const userInfo = authStore.userInfo;

// 扩展 userInfo 类型
interface UserInfo {
  userUuid: string;
  username: string;
  role?: number;
  status?: number;
  token: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 任务类型定义
interface Task {
  uuid: string;
  title: string;
  content?: string;
  status: number;
  category?: {
    name: string;
    color?: string;
  };
  user?: {
    username: string;
  };
  createdAt: string;
  updatedAt?: string;
}

// 使用类型断言
const typedUserInfo = userInfo as UserInfo;

// 任务数据
const totalTasks = ref(0);
const completedTasks = ref(0);
const pendingTasks = ref(0);
const recentTasks = ref<Task[]>([]);

// 表单数据
const form = ref({
  username: '',
  role: '',
  email: '',
  phone: '',
  createdAt: '',
  updatedAt: '',
});

// 加载状态
const loading = ref(false);

// 计算完成率
const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});

// 计算角色文本颜色
const computeRoleTextColor = computed(() => {
  const userRole: number = typedUserInfo?.role || 0;
  switch (userRole) {
    case 0:
      return 'primary';
    case 1:
      return 'warning';
    case 2:
      return 'danger';
    default:
      return 'primary';
  }
});

// 粒子加载完成回调
const particlesLoaded = async (container: any) => {
  console.log('Particles container loaded', container);
};

// 粒子配置
const particlesOptions = {
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60, // 降低帧率以提高性能
  particles: {
    number: {
      value: 80, // 减少粒子数量以提高性能
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: ['#409eff', '#667eea', '#764ba2', '#f093fb', '#4facfe'],
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: 0.5,
      random: true,
      animation: {
        enable: true,
        speed: 1,
        minimumValue: 0.1,
        sync: false,
      },
    },
    size: {
      value: 3,
      random: true,
      animation: {
        enable: true,
        speed: 2,
        minimumValue: 0.5,
        sync: false,
      },
    },
    links: {
      color: '#409eff',
      distance: 150,
      enable: true,
      opacity: 0.4,
      width: 1,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: 'bounce',
      random: false,
      speed: 1,
      straight: false,
    },
  },
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'grab',
      },
      resize: true,
    },
    modes: {
      bubble: {
        distance: 400,
        duration: 2,
        opacity: 0.8,
        size: 40,
      },
      push: {
        quantity: 4,
      },
      grab: {
        distance: 150,
        links: {
          opacity: 1,
        },
      },
    },
  },
  detectRetina: true,
};

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

// 格式化时间
const formatTime = (time: string | undefined) => {
  if (!time) return '未知';
  return new Date(time).toLocaleString();
};

// 获取用户数据
const getUserData = async () => {
  try {
    // 获取用户任务列表
    const res: any = await api.todo.getList({ pageNum: 1, pageSize: 100 });
    if (res && res.list) {
      const tasks: Task[] = res.list;
      totalTasks.value = tasks.length;
      completedTasks.value = tasks.filter(task => task.status === 1).length;
      pendingTasks.value = tasks.filter(task => task.status === 0).length;
      // 获取最近的5个任务
      recentTasks.value = tasks.slice(0, 5);
    }

    // 填充表单数据
    fillFormData();
  } catch (error) {
    console.error('获取用户数据失败:', error);
  }
};

// 填充表单数据
const fillFormData = () => {
  if (typedUserInfo) {
    form.value = {
      username: typedUserInfo.username || '',
      role: getUserRole(typedUserInfo.role),
      email: typedUserInfo.email || '',
      phone: typedUserInfo.phone || '',
      createdAt: formatTime(typedUserInfo.createdAt),
      updatedAt: formatTime(typedUserInfo.updatedAt),
    };
  }
};

// 重置表单
const resetForm = () => {
  fillFormData();
};

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true;
    // 这里可以添加 API 调用，更新用户信息
    // 例如: await api.user.update(form.value);

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 更新本地用户信息
    if (typedUserInfo) {
      typedUserInfo.email = form.value.email;
      typedUserInfo.phone = form.value.phone;
    }

    // 显示成功消息
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改用户信息失败:', error);
    ElMessage.error('修改失败');
  } finally {
    loading.value = false;
  }
};

// 动画显示页面元素
const animatePage = () => {
  gsap.from('.profile-avatar', {
    duration: 1,
    scale: 0,
    opacity: 0,
    ease: 'back.out(1.7)',
  });

  gsap.from('.profile-name', {
    duration: 0.8,
    y: 30,
    opacity: 0,
    ease: 'power2.out',
    delay: 0.2,
  });

  gsap.from('.profile-role', {
    duration: 0.8,
    y: 30,
    opacity: 0,
    ease: 'power2.out',
    delay: 0.3,
  });

  gsap.from('.stat-item', {
    duration: 0.6,
    y: 20,
    opacity: 0,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0.4,
  });

  gsap.from('.el-tabs', {
    duration: 0.8,
    y: 50,
    opacity: 0,
    ease: 'power2.out',
    delay: 0.6,
  });
};

// 组件挂载
onMounted(() => {
  getUserData();
  // 等待DOM更新后执行动画
  nextTick(() => {
    animatePage();
  });
});

// 组件卸载
onUnmounted(() => {
  // 粒子库会自动清理
});
</script>

<style scoped lang="less">
:deep(.el-tabs--border-card) {
  border: none;
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item) {
  border: none;
}

:deep(.el-card).profile-card {
  border: none;
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  border-bottom: none;
}

.particles-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.profile-page {
  height: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;

  .particles-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .profile-card {
    position: relative;
    z-index: 1;
    margin: 0;
    max-width: none;
    width: 100%;
    height: 100%;
    border-radius: 0;
    overflow: hidden;
    box-shadow: none;
    background: transparent;
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;

    .profile-header {
      display: flex;
      align-items: center;
      padding: 40px;
      color: #409eff;
      border-radius: 16px 16px 0 0;

      .profile-avatar {
        margin-right: 40px;

        .el-avatar {
          border: 4px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
      }

      .profile-info {
        flex: 1;

        .profile-name {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }

        .profile-role {
          font-size: 16px;
          opacity: 0.9;
          margin: 0 0 30px 0;
        }

        .profile-stats {
          display: flex;
          gap: 40px;

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;

            .el-icon {
              font-size: 24px;
              opacity: 0.9;
            }

            .stat-value {
              font-size: 24px;
              font-weight: 700;
            }

            .stat-label {
              font-size: 14px;
              opacity: 0.8;
            }
          }
        }
      }
    }

    .profile-content {
      flex: 1;
      overflow: hidden;

      .info-section {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        backdrop-filter: blur(10px);
      }

      .user-form {
        max-width: 600px;
      }

      .recent-tasks {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .recent-task-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }

          .task-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .task-title {
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }
          }

          .task-body {
            margin-bottom: 15px;

            .task-content {
              font-size: 14px;
              color: #606266;
              line-height: 1.5;
              margin: 0;
            }
          }

          .task-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #909399;

            .task-category {
              background: #f5f7fa;
              padding: 2px 8px;
              border-radius: 10px;
            }
          }
        }
      }

      .stats-section {
        .stat-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }

          &.success {
            background: rgba(240, 249, 235, 0.3);
            backdrop-filter: blur(10px);
          }

          &.warning {
            background: rgba(253, 246, 236, 0.3);
            backdrop-filter: blur(10px);
          }

          .stat-card-content {
            display: flex;
            align-items: center;
            padding: 30px;
            gap: 20px;

            .stat-icon {
              font-size: 32px;
              color: #409eff;

              &.success {
                color: #67c23a;
              }

              &.warning {
                color: #e6a23c;
              }
            }

            .stat-card-info {
              flex: 1;

              .stat-card-value {
                display: block;
                font-size: 32px;
                font-weight: 700;
                color: #303133;
              }

              .stat-card-label {
                display: block;
                font-size: 14px;
                color: #606266;
                margin-top: 5px;
              }
            }
          }
        }

        .chart-section {
          margin-top: 30px;

          .chart-container {
            display: flex;
            flex-direction: column;
            gap: 20px;

            .chart-item {
              display: flex;
              align-items: center;
              gap: 20px;

              .chart-label {
                width: 80px;
                font-size: 14px;
                color: #606266;
              }

              .chart-bar {
                flex: 1;
                height: 20px;
                background: #f5f7fa;
                border-radius: 10px;
                overflow: hidden;

                .chart-progress {
                  height: 100%;
                  border-radius: 10px;
                  transition: width 1s ease;

                  &.success {
                    background: #67c23a;
                  }

                  &.warning {
                    background: #e6a23c;
                  }
                }
              }

              .chart-value {
                width: 60px;
                font-size: 14px;
                font-weight: 600;
                color: #303133;
                text-align: right;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .profile-page {
    .profile-card {
      margin: 20px;

      .profile-header {
        flex-direction: column;
        text-align: center;
        padding: 30px;

        .profile-avatar {
          margin-right: 0;
          margin-bottom: 20px;
        }

        .profile-info {
          .profile-stats {
            justify-content: center;
            gap: 30px;
          }
        }
      }
    }
  }
}
</style>