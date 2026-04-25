<template>
  <el-form :model="localForm" :rules="rules" ref="formRef" label-width="80px">
    <el-form-item label="标题" prop="title">
      <el-input v-model="localForm.title" placeholder="请输入标题" />
    </el-form-item>
    <el-form-item label="内容" prop="content">
      <el-input v-model="localForm.content" type="textarea" :rows="3" />
    </el-form-item>
    <el-form-item label="分类" prop="categoryUuid">
      <el-select v-model="localForm.categoryUuid" placeholder="请选择分类">
        <el-option v-for="category in categories" :key="category.uuid" :label="category.name" :value="category.uuid" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { defineProps, defineExpose, ref, watch, defineEmits } from 'vue';
import type { TodoFormData } from '@/types/todo';
import type { Category } from '@/types/category';

const props = defineProps<{
  form: TodoFormData;
  rules: any;
  categories: Category[];
}>();

const emit = defineEmits<{
  (e: 'update:form', value: TodoFormData): void;
}>();

const formRef = ref<any>(null);
const localForm = ref<TodoFormData>({ ...props.form });

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
