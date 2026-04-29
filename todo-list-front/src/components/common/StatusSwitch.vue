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
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

/* 最强选择器 - 确保优先级最高 */
:root :deep(.status-switch-wrapper) :deep(.status-label.disabled.active) {
  color: #dc2626 !important;
}

:root :deep(.status-switch-wrapper) :deep(.status-label.enabled.active) {
  color: #22c55e !important;
}

:root :deep(.status-switch-wrapper) :deep(.status-label:not(.active)) {
  color: #94a3b8 !important;
}

:deep(.el-switch) {
  :deep(.el-switch__core) {
    background-color: rgba(@accent-red, 0.3);
    border-color: rgba(@accent-red, 0.4);

    &.is-checked {
      background-color: rgba(@accent-green, 0.5);
      border-color: rgba(@accent-green, 0.6);
    }
  }
}
</style>
