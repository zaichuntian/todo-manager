<template>
  <div class="home-page">
    <div class="page-header">
      <h2>我的任务概览</h2>
      <el-tag type="info">共 {{ total }} 条任务</el-tag>
    </div>

    <div class="task-card-list">
      <el-card v-for="task in tableData" :key="task.uuid" shadow="hover" class="task-card">
        <!-- 上部分：标题（header 插槽，占 20%） -->
        <template #header>
          <div class="card-header">
            <el-tag :type="task.status === 1 ? 'success' : 'warning'" size="small">
              {{ task.status === 1 ? '已完成' : '未完成' }}
            </el-tag>
            <span class="task-title">{{ task.title }}</span>
          </div>
        </template>

        <!-- 中间部分：内容（默认插槽，占 60%） -->
        <div class="card-body">
          <p class="task-content">{{ task.content || '暂无描述' }}</p>
        </div>

        <!-- 下部分：底部信息（footer 插槽，占 20%） -->
        <template #footer>
          <div class="card-footer">
            <div class="footer-left">
              <!-- 新增：创建人 -->
              <span class="creator">{{ task.user?.username || '未知用户' }}</span>
              <span class="divider">|</span>
              <!-- 原创建时间 -->
              <el-icon><Clock /></el-icon>
              <span>{{ formatTime(task.createdAt) }}</span>
            </div>
            <div class="footer-right">
              <el-button
                v-if="task.status === 0 && isMyTask(task)"
                type="primary"
                size="small"
                @click="handleComplete(task)"
              >
                完成任务
              </el-button>
              <el-tag v-else type="success" size="small">已完成</el-tag>
            </div>
          </div>
        </template>
      </el-card>

      <el-empty v-if="tableData.length === 0" description="暂无任务" style="grid-column: 1 / -1; margin-top: 50px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Clock } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { getTodosApi, updateTodoStatusApi } from '../api/todo';

const tableData = ref<any[]>([]);
const total = ref(0);
const loginUserUuid = ref(localStorage.getItem('userUuid') || '');

// 格式化时间
const formatTime = (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm');

// 判断是否是自己的任务
const isMyTask = (row: any) => {
  return row.userUuid === loginUserUuid.value;
};

// 获取任务列表
const getList = async () => {
  try {
    const res: any = await getTodosApi({ pageNum: 1, pageSize: 100 });
    if (res.code === 200) {
      tableData.value = res.data.list.filter((item: any) => item.status === 0);
      total.value = res.data.total;
    }
  } catch (err) {
    console.error('获取任务失败', err);
  }
};

// 完成任务（带确认）
const handleComplete = async (task: any) => {
  try {
    await ElMessageBox.confirm('确认将此任务标记为已完成吗？', '任务确认', {
      confirmButtonText: '确认完成',
      cancelButtonText: '取消',
      type: 'success',
    });
    await updateTodoStatusApi(task.uuid, 1);
    ElMessage.success('任务已完成！');
    getList();
  } catch {
    ElMessage.info('已取消操作');
  }
};

onMounted(() => {
  loginUserUuid.value = localStorage.getItem('userUuid') || '';
  getList();
});
</script>

<style scoped lang="less">
.home-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
}

.task-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.task-card {
  height: 220px;
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    height: 20%;
    display: flex;
    align-items: center;
    padding: 0 16px;
  }

  :deep(.el-card__body) {
    height: 60%;
    display: flex;
    align-items: center;
    padding: 16px;
  }

  :deep(.el-card__footer) {
    height: 20%;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-top: 1px solid #ebeef5;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;

  .task-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.card-body {
  .task-content {
    margin: 0;
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.card-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .footer-left {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #909399;
    font-size: 12px;

    .el-icon {
      font-size: 14px;
    }

    .creator {
      font-weight: 500;
    }

    .divider {
      color: #dcdfe6;
    }
  }
}
</style>
