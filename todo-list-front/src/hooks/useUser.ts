import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import dayjs from 'dayjs';
import { getUserListApi, deleteUserApi, updateUserApi, registerApi, updateUserStatusApi } from '../api/user';
import { encrypt } from '../utils/crypto';
import type { User, UserFormData, UserListParams, UserRules } from '../types/user';

/**
 * 用户管理自定义 Hook
 */
export function useUser() {
  // 响应式数据
  const tableData = ref<User[]>([]);
  const total = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(5);
  const dialogVisible = ref(false);
  const isAdd = ref(true);
  const formRef = ref<InstanceType<typeof ElForm>>();

  const form = ref<UserFormData>({
    uuid: '',
    username: '',
    password: '',
  });

  // 表单校验规则
  const rules = ref<UserRules>({
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度需在 2-20 个字符之间', trigger: 'blur' },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度需在 6-20 个字符之间', trigger: 'blur' },
    ],
  });

  // 格式化时间
  const formatTime = (time: string) => {
    return dayjs(time).format('YYYY.MM.DD HH:mm:ss');
  };

  // 重置表单
  const resetForm = () => {
    form.value = { uuid: '', username: '', password: '' };
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  };

  // 获取用户列表
  // 获取用户列表
  const getUserList = async () => {
    try {
      const params: UserListParams = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      };
      const res = await getUserListApi(params);

      // 直接检查响应对象
      // @ts-ignore
      if (res && res.code === 200 && res.data) {
        // @ts-ignore
        tableData.value = res.data.list || [];
        // @ts-ignore
        total.value = res.data.total || 0;
      } else {
        // @ts-ignore
        ElMessage.error(res?.msg || '获取用户列表失败');
      }
    } catch (error) {
      console.error('请求错误:', error); // 调试用
      ElMessage.error('网络请求失败，请稍后重试');
    }
  };

  // 新增用户
  const handleAdd = () => {
    isAdd.value = true;
    resetForm();
    dialogVisible.value = true;
  };

  // 编辑用户
  const handleEdit = (row: User) => {
    isAdd.value = false;
    form.value = {
      uuid: row.uuid,
      username: row.username,
      password: '',
    };
    dialogVisible.value = true;
    setTimeout(() => {
      formRef.value?.clearValidate();
    }, 0);
  };

  // 删除用户
  const handleDelete = async (row: User) => {
    try {
      await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
        type: 'warning',
      });
      await deleteUserApi(row.uuid);
      ElMessage.success('删除成功');
      getUserList();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败，请稍后重试');
      }
    }
  };

  // 状态开关变更
  const handleStatusChange = async (row: User, val: number) => {
    try {
      await updateUserStatusApi(row.uuid, val);

      if (val === 1) {
        ElMessage.success(`${row.username} 用户已启用`);
      } else {
        ElMessage.success(`${row.username} 用户已禁用`);
      }
    } catch (err) {
      ElMessage.error('状态更新失败');
      row.status = val === 1 ? 0 : 1;
    }
  };

  // 提交新增/编辑
  const handleSubmit = async () => {
    try {
      const valid = await formRef.value?.validate();
      if (!valid) return;

      if (isAdd.value) {
        await registerApi({
          username: form.value.username,
          password: encrypt(form.value.password),
        });
        ElMessage.success('新增成功');
      } else {
        await updateUserApi(form.value.uuid, {
          username: form.value.username,
        });
        ElMessage.success('修改成功');
      }

      dialogVisible.value = false;
      getUserList();
    } catch (error) {
      ElMessage.error('操作失败，请稍后重试');
    }
  };

  // 初始化数据
  onMounted(() => {
    getUserList();
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

    // 方法
    formatTime,
    getUserList,
    handleAdd,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleSubmit,
  };
}
