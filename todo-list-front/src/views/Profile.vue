<template>
  <div class="profile-page page-container">
    <!-- tsparticles 背景 -->
    <div class="particles-bg">
      <vue-particles id="tsparticles" @particles-loaded="particlesLoaded" :options="particlesOptions" />
    </div>

    <el-card class="common-card profile-card">
      <div class="profile-header">
        <div class="profile-avatar-wrapper">
          <div class="profile-avatar" @click="openAvatarPreview">
            <el-avatar :size="120" :icon="UserFilled" :src="avatarUrl" />
            <div class="avatar-overlay">
              <el-icon class="preview-icon"><ZoomIn /></el-icon>
            </div>
          </div>
          <input ref="avatarInput" type="file" accept="image/*" class="avatar-input" @change="handleAvatarChange" />
        </div>

        <!-- 头像预览弹窗 -->
        <el-dialog
          v-model="avatarPreviewVisible"
          title="头像预览"
          width="400px"
          :show-footer="false"
          @close="avatarPreviewVisible = false"
        >
          <div class="avatar-preview-content">
            <div class="preview-image-wrapper">
              <img :src="avatarUrl || defaultAvatar" :alt="'头像'" class="preview-image" />
            </div>
            <div class="preview-actions">
              <el-button type="default" @click="downloadAvatar" :disabled="!avatarUrl" class="preview-btn">
                <el-icon><Download /></el-icon>
                下载图片
              </el-button>
              <el-button type="primary" @click="handlePreviewUpdate" class="preview-btn">
                <el-icon><Camera /></el-icon>
                更新头像
              </el-button>
            </div>
          </div>
        </el-dialog>
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
import { UserFilled, Timer, Check, Close, Camera, ZoomIn, Download } from '@element-plus/icons-vue';
import gsap from 'gsap';
import { useAuthStore } from '@stores/auth';
import { api } from '@api';
import { ElMessage } from 'element-plus';
import '@/assets/styles/pages/profile.css';
import logger from '@utils/logger.ts';
import { updateUserInfoCache } from '@utils/request.ts';

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
  avatar?: string;
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

// 头像相关
const avatarUrl = ref('');
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarUploading = ref(false);
const avatarPreviewVisible = ref(false);
const defaultAvatar =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23ddd"/%3E%3Ccircle cx="50" cy="40" r="15" fill="%23999"/%3E%3Cpath d="M35 60 Q50 75 65 60" stroke="%23999" stroke-width="8" fill="none" stroke-linecap="round"/%3E%3C/svg%3E';

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
  logger.info('Particles container loaded', container);
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
    logger.error('获取用户数据失败:', error);
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
    // 设置头像
    if (typedUserInfo.avatar) {
      avatarUrl.value = typedUserInfo.avatar;
    }
  }
};

// 打开头像预览弹窗
const openAvatarPreview = () => {
  avatarPreviewVisible.value = true;
};

// 触发头像上传（供弹窗调用）
const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

// 下载头像
const downloadAvatar = () => {
  if (!avatarUrl.value) {
    ElMessage.warning('暂无头像可下载');
    return;
  }

  const link = document.createElement('a');
  link.href = avatarUrl.value;
  link.download = `avatar_${typedUserInfo?.username || 'user'}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success('头像下载成功');
};

// 从预览弹窗更新头像
const handlePreviewUpdate = () => {
  avatarPreviewVisible.value = false;
  triggerAvatarUpload();
};

// 处理头像上传
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    ElMessage.error('请选择有效的图片文件（JPG、PNG、GIF）');
    return;
  }

  // 验证文件大小（不超过2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB');
    return;
  }

  try {
    avatarUploading.value = true;

    const formData = new FormData();
    formData.append('avatar', file);

    // 调用上传API
    const res: any = await api.user.uploadAvatar(formData);

    if (res && res.avatar) {
      // 直接使用后端返回的头像路径，添加时间戳防止缓存
      avatarUrl.value = `${res.avatar}?t=${Date.now()}`;

      // 更新用户信息到 localStorage 和状态管理
      const updatedUserInfo = { ...userInfo, avatar: res.avatar };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
      authStore.setUserInfo(updatedUserInfo);
      updateUserInfoCache(updatedUserInfo);

      ElMessage.success('头像上传成功');
    }
  } catch (error) {
    logger.error('上传头像失败:', error);
    ElMessage.error('上传头像失败');
  } finally {
    avatarUploading.value = false;
    // 重置input，允许重新选择同一文件
    target.value = '';
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
    logger.error('修改用户信息失败:', error);
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
