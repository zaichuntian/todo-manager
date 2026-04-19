import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import dayjs from 'dayjs';
import { getTodosApi, addTodoApi, updateTodoApi, deleteTodoApi, updateTodoStatusApi } from '../api/todo';
import type { Todo, TodoFormData, TodoListParams, TodoRules } from '../types/todo';

/**
 * 任务管理自定义 Hook
 */
export function useTodo() {
  // 响应式数据
  const tableData = ref<Todo[]>([]);
  const total = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(5);
  const dialogVisible = ref(false);
  const isAdd = ref(true);
  const formRef = ref<InstanceType<typeof ElForm>>();
  const loginUserUuid = ref('');

  const form = ref<TodoFormData>({
    uuid: '',
    title: '',
    content: '',
  });

  // 表单校验规则
  const rules = ref<TodoRules>({
    title: [
      { required: true, message: '请输入标题', trigger: 'blur' },
      { min: 2, max: 50, message: '2-50字符', trigger: 'blur' },
    ],
    content: [
      { required: true, message: '请输入内容', trigger: 'blur' },
      { min: 2, max: 200, message: '2-200字符', trigger: 'blur' },
    ],
  });

  // 格式化时间
  const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

  // 判断是否是自己的任务
  const isMyTask = (row: Todo) => {
    return row.userUuid === loginUserUuid.value;
  };

  // 重置表单
  const resetForm = () => {
    form.value = { uuid: '', title: '', content: '' };
    setTimeout(() => formRef.value?.clearValidate(), 0);
  };

  // 获取列表
  const getList = async () => {
    try {
      const params: TodoListParams = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      };
      const res = await getTodosApi(params);

      // @ts-ignore
      if (res && res.code === 200 && res.data) {
        tableData.value = res.data.list || [];
        total.value = res.data.total || 0;
      } else {
        // @ts-ignore
        ElMessage.error(res?.msg || '获取任务列表失败');
      }
    } catch (error) {
      console.error('请求错误:', error);
      ElMessage.error('网络请求失败，请稍后重试');
    }
  };

  // 状态切换
  const handleStatusChange = async (row: Todo, status: number) => {
    try {
      await updateTodoStatusApi(row.uuid, status);
      ElMessage.success('状态更新成功');
      await getList();
    } catch (err: any) {
      // 失败时回显状态
      row.status = row.status === 1 ? 0 : 1;
      ElMessage.error(err.response?.data?.msg || '状态更新失败');
    }
  };

  // 新增
  const handleAdd = () => {
    isAdd.value = true;
    resetForm();
    dialogVisible.value = true;
  };

  // 编辑
  const handleEdit = (row: Todo) => {
    isAdd.value = false;
    form.value = { ...row };
    dialogVisible.value = true;
    setTimeout(() => formRef.value?.clearValidate(), 0);
  };

  // 删除
  const handleDelete = async (row: Todo) => {
    try {
      await ElMessageBox.confirm('确定删除该任务？', '提示');
      await deleteTodoApi(row.uuid);
      ElMessage.success('删除成功');
      await getList();
    } catch {
      ElMessage.info('已取消');
    }
  };

  // 提交
  const handleSubmit = async () => {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return ElMessage.warning('请填写完整信息');

    try {
      if (isAdd.value) {
        await addTodoApi(form.value);
        ElMessage.success('新增成功');
      } else {
        await updateTodoApi(form.value.uuid, form.value);
        ElMessage.success('修改成功');
      }
      dialogVisible.value = false;
      await getList();
    } catch (err: any) {
      ElMessage.error(err.response?.data?.msg || '操作失败');
    }
  };

  // 初始化数据
  onMounted(() => {
    // 从本地获取当前用户uuid
    loginUserUuid.value = localStorage.getItem('userUuid') || '';
    getList();
  });

  return {
    // 状态数据
    tableData,
    total,
    pageNum,
    pageSize,
    dialogVisible,
    isAdd,
    formRef,
    form,
    rules,
    loginUserUuid,

    // 方法
    formatTime,
    isMyTask,
    getList,
    handleStatusChange,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
  };
}
