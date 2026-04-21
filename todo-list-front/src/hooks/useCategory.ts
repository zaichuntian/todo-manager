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
import type { Category, CategoryFormData } from '../types/category';

/**
 * 分类管理自定义 Hook
 */
export function useCategory() {
  const loginUserUuid = ref('');

  // 使用通用 CRUD Hook
  const crud = useCrud<Category, CategoryFormData>({
    getListApi: params => getCategoriesApi(params),
    addApi: addCategoryApi,
    updateApi: updateCategoryApi,
    deleteApi: deleteCategoryApi,
    rules: {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 1, max: 50, message: '1-50字符', trigger: 'blur' },
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

  // 判断是否是自己的分类
  const isMyCategory = (row: Category) => {
    return row.userUuid === loginUserUuid.value;
  };

  // 初始化数据
  onMounted(() => {
    // 从本地获取当前用户uuid
    loginUserUuid.value = localStorage.getItem('userUuid') || '';
    crud.getList();
  });

  return {
    // 从 CRUD Hook 中解构出需要的状态和方法
    ...crud,
    // 额外的状态和方法
    loginUserUuid,
    formatTime,
    isMyCategory,
    getCategoryWithTodos,
  };
}
