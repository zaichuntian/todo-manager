import { ref, onMounted } from 'vue';
import { getTodosApi, addTodoApi, updateTodoApi, deleteTodoApi, updateTodoStatusApi } from '../api/todo';
import { useCrud } from './useCrud';
import { formatTime } from '../utils/format';
import type { Todo, TodoFormData } from '../types/todo';
import type { UserInfo } from '../types/user';

/**
 * 任务管理自定义 Hook
 */
export function useTodo() {
  const loginUser = ref<UserInfo>({
    userUuid: '',
    username: '',
    role: 0,
    token: '',
  });

  // 使用通用 CRUD Hook
  const crud = useCrud<Todo, TodoFormData>({
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
    },
    initialForm: {
      uuid: '',
      title: '',
      content: '',
    },
  });

  // 判断是否是自己的任务或有权限操作
  const isMyTask = (row: Todo) => {
    // 超级管理员(2)和管理员(1)可以操作所有任务
    if (loginUser.value.role === 2 || loginUser.value.role === 1) {
      return true;
    }
    // 普通用户只能操作自己的任务
    return row.userUuid === loginUser.value.userUuid;
  };

  // 初始化数据
  onMounted(() => {
    // 从本地获取当前用户信息
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      loginUser.value = JSON.parse(userInfoStr);
    }
    crud.getList();
  });

  return {
    // 从 CRUD Hook 中解构出需要的状态和方法
    ...crud,
    // 额外的状态和方法
    loginUser,
    formatTime,
    isMyTask,
  };
}
