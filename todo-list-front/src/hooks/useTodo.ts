import { ref, onMounted } from 'vue';
import { getTodosApi, addTodoApi, updateTodoApi, deleteTodoApi, updateTodoStatusApi } from '../api/todo';
import { useCrud } from './useCrud';
import { formatTime } from '../utils/format';
import type { Todo, TodoFormData } from '../types/todo';

/**
 * 任务管理自定义 Hook
 */
export function useTodo() {
  const loginUserUuid = ref('');

  // 使用通用 CRUD Hook
  const crud = useCrud<Todo, TodoFormData>({
    getListApi: getTodosApi,
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
    },
    initialForm: {
      uuid: '',
      title: '',
      content: '',
    },
  });

  // 判断是否是自己的任务
  const isMyTask = (row: Todo) => {
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
    isMyTask,
  };
}
