import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserListApi, deleteUserApi, updateUserApi, registerApi, updateUserStatusApi } from '../api/user';
import { encrypt } from '../utils/crypto';
import { useCrud } from './useCrud';
import { formatDateTime } from '../utils/format';
import type { User, UserFormData } from '../types/user';
import type { UserInfo } from '../types/user';

/**
 * 用户管理自定义 Hook
 */
export function useUser() {
  const loginUser = ref<UserInfo>({
    userUuid: '',
    username: '',
    role: 0,
    token: '',
  });

  // 使用通用 CRUD Hook
  const crud = useCrud<User, UserFormData>({
    getListApi: getUserListApi,
    // 自定义新增 API 调用，需要加密密码
    addApi: async data => {
      return await registerApi({
        username: data.username,
        password: encrypt(data.password),
      });
    },
    // 自定义更新 API 调用，只更新用户名
    updateApi: async (id, data) => {
      return await updateUserApi(id, {
        username: data.username,
      });
    },
    deleteApi: deleteUserApi,
    updateStatusApi: updateUserStatusApi,
    rules: {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '用户名长度需在 2-20 个字符之间', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度需在 6-20 个字符之间', trigger: 'blur' },
      ],
    },
    initialForm: {
      uuid: '',
      username: '',
      password: '',
    },
  });

  // 自定义状态变更处理，添加用户名提示
  const handleStatusChange = async (row: User, val: number) => {
    try {
      await updateUserStatusApi(row.uuid, val);

      if (val === 1) {
        ElMessage.success(`${row.username} 用户已启用`);
      } else {
        ElMessage.success(`${row.username} 用户已禁用`);
      }
      await crud.getList();
    } catch (err) {
      ElMessage.error('状态更新失败');
      row.status = val === 1 ? 0 : 1;
    }
  };

  // 检查是否有权限管理用户
  const hasUserManagementPermission = () => {
    // 只有超级管理员(2)和管理员(1)可以管理用户
    return loginUser.value.role === 2 || loginUser.value.role === 1;
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
    // 覆盖默认的状态变更方法
    handleStatusChange,
    // 重命名方法以保持兼容性
    getUserList: crud.getList,
    // 使用格式化工具函数
    formatTime: formatDateTime,
    // 权限检查方法
    hasUserManagementPermission,
    loginUser,
  };
}
