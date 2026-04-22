import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 自定义响应类型
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

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
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo.token && userInfo.userUuid) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
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
      ElMessage.error(error.response?.data?.msg || '网络请求失败');
    }
    return Promise.reject(error);
  }
);

export default request;
