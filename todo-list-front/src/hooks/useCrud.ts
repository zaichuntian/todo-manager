import { ref, Ref, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox, ElForm } from 'element-plus';
import { debounce } from 'lodash';
import type { FormRules, PaginationParams } from '../types/common';

/**
 * CRUD 通用 Hook 配置
 */
export interface UseCrudOptions<F, S = any> {
  // API 方法
  getListApi: (params: PaginationParams & S) => Promise<any>;
  addApi: (data: F) => Promise<any>;
  updateApi: (id: string, data: F) => Promise<any>;
  deleteApi: (id: string) => Promise<any>;
  // 可选的批量删除 API
  batchDeleteApi?: (ids: string[]) => Promise<any>;
  // 可选的状态更新 API
  updateStatusApi?: (id: string, status: number) => Promise<any>;
  // 表单规则
  rules: FormRules;
  // 初始表单数据
  initialForm: F;
  // 搜索表单初始数据
  initialSearchForm?: S;
}

/**
 * CRUD 通用 Hook 返回值
 */
interface UseCrudReturn<T, F, S = any> {
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
  searchForm: Ref<S>;
  // 方法
  getList: () => Promise<void>;
  handleAdd: () => void;
  handleEdit: (row: T) => void;
  handleDelete: (row: T & { uuid: string }) => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleStatusChange?: (row: T & { uuid: string; status: number }, status: number) => Promise<void>;
  handleBatchDelete: (ids: string[]) => Promise<void>;
  resetForm: () => void;
  handleSearch: () => Promise<void>;
  resetSearch: () => void;
}

/**
 * CRUD 通用 Hook
 * @param options 配置选项
 * @returns CRUD 相关状态和方法
 */
export function useCrud<T, F, S = any>(options: UseCrudOptions<F, S>): UseCrudReturn<T, F, S> {
  // 响应式数据
  const tableData = ref<T[]>([]);
  const total = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(10);
  const dialogVisible = ref(false);
  const isAdd = ref(true);
  const formRef = ref<InstanceType<typeof ElForm>>();
  const searchForm = ref<S>(options.initialSearchForm || ({} as S));

  const form = ref<F>({ ...options.initialForm } as F);
  const rules = ref<FormRules>(options.rules);

  // 重置表单
  const resetForm = () => {
    form.value = { ...options.initialForm };
    setTimeout(() => formRef.value?.clearValidate(), 0);
  };

  // 获取列表
  const getList = async () => {
    try {
      // 只传递非空的搜索参数
      const params: any = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
      };

      // 过滤掉空值的搜索参数
      Object.entries({ ...searchForm.value }).forEach(([key, value]) => {
        if (value) {
          params[key] = value;
        }
      });

      const res = await options.getListApi(params as PaginationParams & S);

      if (res) {
        if (res.list && typeof res.total === 'number') {
          // 格式1：直接返回分页数据
          tableData.value = res.list || [];
          total.value = res.total || 0;
        } else if (res.data && res.data.list && typeof res.data.total === 'number') {
          // 格式2：完整的响应对象
          tableData.value = res.data.list || [];
          total.value = res.data.total || 0;
        } else {
          ElMessage.error('获取列表失败：数据格式错误');
        }
      } else {
        ElMessage.error('获取列表失败');
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
    if (!formRef.value) {
      ElMessage.warning('表单引用不存在');
      return;
    }

    try {
      // 检查formRef.value是否有validate方法
      if (formRef.value.validate) {
        await formRef.value.validate();
      } else {
        ElMessage.warning('表单验证方法不存在');
        return;
      }
    } catch (error) {
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

  // 优化：添加批量操作方法
  const handleBatchDelete = async (ids: string[]) => {
    if (ids.length === 0) {
      ElMessage.warning('请选择要删除的记录');
      return;
    }

    try {
      await ElMessageBox.confirm('确定删除选中的记录？', '提示');
      if (options.batchDeleteApi) {
        // 使用批量删除 API
        await options.batchDeleteApi(ids);
      } else {
        // 回退到逐个删除
        for (const id of ids) {
          await options.deleteApi(id);
        }
      }
      ElMessage.success('删除成功');
      await getList();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败，请稍后重试');
      }
    }
  };

  // 状态切换
  let handleStatusChange: ((row: T & { uuid: string; status: number }, status: number) => Promise<void>) | undefined;

  if (options.updateStatusApi) {
    handleStatusChange = async (row: T & { uuid: string; status: number }, status: number) => {
      try {
        if (options.updateStatusApi) {
          await options.updateStatusApi(row.uuid, status);
        }
        ElMessage.success('状态更新成功');
        await getList();
      } catch (err: any) {
        // 失败时回显状态
        row.status = row.status === 1 ? 0 : 1;
        ElMessage.error(err.response?.data?.msg || '状态更新失败');
      }
    };
  }

  // 防抖搜索
  const debouncedSearch = debounce(() => {
    getList();
  }, 1000);

  // 组件卸载时清理防抖定时器
  onUnmounted(() => {
    // 清理防抖定时器
    debouncedSearch.cancel();
  });

  // 搜索
  const handleSearch = () => {
    pageNum.value = 1; // 搜索时重置页码
    debouncedSearch();
  };

  // 重置搜索
  const resetSearch = () => {
    searchForm.value = { ...options.initialSearchForm };
    pageNum.value = 1; // 重置时也重置页码
    debouncedSearch();
  };

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
    searchForm,
    // 方法
    getList,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleStatusChange,
    handleBatchDelete,
    resetForm,
    handleSearch,
    resetSearch,
  } as UseCrudReturn<T, F, S>;
}
