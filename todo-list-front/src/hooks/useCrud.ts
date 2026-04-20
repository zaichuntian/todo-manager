import { ref, Ref } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import type { FormRules, PaginationParams } from '../types/common';

/**
 * CRUD 通用 Hook 配置
 */
interface UseCrudOptions<F> {
  // API 方法
  getListApi: (params: PaginationParams) => Promise<any>;
  addApi: (data: F) => Promise<any>;
  updateApi: (id: string, data: F) => Promise<any>;
  deleteApi: (id: string) => Promise<any>;
  // 可选的状态更新 API
  updateStatusApi?: (id: string, status: number) => Promise<any>;
  // 表单规则
  rules: FormRules;
  // 初始表单数据
  initialForm: F;
}

/**
 * CRUD 通用 Hook 返回值
 */
interface UseCrudReturn<T, F> {
  // 状态数据
  tableData: Ref<T[]>;
  total: Ref<number>;
  pageNum: Ref<number>;
  pageSize: Ref<number>;
  dialogVisible: Ref<boolean>;
  isAdd: Ref<boolean>;
  formRef: Ref<InstanceType<typeof ElForm> | undefined>;
  form: Ref<F>;
  rules: Ref<FormRules>;
  // 方法
  getList: () => Promise<void>;
  handleAdd: () => void;
  handleEdit: (row: T) => void;
  handleDelete: (row: T & { uuid: string }) => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleStatusChange?: (row: T & { uuid: string; status: number }, status: number) => Promise<void>;
  resetForm: () => void;
}

/**
 * CRUD 通用 Hook
 * @param options 配置选项
 * @returns CRUD 相关状态和方法
 */
export function useCrud<T, F>(options: UseCrudOptions<F>): UseCrudReturn<T, F> {
  // 响应式数据
  const tableData = ref<T[]>([]);
  const total = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(5);
  const dialogVisible = ref(false);
  const isAdd = ref(true);
  const formRef = ref<InstanceType<typeof ElForm>>();

  const form = ref<F>({ ...options.initialForm });
  const rules = ref<FormRules>(options.rules);

  // 重置表单
  const resetForm = () => {
    form.value = { ...options.initialForm };
    setTimeout(() => formRef.value?.clearValidate(), 0);
  };

  // 获取列表
  const getList = async () => {
    try {
      const params: PaginationParams = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      };
      const res = await options.getListApi(params);

      if (res && res.code === 200 && res.data) {
        tableData.value = res.data.list || [];
        total.value = res.data.total || 0;
      } else {
        ElMessage.error(res?.msg || '获取列表失败');
      }
    } catch (error) {
      console.error('请求错误:', error);
      ElMessage.error('网络请求失败，请稍后重试');
    }
  };

  // 新增
  const handleAdd = () => {
    isAdd.value = true;
    resetForm();
    dialogVisible.value = true;
  };

  // 编辑
  const handleEdit = (row: T) => {
    isAdd.value = false;
    // 使用类型断言，假设 row 可以转换为 F 类型
    form.value = { ...row } as unknown as F;
    dialogVisible.value = true;
    setTimeout(() => formRef.value?.clearValidate(), 0);
  };

  // 删除
  const handleDelete = async (row: T & { uuid: string }) => {
    try {
      await ElMessageBox.confirm('确定删除该记录？', '提示');
      await options.deleteApi(row.uuid);
      ElMessage.success('删除成功');
      await getList();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败，请稍后重试');
      }
    }
  };

  // 提交
  const handleSubmit = async () => {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) {
      ElMessage.warning('请填写完整信息');
      return;
    }

    try {
      if (isAdd.value) {
        await options.addApi(form.value);
        ElMessage.success('新增成功');
      } else {
        // 假设 form.value 包含 uuid 属性
        const row = form.value as F & { uuid: string };
        await options.updateApi(row.uuid, form.value);
        ElMessage.success('修改成功');
      }
      dialogVisible.value = false;
      await getList();
    } catch (err: any) {
      ElMessage.error(err.response?.data?.msg || '操作失败');
    }
  };

  // 状态切换
  let handleStatusChange: ((row: T & { uuid: string; status: number }, status: number) => Promise<void>) | undefined;

  if (options.updateStatusApi) {
    handleStatusChange = async (row: T & { uuid: string; status: number }, status: number) => {
      try {
        await options.updateStatusApi!(row.uuid, status);
        ElMessage.success('状态更新成功');
        await getList();
      } catch (err: any) {
        // 失败时回显状态
        row.status = row.status === 1 ? 0 : 1;
        ElMessage.error(err.response?.data?.msg || '状态更新失败');
      }
    };
  }

  return {
    // 状态数据
    tableData: tableData as Ref<T[]>,
    total,
    pageNum,
    pageSize,
    dialogVisible,
    isAdd,
    formRef,
    form: form as Ref<F>,
    rules,
    // 方法
    getList,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleStatusChange,
    resetForm,
  } as UseCrudReturn<T, F>;
}
