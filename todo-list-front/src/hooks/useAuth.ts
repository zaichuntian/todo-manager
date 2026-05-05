import { computed } from 'vue';
import { useAuthStore } from '@stores/auth';
import { updateUserInfoCache, clearUserInfoCache } from '@utils/request';

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

  // 检查是否是普通用户
  const isNormalUser = computed(() => {
    return authStore.userInfo.role === 0;
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

  // 检查是否有权限管理用户
  const canManageUsers = computed(() => {
    return authStore.userInfo.role === 2 || authStore.userInfo.role === 1;
  });

  // 检查是否有权限管理任务
  const canManageTasks = computed(() => {
    return true; // 所有用户都可以管理自己的任务
  });

  // 检查是否有权限管理分类
  const canManageCategories = computed(() => {
    return true; // 所有用户都可以管理自己的分类
  });

  // 登录方法，同时更新缓存
  const login = (userInfo: any) => {
    authStore.setUserInfo(userInfo);
    updateUserInfoCache(userInfo);
  };

  // 登出方法，同时清除缓存
  const logout = () => {
    authStore.clearUserInfo();
    clearUserInfoCache();
  };

  return {
    loginUser: computed(() => authStore.userInfo),
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    isNormalUser,
    hasPermission,
    canManageUsers,
    canManageTasks,
    canManageCategories,
    login,
    logout,
    setUserInfo: authStore.setUserInfo,
    clearUserInfo: authStore.clearUserInfo,
  };
}
