<template>
  <el-container style="height: 100vh">
    <el-aside width="200px" style="background-color: #304156">
      <div class="logo">
        <h3>安全登录系统</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
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
          <el-breadcrumb-item v-if="route.path === '/user'">用户管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { User, ArrowDown, UserFilled, HomeFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue';

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// 核心：用计算属性动态获取当前路由
const activeMenu = computed(() => {
  const path = route.path
  // 可以在这里加路由匹配逻辑，比如嵌套路由的情况
  if (path.startsWith('/user')) {
    return '/user'
  }
  return path
})

const handleLogout = () => {
  authStore.clearToken()
  router.push('/login')
}
</script>

<style scoped>
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  border-bottom: 1px solid #2b2f3a;
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
</style>