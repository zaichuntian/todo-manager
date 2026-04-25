import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 自定义响应类型
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

// 缓存用户信息到内存中
let cachedUserInfo: any = null;

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 优先从缓存获取用户信息，缓存不存在时从localStorage读取
    if (!cachedUserInfo) {
      cachedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    }
    if (cachedUserInfo.token) {
      // 检查用户状态：如果账户已被禁用，提示用户
      if (cachedUserInfo.status === 0) {
        ElMessage.error('您的账户已被禁用，请联系管理员开通权限');
        router.push('/401');
        return Promise.reject(new Error('账户已被禁用'));
      }
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${cachedUserInfo.token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 提供更新缓存的方法
export const updateUserInfoCache = (userInfo: any) => {
  cachedUserInfo = userInfo;
};

// 提供清除缓存的方法
export const clearUserInfoCache = () => {
  cachedUserInfo = null;
};

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 处理304响应
    if (response.status === 304) {
      return response.data;
    }

    // 处理正常响应
    const { code, data, msg } = response.data as ApiResponse;
    if (code !== 200) {
      ElMessage.error(msg || '请求失败');
      return Promise.reject(new Error(msg || '请求失败'));
    }
    return data;
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      ElMessage.error('登录已过期，请重新登录');
      router.push('/login');
    } else if (error.response?.status === 403) {
      ElMessage.error('无权限操作');
      router.push('/403');
    } else if (error.response?.status === 404) {
      ElMessage.error('请求的资源不存在');
      router.push('/404');
    } else {
      // 不显示304的错误提示
      if (error.response?.status !== 304) {
        ElMessage.error(error.response?.data?.msg || '网络请求失败');
      }
    }
    return Promise.reject(error);
  }
);

export default request;
