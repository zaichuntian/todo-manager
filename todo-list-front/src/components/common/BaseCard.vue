<template>
  <el-card :shadow="shadow" class="common-card" v-bind="$attrs">
    <template #header v-if="$slots.header">
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
  </el-card>
</template>

<script setup lang="ts">
defineProps({
  shadow: {
    type: String,
    default: 'hover',
  },
});
</script>

<style scoped lang="less">
@import '@/assets/styles/base/variables.less';
@import '@/assets/styles/base/mixins.less';

.base-card {
  .card-dark();
  .card-hover();
}
</style>
