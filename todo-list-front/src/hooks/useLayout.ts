import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ElMessage } from 'element-plus';

export function useLayout() {
  const authStore = useAuthStore();
  const router = useRouter();
  const route = useRoute();

  const isCollapsed = ref(false);

  // 监听窗口宽度变化
  const handleResize = () => {
    isCollapsed.value = window.innerWidth < 700;
  };

  // 用计算属性动态获取当前路由
  const activeMenu = computed(() => {
    const path = route.path;
    if (path.startsWith('/user')) {
      return '/user';
    }
    return path;
  });

  const handleLogout = () => {
    // 修复：将 clearToken 改为 clearUserInfo
    authStore.clearUserInfo();
    ElMessage.success('退出登录成功');
    router.push('/login');
  };

  const refreshPage = () => {
    router.go(0);
  };

  onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    isCollapsed,
    activeMenu,
    handleLogout,
    refreshPage,
  };
}
