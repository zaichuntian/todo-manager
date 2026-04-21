import { ref, onMounted } from 'vue';
import {
  getCategoriesApi,
  addCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getCategoryWithTodosApi,
} from '../api/category';
import { useCrud } from './useCrud';
import { formatTime } from '../utils/format';
import { ElMessage } from 'element-plus';
import type { Category, CategoryFormData } from '../types/category';
import type { UserInfo } from '../types/user';

/**
 * 分类管理自定义 Hook
 */
export function useCategory() {
  const loginUser = ref<UserInfo>({
    userUuid: '',
    username: '',
    role: 0,
    token: '',
  });

  // 使用通用 CRUD Hook
  const crud = useCrud<Category, CategoryFormData>({
    getListApi: params => getCategoriesApi(params),
    addApi: data => addCategoryApi(data),
    updateApi: (uuid, data) => updateCategoryApi(uuid, data),
    deleteApi: uuid => deleteCategoryApi(uuid),
    rules: {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 2, max: 50, message: '2-50字符', trigger: 'blur' },
      ],
    },
    initialForm: {
      uuid: '',
      name: '',
    },
  });

  // 获取分类及其任务
  const getCategoryWithTodos = async (uuid: string) => {
    try {
      const response = await getCategoryWithTodosApi(uuid);
      return response.data;
    } catch (error) {
      console.error('获取分类任务失败:', error);
      return null;
    }
  };

  // 判断是否是自己的分类或有权限操作
  const isMyCategory = (row: Category) => {
    // 确保用户信息已初始化
    if (!loginUser.value.userUuid) {
      return false;
    }
    // 超级管理员(2)和管理员(1)可以操作所有分类
    if (loginUser.value.role === 2 || loginUser.value.role === 1) {
      return true;
    }
    // 普通用户只能操作自己的分类
    return row.userUuid === loginUser.value.userUuid;
  };

  // 初始化数据
  onMounted(() => {
    // 从本地获取当前用户信息
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        loginUser.value = JSON.parse(userInfoStr);
        console.log('用户信息:', loginUser.value);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        ElMessage.error('用户信息解析失败');
      }
    } else {
      console.error('本地存储中没有用户信息');
      ElMessage.error('请先登录');
    }
    crud.getList();
  });

  return {
    // 从 CRUD Hook 中解构出需要的状态和方法
    ...crud,
    // 额外的状态和方法
    loginUser,
    formatTime,
    isMyCategory,
    getCategoryWithTodos,
  };
}
