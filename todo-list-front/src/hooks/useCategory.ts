import { ref, computed } from 'vue';
import {
  getCategoriesApi,
  addCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getCategoryWithTodosApi,
} from '@api/category';
import { useCrud } from './useCrud';
import { formatTime } from '@utils/format';
import { useAuth } from './useAuth';
import type { Category, CategoryFormData } from '@src-types/category';

/**
 * 分类管理自定义 Hook
 */
export function useCategory() {
  const { loginUser, hasPermission } = useAuth();
  const categories = ref<Category[]>([]);

  // 搜索表单类型
  interface SearchForm {
    name?: string;
  }

  // 使用通用 CRUD Hook
  const crud = useCrud<Category, CategoryFormData, SearchForm>({
    getListApi: async params => {
      const res = await getCategoriesApi(params);
      if (res && res.data && res.data.list) {
        categories.value = res.data.list;
      }
      return res;
    },
    addApi: data => addCategoryApi(data),
    updateApi: (uuid, data) => updateCategoryApi(uuid, data),
    deleteApi: uuid => deleteCategoryApi(uuid),
    rules: {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 1, max: 50, message: '分类名称长度需在 1-50 个字符之间', trigger: 'blur' },
      ],
      description: [{ max: 200, message: '分类描述长度不能超过 200 个字符', trigger: 'blur' }],
      color: [{ required: true, message: '请选择分类颜色', trigger: 'blur' }],
      icon: [{ max: 50, message: '图标名称长度不能超过 50 个字符', trigger: 'blur' }],
    },
    initialForm: {
      name: '',
      description: '',
      color: '#409EFF',
      icon: 'Folder',
      parentUuid: '',
    },
    // 搜索表单初始数据
    initialSearchForm: {
      name: '',
    },
  });

  // 可用的父分类列表（排除当前编辑的分类）
  const availableParentCategories = computed(() => {
    const currentUuid = (crud.form.value as any).uuid;
    return categories.value.filter(category => category.uuid !== currentUuid);
  });

  // 获取分类及其任务
  const getCategoryWithTodos = async (uuid: string) => {
    try {
      const response = await getCategoryWithTodosApi(uuid);
      return response && response.data ? response.data : null;
    } catch (error) {
      console.error('获取分类任务失败:', error);
      return null;
    }
  };

  // 判断是否是自己的分类或有权限操作
  const isMyCategory = (row: Category) => {
    return hasPermission(row.userUuid);
  };

  // 初始化数据
  crud.getList();

  return {
    // 从 CRUD Hook 中解构出需要的状态和方法
    ...crud,
    // 额外的状态和方法
    loginUser,
    formatTime,
    isMyCategory,
    getCategoryWithTodos,
    categories,
    availableParentCategories,
  };
}
