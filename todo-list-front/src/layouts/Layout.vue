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
        background-color="#304156"
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
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-icon><User /></el-icon>
              欢迎回来
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item v-if="route.path === '/todo'">代办任务</el-breadcrumb-item>
          <el-breadcrumb-item v-if="route.path === '/user'">用户管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

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
import { User, ArrowDown, UserFilled, HomeFilled } from '@element-plus/icons-vue';
import { useRoute } from 'vue-router';
import { useLayout } from '../hooks/useLayout';
import { useAnimation } from '@/hooks/useAnimation';
import { useCommon } from '@/hooks/useCommon.ts';

const route = useRoute();
const { isCollapsed, activeMenu, handleLogout } = useLayout();
const { enterAnimation, leaveAnimation } = useAnimation();
const { goHomePage } = useCommon();
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
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  padding: 0 20px;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.breadcrumb-wrapper {
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.main {
  background: #f5f7fa;
  padding: 20px;
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
