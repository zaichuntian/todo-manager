<template>
  <el-form :model="localForm" :rules="rules" ref="formRef" label-width="80px">
    <el-form-item label="分类名称" prop="name">
      <el-input v-model="localForm.name" placeholder="请输入分类名称" />
    </el-form-item>
    <el-form-item label="分类描述" prop="description">
      <el-input v-model="localForm.description" type="textarea" :rows="3" placeholder="请输入分类描述" />
    </el-form-item>
    <el-form-item label="分类颜色" prop="color">
      <el-color-picker v-model="localForm.color" value-format="hex" />
    </el-form-item>
    <el-form-item label="分类图标" prop="icon">
      <el-input v-model="localForm.icon" placeholder="请输入图标名称，如：Folder" />
    </el-form-item>
    <el-form-item label="父分类" prop="parentUuid">
      <el-select v-model="localForm.parentUuid" placeholder="请选择父分类">
        <el-option label="无" value="" />
        <el-option
          v-for="category in availableParentCategories"
          :key="category.uuid"
          :label="category.name"
          :value="category.uuid"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { defineProps, defineExpose, ref, watch, defineEmits } from 'vue';
import type { CategoryFormData } from '@/types/category';
import type { Category } from '@/types/category';

const props = defineProps<{
  form: CategoryFormData;
  rules: any;
  availableParentCategories: Category[];
}>();

const emit = defineEmits<{
  (e: 'update:form', value: CategoryFormData): void;
}>();

const formRef = ref<any>(null);
const localForm = ref<CategoryFormData>({ ...props.form });

// 监听props.form变化，更新本地form
watch(
  () => props.form,
  newForm => {
    // 只有当props.form与localForm不同时才更新，避免循环更新
    if (JSON.stringify(newForm) !== JSON.stringify(localForm.value)) {
      localForm.value = { ...newForm };
    }
  },
  { deep: true }
);

// 监听本地form变化，通知父组件
watch(
  localForm,
  newForm => {
    emit('update:form', newForm);
  },
  { deep: true }
);

defineExpose({
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate(),
  getFormData: () => localForm.value,
});
</script>
<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

.category-form {
  .flex-wrap();
  flex-direction: column;
  gap: @spacing-md;
}

.form-item {
  position: relative;
}

.form-label {
  color: @text-secondary;
  font-size: @font-size-sm;
  margin-bottom: @spacing-xs;
  display: block;
}

.form-input {
  .input-dark();
  width: 100%;
  padding: @spacing-sm @spacing-md;
  height: 40px;
}

.form-textarea {
  .input-dark();
  width: 100%;
  padding: @spacing-sm @spacing-md;
  min-height: 80px;
  resize: vertical;
}

.form-color-picker {
  :deep(.el-color-picker) {
    :deep(.el-input__inner) {
      .input-dark();
    }
  }
}

.form-select {
  :deep(.el-select) {
    width: 100%;

    :deep(.el-input__inner) {
      .input-dark();
    }
  }
}

.form-footer {
  .flex-end();
  gap: @spacing-sm;
  margin-top: @spacing-lg;
}

.btn-cancel {
  .btn-info();
}

.btn-submit {
  .btn-primary();
}
</style>
