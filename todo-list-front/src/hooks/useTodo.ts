import { getTodosApi, addTodoApi, updateTodoApi, deleteTodoApi, updateTodoStatusApi } from '../api/todo';
import { useCrud } from './useCrud';
import { formatTime } from '@utils/format';
import { useAuth } from './useAuth';
import type { Todo, TodoFormData } from '@src-types/todo';

/**
 * 任务管理自定义 Hook
 */
export function useTodo() {
  const { loginUser, hasPermission } = useAuth();

  // 搜索表单类型
  interface SearchForm {
    title?: string;
    content?: string;
  }

  // 使用通用 CRUD Hook
  const crud = useCrud<Todo, TodoFormData, SearchForm>({
    getListApi: params => getTodosApi(params),
    addApi: addTodoApi,
    updateApi: updateTodoApi,
    deleteApi: deleteTodoApi,
    updateStatusApi: updateTodoStatusApi,
    rules: {
      title: [
        { required: true, message: '请输入标题', trigger: 'blur' },
        { min: 2, max: 50, message: '2-50字符', trigger: 'blur' },
      ],
      content: [
        { required: true, message: '请输入内容', trigger: 'blur' },
        { min: 2, max: 200, message: '2-200字符', trigger: 'blur' },
      ],
      categoryUuid: [{ required: true, message: '请选择分类', trigger: 'change' }],
    },
    initialForm: {
      uuid: '',
      title: '',
      content: '',
      categoryUuid: '',
    },
    // 搜索表单初始数据
    initialSearchForm: {
      title: '',
      content: '',
    },
  });

  // 判断是否是自己的任务或有权限操作
  const isMyTask = (row: Todo) => {
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
    isMyTask,
  };
}
