<template>
  <div class="pagination-wrapper">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="currentPageSize"
      :total="total"
      :page-sizes="[5, 10, 15]"
      layout="total, prev, pager, next, sizes"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps<{
  pageNum: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits<{
  (e: 'current-change', page: number): void;
  (e: 'size-change', size: number): void;
}>();

// 使用ref存储当前页码和每页大小
const currentPage = ref(props.pageNum);
const currentPageSize = ref(props.pageSize);

// 监听props变化，更新ref
watch(
  () => props.pageNum,
  newValue => {
    currentPage.value = newValue;
  }
);

watch(
  () => props.pageSize,
  newValue => {
    currentPageSize.value = newValue;
  }
);

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  emit('current-change', page);
};

const handleSizeChange = (size: number) => {
  currentPageSize.value = size;
  emit('size-change', size);
};
</script>

<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

.pagination-wrapper {
  .flex-center();
  justify-content: flex-end;
  padding: @spacing-md @spacing-lg;
  width: 100%;
  box-sizing: border-box;
}

:deep(.el-pagination) {
  color: @text-secondary;

  .btn-prev,
  .btn-next {
    background: rgba(@bg-primary, 0.9) !important;
    border: 1px solid @border-color !important;
    color: @text-secondary !important;

    &:hover {
      background: rgba(@accent-blue, 0.2) !important;
      border-color: rgba(@accent-blue, 0.4) !important;
      color: @accent-blue !important;
    }

    &:disabled {
      opacity: 0.3;
    }
  }

  .el-pager li {
    background: rgba(@bg-primary, 0.9) !important;
    border: 1px solid @border-color !important;
    color: @text-secondary !important;

    &:hover {
      background: rgba(@accent-blue, 0.2) !important;
      border-color: rgba(@accent-blue, 0.4) !important;
      color: @accent-blue !important;
    }

    &.active {
      background: rgba(@accent-blue, 0.3) !important;
      border-color: @accent-blue !important;
      color: #fff !important;
    }
  }

  .el-select {
    :deep(.el-input__inner) {
      .input-dark();
    }
  }
}
</style>
