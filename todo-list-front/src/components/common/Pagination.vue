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
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}
</style>
