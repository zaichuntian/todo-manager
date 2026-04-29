<template>
  <div class="search-bar">
    <slot></slot>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

:deep(.el-input .el-input__inner) {
  border: none !important;
}

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
