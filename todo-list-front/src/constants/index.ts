// API 相关常量
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'todo_manager_token',
  USER_INFO: 'todo_manager_user',
};

// 路由名称
export const ROUTE_NAMES = {
  HOME: 'Home',
  LOGIN: 'Login',
  TODO: 'Todo',
  CATEGORY: 'Category',
  PROFILE: 'Profile',
};
