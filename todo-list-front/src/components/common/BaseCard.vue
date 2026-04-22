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

<style scoped>
.common-card {
  background: transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.common-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
}
</style>
