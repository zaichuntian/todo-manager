<template>
  <div v-if="category" class="category-tasks">
    <h4>{{ category.name }} - 任务列表</h4>
    <el-table :data="tasks" border style="width: 100%" v-if="tasks.length > 0">
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
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { formatTime } from '@utils/format';
import type { Category } from '@src-types/category';
import type { Todo } from '@src-types/todo';

defineProps<{
  category: Category | null;
  tasks: Todo[];
}>();
</script>

<style scoped lang="less">
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
</style>
