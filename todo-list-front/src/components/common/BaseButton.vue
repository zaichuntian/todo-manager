<template>
  <el-button :type="type" :size="size" class="common-button" v-bind="$attrs">
    <slot></slot>
  </el-button>
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'default',
  },
});
</script>

<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

.common-button {
  .btn-base();
  border-radius: @radius-md;

  &:hover {
    .shadow-sm();
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

:deep(.el-button--text) {
  .btn-text();
}
</style>
