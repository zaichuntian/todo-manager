import { getTodosApi, updateTodoStatusApi, deleteTodoApi, addTodoApi, updateTodoApi } from './todo';
import {
  loginApi,
  registerApi,
  getUserListApi,
  updateUserApi,
  deleteUserApi,
  updateUserStatusApi,
  uploadAvatarApi,
} from './user';
import { getCategoriesApi, addCategoryApi, updateCategoryApi, deleteCategoryApi } from './category';
import { getLoginQrCode, checkLoginStatus, wechatLoginCallback } from './wechat';
import { logger } from '@/utils/logger';
import { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * 请求拦截
 * @param config
 */
const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  logger.debug(`请求: ${config.method?.toUpperCase()} ${config.url}`);
  logger.debug('请求参数:', config.data || config.params);
  return config;
};

/**
 * 响应拦截
 * @param response
 */
const responseInterceptor = (response: AxiosResponse) => {
  logger.debug(`响应: ${response.config.url}`, response.data);
  return response;
};

/**
 * 错误拦截
 * @param error
 */
const errorInterceptor = (error: AxiosError) => {
  logger.error('请求失败:', error.message);
  if (error.response) {
    logger.error('响应状态:', error.response.status);
    logger.error('响应数据:', error.response.data);
  }
  return Promise.reject(error);
};

export const api = {
  // 任务相关
  todo: {
    getList: getTodosApi,
    add: addTodoApi,
    update: updateTodoApi,
    delete: deleteTodoApi,
    updateStatus: updateTodoStatusApi,
  },

  // 用户相关
  user: {
    login: loginApi,
    register: registerApi,
    getList: getUserListApi,
    update: updateUserApi,
    delete: deleteUserApi,
    updateStatus: updateUserStatusApi,
    uploadAvatar: uploadAvatarApi,
  },

  // 分类相关
  category: {
    getList: getCategoriesApi,
    add: addCategoryApi,
    update: updateCategoryApi,
    delete: deleteCategoryApi,
  },

  // 微信登录相关
  wechat: {
    getLoginQrCode,
    checkLoginStatus,
    wechatLoginCallback,
  },
};

export { requestInterceptor, responseInterceptor, errorInterceptor };
export default api;
