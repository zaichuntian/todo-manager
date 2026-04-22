<template>
  <div class="user-page page-container">
    <BaseCard v-if="hasUserManagementPermission()">
      <!-- 顶部操作栏 -->
      <div class="header-bar">
        <h3>用户管理</h3>
        <BaseButton type="primary" @click="handleAdd">新增用户</BaseButton>
      </div>

      <!-- 用户表格 -->
      <div class="table-container">
        <el-table :data="tableData" border style="width: 1565px">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="username" width="120" label="用户名" align="center" />
          <el-table-column prop="nickname" width="120" label="昵称" align="center" />
          <el-table-column prop="phone" width="150" label="手机号" align="center" />
          <el-table-column prop="email" width="200" label="邮箱" align="center" />
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
              <div class="status-switch-wrapper">
                <span class="status-label disabled" :class="{ active: row.status === 0 }"> 禁用 </span>
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  class="custom-switch"
                  @change="(val: number) => handleStatusChange?.(row, val)"
                />
                <span class="status-label enabled" :class="{ active: row.status === 1 }"> 启用 </span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="130" align="center">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 15]"
          layout="total, prev, pager, next, sizes"
          @current-change="getUserList"
          @size-change="getUserList"
        />
      </div>
    </BaseCard>
    <el-empty v-else description="无权限访问此页面" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="用户信息" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" class="common-input" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" class="common-input" />
        </el-form-item>
        <el-form-item v-if="isAdd" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" class="common-input" />
        </el-form-item>
        <el-form-item v-if="isAdd" label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" class="common-input" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" class="common-input" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" class="common-input" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="超级管理员" :value="2"></el-option>
            <el-option label="管理员" :value="1"></el-option>
            <el-option label="普通用户" :value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0"></el-switch>
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
import { useUser } from '@/hooks/useUser';
import BaseCard from '@/components/common/BaseCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';

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
  formatTime,
  getUserList,
  handleAdd,
  handleEdit,
  handleDelete,
  handleStatusChange,
  handleSubmit,
  hasUserManagementPermission,
} = useUser();
</script>

<style scoped lang="less">
.user-page {
  background-color: transparent;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
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
  color: #ff4949;
}

.status-label.enabled.active {
  color: #13ce66;
}

:deep(.custom-switch) .el-switch__core {
  border-color: #ff4949;
  background-color: #ff4d4f !important;
}

:deep(.custom-switch.is-checked) .el-switch__core {
  border-color: #13ce66;
  background-color: #13ce66 !important;
}
</style>
