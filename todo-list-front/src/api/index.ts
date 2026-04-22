// API 调用管理

import { getTodosApi, updateTodoStatusApi, deleteTodoApi, addTodoApi, updateTodoApi } from './todo';
import { loginApi, registerApi, getUserListApi, updateUserApi, deleteUserApi, updateUserStatusApi } from './user';
import { getCategoriesApi, addCategoryApi, updateCategoryApi, deleteCategoryApi } from './category';

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
  },

  // 分类相关
  category: {
    getList: getCategoriesApi,
    add: addCategoryApi,
    update: updateCategoryApi,
    delete: deleteCategoryApi,
  },
};

export default api;
