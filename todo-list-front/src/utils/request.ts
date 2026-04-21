import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 直接从 localStorage 拿 token，不依赖 Pinia
request.interceptors.request.use(config => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (userInfo.token && userInfo.userUuid) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

request.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userInfo');
      ElMessage.error('登录已过期，请重新登录');
      router.push('/login');
    }
    ElMessage.error(err.response?.data?.msg || '请求失败');
    return Promise.reject(err);
  }
);

export default request;
