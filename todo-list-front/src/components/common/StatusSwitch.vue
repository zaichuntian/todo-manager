<template>
  <div class="status-switch-wrapper">
    <span class="status-label disabled" :class="{ active: value === 0 }">{{ inactiveText }}</span>
    <el-switch
      :model-value="value"
      :active-value="1"
      :inactive-value="0"
      :disabled="disabled"
      class="custom-switch"
      @change="handleChange"
    />
    <span class="status-label enabled" :class="{ active: value === 1 }">{{ activeText }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  value: number;
  disabled?: boolean;
  activeText?: string;
  inactiveText?: string;
}>();

const emit = defineEmits<{
  (e: 'update:value', value: number): void;
  (e: 'change', value: number): void;
}>();

const handleChange = (value: number) => {
  emit('update:value', value);
  emit('change', value);
};
</script>

<style scoped lang="less">
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
