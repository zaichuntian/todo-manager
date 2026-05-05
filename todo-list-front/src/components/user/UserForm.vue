<template>
  <el-form :model="localForm" :rules="rules" ref="formRef" label-width="80px">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="localForm.username" placeholder="请输入用户名" class="common-input" />
    </el-form-item>
    <el-form-item label="昵称" prop="nickname">
      <el-input v-model="localForm.nickname" placeholder="请输入昵称" class="common-input" />
    </el-form-item>
    <el-form-item v-if="isAdd" label="密码" prop="password">
      <el-input v-model="localForm.password" type="password" placeholder="请输入密码" class="common-input" />
    </el-form-item>
    <el-form-item v-if="isAdd" label="确认密码" prop="confirmPassword">
      <el-input v-model="localForm.confirmPassword" type="password" placeholder="请确认密码" class="common-input" />
    </el-form-item>
    <el-form-item label="手机号" prop="phone">
      <el-input v-model="localForm.phone" placeholder="请输入手机号" class="common-input" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="localForm.email" placeholder="请输入邮箱" class="common-input" />
    </el-form-item>
    <el-form-item label="角色" prop="role">
      <el-select v-model="localForm.role" placeholder="请选择角色">
        <el-option label="超级管理员" :value="2"></el-option>
        <el-option label="管理员" :value="1"></el-option>
        <el-option label="普通用户" :value="0"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-switch v-model="localForm.status" :active-value="1" :inactive-value="0"></el-switch>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { defineProps, defineExpose, ref, watch, defineEmits } from 'vue';
import type { UserFormData } from '@src-types/user';

const props = defineProps<{
  form: UserFormData;
  rules: any;
  isAdd: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:form', value: UserFormData): void;
}>();

const formRef = ref<any>(null);
const localForm = ref<UserFormData>({ ...props.form });

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
@import '@/assets/styles/base/variables.less';
@import '@/assets/styles/base/mixins.less';

.user-form {
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

.form-select {
  :deep(.el-select) {
    width: 100%;

    :deep(.el-input__inner) {
      .input-dark();
    }
  }
}

.form-switch {
  :deep(.el-switch) {
    :deep(.el-switch__core) {
      background-color: rgba(@accent-red, 0.3);

      &.is-checked {
        background-color: rgba(@accent-green, 0.5);
      }
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
