import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

/**
 * 认证相关的自定义 Hook
 */
export function useAuth() {
  const authStore = useAuthStore();

  // 检查是否已登录
  const isLoggedIn = computed(() => {
    return !!authStore.userInfo.userUuid;
  });

  // 检查是否是超级管理员
  const isSuperAdmin = computed(() => {
    return authStore.userInfo.role === 2;
  });

  // 检查是否是管理员
  const isAdmin = computed(() => {
    return authStore.userInfo.role === 1 || authStore.userInfo.role === 2;
  });

  // 检查是否有权限操作指定用户的资源
  const hasPermission = (resourceUserUuid: string) => {
    // 超级管理员和管理员可以操作所有资源
    if (authStore.userInfo.role === 2 || authStore.userInfo.role === 1) {
      return true;
    }
    // 普通用户只能操作自己的资源
    return resourceUserUuid === authStore.userInfo.userUuid;
  };

  return {
    loginUser: computed(() => authStore.userInfo),
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    hasPermission,
    setUserInfo: authStore.setUserInfo,
    clearUserInfo: authStore.clearUserInfo,
  };
}
