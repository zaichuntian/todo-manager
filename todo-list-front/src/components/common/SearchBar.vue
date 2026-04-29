<template>
  <div class="search-bar">
    <slot></slot>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

.search-bar {
  .flex-center();
  gap: @spacing-sm;
}

:deep(.el-input-group) {
  border-radius: @radius-md;
  overflow: hidden;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append .el-button) {
  background: transparent;
  border: none;
  margin: 0;
  padding: 0 @spacing-md;
  height: 100%;

  &:hover {
    background: rgba(@accent-blue, 0.15);
  }
}

:deep(.el-input__inner) {
  .input-dark();
}

/* 亮色主题样式 */
:deep(html.light .el-input__inner) {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #1e293b !important;

  &::placeholder {
    color: #94a3b8 !important;
  }

  &:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12) !important;
  }
}

:deep(.el-button--primary) {
  .btn-primary();
}

:deep(.el-button--info) {
  .btn-info();
}

:deep(.el-button--danger) {
  .btn-danger();
}
</style>
