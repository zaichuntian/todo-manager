<template>
  <div class="todo-page page-container">
    <el-card class="common-card">
      <div class="header-bar">
        <h3>代办任务</h3>
        <BaseButton type="primary" @click="handleAdd">新增任务</BaseButton>
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
            <div class="status-switch-wrapper">
              <span class="status-label disabled" :class="{ active: row.status === 0 }"> 未完成 </span>
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                :disabled="!isMyTask(row)"
                class="custom-switch"
                @change="(val: number) => handleStatusChange?.(row, val)"
              />
              <span class="status-label enabled" :class="{ active: row.status === 1 }"> 已完成 </span>
            </div>
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

    <el-dialog v-model="dialogVisible" title="任务信息" @keyup.enter="handleSubmit" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryUuid">
          <el-select v-model="form.categoryUuid" placeholder="请选择分类">
            <el-option
              v-for="category in categories"
              :key="category.uuid"
              :label="category.name"
              :value="category.uuid"
            />
          </el-select>
        </el-form-item>
      </el-form>
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
import BaseButton from '@/components/common/BaseButton.vue';
import { getCategoriesApi } from '@/api/category';
import type { Category } from '@/types/category';

// 使用任务管理自定义 Hook
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
  isMyTask,
  getList,
  handleStatusChange,
  handleAdd,
  handleEdit,
  handleDelete,
  handleSubmit,
} = useTodo();

// 分类列表
const categories = ref<Category[]>([]);

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await getCategoriesApi({ pageNum: 1, pageSize: 100 });
    if (response.code === 200 && response.data) {
      categories.value = response.data.list || [];
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 初始化
onMounted(() => {
  fetchCategories();
});
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
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
.status-switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.status-label {
  font-size: 12px;
  color: #999; /* 默认灰色 */
  transition: color 0.2s;
}

/* 激活时高亮 */
.status-label.disabled.active {
  color: #e6a23c;
}

.status-label.enabled.active {
  color: #13ce66;
}

:deep(.custom-switch) .el-switch__core {
  border-color: #e6a23c;
  background-color: #e6a23c !important;
}

:deep(.custom-switch.is-checked) .el-switch__core {
  border-color: #13ce66;
  background-color: #13ce66 !important;
}
</style>
