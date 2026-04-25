<template>
  <div class="category-page page-container">
    <el-card class="common-card">
      <div class="header-bar">
        <h3>分类管理</h3>
        <SearchBar>
          <div style="display: flex; align-items: center">
            <el-input
              v-model="searchForm.name"
              placeholder="搜索分类名称"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
              @input="handleInputChange"
            />
            <el-button @click="handleSearch" style="margin-left: -1px; border-radius: 0 4px 4px 0" tabindex="-1"
              ><el-icon><Search /></el-icon
            ></el-button>
          </div>
          <el-button type="info" @click="resetSearch" style="margin-left: 10px"
            ><el-icon><Refresh /></el-icon> 重置</el-button
          >
          <el-button type="primary" @click="handleAdd" style="margin-left: 10px">新增分类</el-button>
        </SearchBar>
      </div>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="80" align="center" />

        <el-table-column prop="name" label="分类名称" align="center" />

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

        <el-table-column label="操作" width="300" align="center">
          <template #default="{ row }">
            <el-button v-if="isMyCategory(row)" type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
            <el-button v-if="isMyCategory(row)" type="warning" link @click="handleViewTasks(row)"> 查看任务 </el-button>
            <el-button v-if="isMyCategory(row)" type="danger" link @click="handleDelete(row)"> 删除 </el-button>
            <span v-else style="color: #999">无操作权限</span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 添加分页组件 -->
      <Pagination
        :page-num="pageNum"
        :page-size="pageSize"
        :total="total"
        @current-change="getList"
        @size-change="getList"
      />
    </el-card>

    <!-- 分类任务弹窗 -->
    <el-dialog v-model="taskDialogVisible" title="分类任务" width="80%" append-to-body>
      <CategoryTasks :category="currentCategory" :tasks="categoryTasks" />
      <template #footer>
        <el-button @click="taskDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="分类信息" @keyup.enter="handleSubmit" append-to-body>
      <CategoryForm
        v-model:form="form"
        :rules="rules"
        :available-parent-categories="availableParentCategories"
        ref="formRef"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCategory } from '../hooks/useCategory';
import SearchBar from '@/components/common/SearchBar.vue';
import Pagination from '@/components/common/Pagination.vue';
import CategoryForm from '@/components/category/CategoryForm.vue';
import CategoryTasks from '@/components/category/CategoryTasks.vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import type { Category } from '../types/category';
import type { Todo } from '../types/todo';

// 使用分类管理自定义 Hook
const {
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
  isMyCategory,
  getList,
  handleAdd,
  handleEdit,
  handleDelete,
  handleSubmit,
  getCategoryWithTodos,
  availableParentCategories,
} = useCategory();

// 自定义搜索方法
const handleSearch = async () => {
  // 检查是否输入了搜索内容
  if (!searchForm.value.name) {
    ElMessage.warning('请输入搜索内容');
    return;
  }

  pageNum.value = 1;
  await getList();
};

// 自定义重置搜索方法
const resetSearch = () => {
  searchForm.value = {
    name: '',
  };
  pageNum.value = 1;
  getList();
};

// 输入框内容变化时触发实时搜索
const handleInputChange = async () => {
  pageNum.value = 1;
  await getList();
};

// 分类任务相关
const taskDialogVisible = ref(false);
const currentCategory = ref<Category | null>(null);
const categoryTasks = ref<Todo[]>([]);

// 查看分类任务
const handleViewTasks = async (row: Category) => {
  const categoryWithTodos = await getCategoryWithTodos(row.uuid);
  if (categoryWithTodos) {
    currentCategory.value = categoryWithTodos;
    categoryTasks.value = categoryWithTodos.todos || [];
    taskDialogVisible.value = true;
  }
};
</script>

<style scoped lang="less">
.category-page {
  background-color: transparent;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
</style>
