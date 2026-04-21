<template>
  <div class="category-page">
    <el-card>
      <div class="header-bar">
        <h3>分类管理</h3>
        <el-button type="primary" @click="handleAdd">新增分类</el-button>
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
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next, sizes"
          @current-change="getList"
          @size-change="getList"
        />
      </div>
    </el-card>

    <!-- 分类任务弹窗 -->
    <el-dialog v-model="taskDialogVisible" title="分类任务" width="80%" append-to-body>
      <div v-if="currentCategory" class="category-tasks">
        <h4>{{ currentCategory.name }} - 任务列表</h4>
        <el-table :data="categoryTasks" border style="width: 100%" v-if="categoryTasks.length > 0">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="title" label="标题" align="center" />
          <el-table-column prop="content" label="内容" align="center" />
          <el-table-column label="状态" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'">
                {{ row.status === 1 ? '已完成' : '未完成' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center">
            <template #default="{ row }">
              {{ formatTime(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-tasks">
          <el-empty description="该分类下暂无任务" />
        </div>
      </div>
      <template #footer>
        <el-button @click="taskDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="分类信息" @keyup.enter="handleSubmit" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
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
  formatTime,
  isMyCategory,
  getList,
  handleAdd,
  handleEdit,
  handleDelete,
  handleSubmit,
  getCategoryWithTodos,
} = useCategory();

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
.header-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.category-tasks {
  margin-top: 20px;

  h4 {
    margin-bottom: 15px;
    color: #333;
  }
}

.empty-tasks {
  margin: 40px 0;
  text-align: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>
