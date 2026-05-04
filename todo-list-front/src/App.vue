<template>
  <div class="app-container">
    <RefreshAnimation :visible="showLoading" :duration="1400" @complete="onLoadingComplete" />
    <!-- 路由视图 -->
    <div class="content-container">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- 全局错误提示 -->
    <el-notification
      v-if="errorMessage"
      :title="'错误'"
      :message="errorMessage"
      type="error"
      :duration="3000"
      @close="errorMessage = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { ElNotification } from 'element-plus';
import RefreshAnimation from '@/components/effect/RefreshAnimation.vue';

const errorMessage = ref('');
const showLoading = ref(true);

const onLoadingComplete = () => {
  showLoading.value = false;
};
// 全局错误捕获
const handleError = (err: Error, _instance: any, info: string) => {
  console.error('全局错误:', err);
  console.error('错误信息:', info);
  errorMessage.value = `发生错误: ${err.message}`;
  return true; // 阻止错误继续传播
};

// 注册全局错误捕获
onErrorCaptured(handleError);

// 全局未捕获错误处理
window.addEventListener('error', event => {
  console.error('未捕获的错误:', event.error);
  errorMessage.value = `发生未捕获的错误: ${event.error?.message || '未知错误'}`;
});

// 全局未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise拒绝:', event.reason);
  errorMessage.value = `发生Promise错误: ${event.reason?.message || '未知错误'}`;
});
</script>

<style>
/* 全局基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.content-container {
  position: relative;
  z-index: 1;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
