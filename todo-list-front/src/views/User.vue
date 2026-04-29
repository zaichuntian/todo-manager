<template>
  <div class="user-page page-container">
    <BaseCard v-if="hasUserManagementPermission()">
      <!-- 顶部操作栏 -->
      <div class="header-bar">
        <h3>用户管理</h3>
        <SearchBar>
          <div style="display: flex; align-items: center">
            <el-input
              v-model="searchForm.username"
              placeholder="搜索用户名"
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
              v-model="searchForm.phone"
              placeholder="搜索手机号"
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
          <el-button type="danger" @click="handleBatchDeleteClick" style="margin-left: 10px"
            ><el-icon><Delete /></el-icon> 批量删除</el-button
          >
          <BaseButton type="primary" @click="handleAdd" style="margin-left: 10px">新增用户</BaseButton>
        </SearchBar>
      </div>

      <!-- 用户表格 -->
      <div class="table-container">
        <el-table :data="tableData" border style="width: 1565px" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="username" width="120" label="用户名" align="center" />
          <el-table-column label="角色" width="120" align="center">
            <template #default="{ row }">
              <el-tag :style="getRoleTagStyle(row.role)" style="width: 80px; text-align: center">
                {{ row.role === 2 ? '超级管理员' : row.role === 1 ? '管理员' : '普通用户' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nickname" width="120" label="昵称" align="center" />
          <el-table-column prop="phone" width="150" label="手机号" align="center" />
          <el-table-column prop="email" width="220" label="邮箱" align="center" show-overflow-tooltip />
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
          <el-table-column label="状态" width="170" align="center">
            <template #default="{ row }">
              <StatusSwitch
                :value="row.status"
                active-text="启用"
                inactive-text="禁用"
                @change="(val: number) => handleStatusChange?.(row, val)"
              />
            </template>
          </el-table-column>

          <el-table-column label="操作" width="130" align="center">
            <template #default="{ row }">
              <el-button link style="color: #6ab0ff" @click="handleEdit(row)">编辑</el-button>
              <el-button link style="color: #f87171" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页组件 -->
      <Pagination
        :page-num="pageNum"
        :page-size="pageSize"
        :total="total"
        @current-change="
          page => {
            pageNum = page;
            getUserList();
          }
        "
        @size-change="
          size => {
            pageSize = size;
            getUserList();
          }
        "
      />
    </BaseCard>
    <el-empty v-else description="无权限访问此页面" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="用户信息" append-to-body>
      <UserForm v-model:form="form" :rules="rules" :is-add="isAdd" ref="formRef" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <BaseButton type="primary" @click="handleSubmit">确定</BaseButton>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUser } from '@/hooks/useUser';
import { debounce } from 'lodash';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Delete } from '@element-plus/icons-vue';
import BaseCard from '@/components/common/BaseCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import SearchBar from '@/components/common/SearchBar.vue';
import Pagination from '@/components/common/Pagination.vue';
import StatusSwitch from '@/components/common/StatusSwitch.vue';
import UserForm from '@/components/user/UserForm.vue';
import '@/assets/css/pages/user.css';

// 使用用户管理自定义 Hook
const {
  tableData,
  total,
  pageNum,
  pageSize,
  dialogVisible,
  isAdd,
  formRef,
  form,
  rules,
  searchForm,
  formatTime,
  getUserList,
  handleAdd,
  handleEdit,
  handleDelete,
  handleBatchDelete,
  handleStatusChange,
  handleSubmit,
  hasUserManagementPermission,
} = useUser();

// 批量选择的用户
const selectedRows = ref<any[]>([]);

// 处理选择变化
const handleSelectionChange = (val: any[]) => {
  selectedRows.value = val;
};

// 防抖搜索
const debouncedSearch = debounce(async () => {
  await getUserList();
}, 200);

// 自定义搜索方法
const handleSearch = () => {
  // 检查是否输入了搜索内容
  if (!searchForm.value.username && !searchForm.value.phone) {
    ElMessage.warning('请输入搜索内容');
    return;
  }

  pageNum.value = 1;
  debouncedSearch();
};

const getRoleTagStyle = (role: number) => {
  switch (role) {
    case 2:
      return {
        backgroundColor: 'rgba(248, 113, 113, 0.2) !important',
        borderColor: 'rgba(248, 113, 113, 0.3) !important',
        color: 'rgba(248, 113, 113, 0.9) !important',
      };
    case 1:
      return {
        backgroundColor: 'rgba(34, 197, 94, 0.2) !important',
        borderColor: 'rgba(34, 197, 94, 0.3) !important',
        color: 'rgba(34, 197, 94, 0.9) !important',
      };
    default:
      return {
        backgroundColor: 'rgba(106, 176, 255, 0.2) !important',
        borderColor: 'rgba(106, 176, 255, 0.3) !important',
        color: 'rgba(106, 176, 255, 0.9) !important',
      };
  }
};

// 加载状态
const resetLoading = ref(false);

// 自定义重置搜索方法
const resetSearch = async () => {
  resetLoading.value = true;
  searchForm.value.username = '';
  searchForm.value.phone = '';
  pageNum.value = 1;
  try {
    // 等待 2 秒，确保 loading 动画显示足够长的时间
    await new Promise(resolve => setTimeout(resolve, 300));
    await getUserList();
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

// 处理批量删除
const handleBatchDeleteClick = async () => {
  const selectedUuids = selectedRows.value.map((row: any) => row.uuid);
  await handleBatchDelete(selectedUuids);
};
</script>