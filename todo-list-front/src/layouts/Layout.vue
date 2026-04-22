<template>
  <el-container style="height: 100vh">
    <!-- 关键：el-aside 的 width 改为动态绑定 -->
    <el-aside :width="isCollapsed ? '64px' : '200px'" style="background-color: #304156">
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
          <span>代办任务</span>
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
      <el-header class="header">
        <div class="breadcrumb-wrapper">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.path === '/todo'">代办任务</el-breadcrumb-item>
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

      <el-main class="main">
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
import { ArrowDown, UserFilled, HomeFilled, SwitchButton } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
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
  border-bottom: 1px solid #2b2f3a;
  cursor: pointer;
  transition: all 0.3s ease;
  cursor: pointer;

  // 折叠时隐藏文字，防止溢出
  &.collapsed {
    h3 {
      display: none;
    }
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

  &:hover {
    background-color: #f5f7fa;
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
}

/* 侧边栏容器动画 → 和菜单速度完全一致 */
:deep(.el-aside) {
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
