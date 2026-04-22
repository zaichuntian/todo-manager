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

<style scoped>
.common-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.common-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
</style>
