<template>
  <el-container style="height: 100vh">
    <!-- 关键：el-aside 的 width 改为动态绑定 -->
    <el-aside :width="isCollapsed ? '64px' : '200px'" style="background-color: #304156">
      <!-- 折叠时隐藏logo文字，避免溢出 -->
      <div class="logo" @click="refreshPage" :class="{ collapsed: isCollapsed }">
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
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isCollapsed = ref(false);

// 监听窗口宽度变化
const handleResize = () => {
  isCollapsed.value = window.innerWidth < 700;
};

// 核心：用计算属性动态获取当前路由
const activeMenu = computed(() => {
  const path = route.path;
  if (path.startsWith('/user')) {
    return '/user';
  }
  return path;
});

const handleLogout = () => {
  authStore.clearToken();
  router.push('/login');
};

const refreshPage = () => {
  router.go(0);
};

// 进入动画
const enterAnimation = (el: HTMLElement, done: () => void) => {
  const tl = gsap.timeline({
    onComplete: done,
  });

  tl.fromTo(
    el,
    { opacity: 0, x: 12 }, // 起始位置：右边10px，透明
    {
      opacity: 0.8,
      x: -3, // 移动到左边-10px，半透明
      duration: 0.5,
      ease: 'power2.inOut',
    }
  ).to(el, {
    opacity: 1, // 回到原点，完全不透明
    x: 0,
    duration: 0.3,
    ease: 'power2.out',
  });
};

// 离开动画
const leaveAnimation = (el: HTMLElement, done: () => void) => {
  const tl = gsap.timeline({
    onComplete: done,
  });

  tl.to(el, {
    opacity: 0, // 从100%变为0%
    x: 10, // 从原点移动到右边10px
    duration: 0.2,
    ease: 'power2.out',
    onComplete: done,
  });
};

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
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
