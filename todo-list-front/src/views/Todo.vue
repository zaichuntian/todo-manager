<template>
  <div class="todo-page page-container">
    <el-card class="common-card">
      <div class="header-bar">
        <h3>任务管理</h3>
        <SearchBar>
          <div style="display: flex; align-items: center">
            <el-input
              v-model="searchForm.title"
              placeholder="搜索任务标题"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
              @input="handleInputChange"
              @clear="handleClear"
            />
            <el-button @click="handleSearch" style="margin-left: -1px; border-radius: 0 4px 4px 0" tabindex="-1"
              ><el-icon><Search /></el-icon
            ></el-button>
          </div>
          <div style="display: flex; align-items: center; margin-left: 10px">
            <el-input
              v-model="searchForm.content"
              placeholder="搜索任务内容"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
              @input="handleInputChange"
              @clear="handleClear"
            />
            <el-button @click="handleSearch" style="margin-left: -1px; border-radius: 0 4px 4px 0" tabindex="-1"
              ><el-icon><Search /></el-icon
            ></el-button>
          </div>
          <el-button type="info" @click="resetSearch" style="margin-left: 10px" :loading="resetLoading"
            ><el-icon v-show="!resetLoading"><Refresh /></el-icon> 重置</el-button
          >
          <BaseButton type="primary" @click="handleAdd" style="margin-left: 10px">新增任务</BaseButton>
        </SearchBar>
      </div>

      <el-table :data="tableData" border class="table-container">
        <el-table-column type="index" label="序号" width="80" align="center" />

        <el-table-column label="创建者" align="center">
          <template #default="{ row }">
            {{ row.user?.username || '未知用户' }}
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" align="center" />
        <el-table-column prop="content" label="内容" align="center" />

        <el-table-column label="创建时间" align="center">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="更新时间" align="center">
          <template #default="{ row }">
            {{ formatTime(row.updatedAt) }}
          </template>
        </el-table-column>

        <!-- 新增：完成状态列 -->
        <el-table-column label="完成状态" width="180" align="center">
          <template #default="{ row }">
            <!-- 仅自己的任务可切换状态 -->
            <StatusSwitch
              :value="row.status"
              :disabled="!isMyTask(row)"
              active-text="已完成"
              inactive-text="未完成"
              @change="(val: number) => handleStatusChange?.(row, val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <BaseButton v-if="isMyTask(row)" type="primary" link @click="handleEdit(row)"> 编辑 </BaseButton>
            <BaseButton v-if="isMyTask(row)" type="danger" link @click="handleDelete(row)"> 删除 </BaseButton>
            <span v-else style="color: #999">无操作权限</span>
          </template>
        </el-table-column>
      </el-table>

      <Pagination
        :page-num="pageNum"
        :page-size="pageSize"
        :total="total"
        @current-change="getList"
        @size-change="getList"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="任务信息" @keyup.enter="handleSubmit" append-to-body>
      <TodoForm v-model:form="form" :rules="rules" :categories="categories" ref="formRef" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <BaseButton type="primary" @click="handleSubmit">确定</BaseButton>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTodo } from '@/hooks/useTodo';
import { debounce } from 'lodash';
import BaseButton from '@/components/common/BaseButton.vue';
import SearchBar from '@/components/common/SearchBar.vue';
import Pagination from '@/components/common/Pagination.vue';
import StatusSwitch from '@/components/common/StatusSwitch.vue';
import TodoForm from '@/components/todo/TodoForm.vue';
import { getCategoriesApi } from '@/api/category';
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import type { Category } from '@/types/category';

// 使用任务管理自定义 Hook
let {
  tableData,
  total,
  pageNum,
  pageSize,
  dialogVisible,
  formRef,
  form,
  rules,
  searchForm,
  formatTime,
  isMyTask,
  getList,
  handleStatusChange,
  handleAdd,
  handleEdit,
  handleDelete,
  handleSubmit,
} = useTodo();

// 防抖搜索
const debouncedSearch = debounce(async () => {
  await getList();
}, 200);

// 自定义搜索方法
const handleSearch = () => {
  // 检查是否输入了搜索内容
  if (!searchForm.value.title && !searchForm.value.content) {
    ElMessage.warning('请输入搜索内容');
    return;
  }

  pageNum.value = 1;
  debouncedSearch();
};

// 加载状态
const resetLoading = ref(false);

// 自定义重置搜索方法
const resetSearch = async () => {
  resetLoading.value = true;
  searchForm.value = {
    title: '',
    content: '',
  };
  pageNum.value = 1;
  try {
    // 等待 2 秒，确保 loading 动画显示足够长的时间
    await new Promise(resolve => setTimeout(resolve, 300));
    await getList();
  } finally {
    resetLoading.value = false;
  }
};

// 输入框内容变化时触发实时搜索
const handleInputChange = () => {
  pageNum.value = 1;
  debouncedSearch();
};

// 处理输入框清空事件
const handleClear = () => {
  pageNum.value = 1;
  debouncedSearch();
};

// 分类列表
const categories = ref<Category[]>([]);

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response: any = await getCategoriesApi({ pageNum: 1, pageSize: 100 });
    // 检查响应格式
    if (response && response.list) {
      // 直接使用response.list
      categories.value = response.list || [];
    } else if (response && response.data && response.data.list) {
      // 使用response.data.list
      categories.value = response.data.list || [];
    } else {
      categories.value = [];
    }
  } catch (error) {
    categories.value = [];
  }
};

// 初始化
onMounted(async () => {
  await fetchCategories();
});

// 重写handleEdit方法，确保分类列表已加载
const originalHandleEdit = handleEdit;
handleEdit = async (row: any) => {
  // 确保分类列表已加载
  if (categories.value.length === 0) {
    await fetchCategories();
  }
  // 等待分类列表加载完成后再打开编辑弹框
  await new Promise(resolve => setTimeout(resolve, 100));
  originalHandleEdit(row);
};
</script>

<style scoped lang="less">
.todo-page {
  background-color: transparent;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
