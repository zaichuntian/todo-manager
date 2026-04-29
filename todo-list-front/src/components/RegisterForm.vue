<template>
  <div class="login-card">
    <!-- 动态网格背景 -->
    <div class="grid-bg"></div>
    <!-- 光效扫描线 -->
    <div class="light-scan"></div>
    <div class="login-header">
      <div class="login-icon">
        <div class="icon-circle"></div>
      </div>
      <h2 class="login-title">创建账号</h2>
      <p class="login-subtitle">请设置您的账号和密码</p>
    </div>
    <el-form
      @submit.prevent="handleSubmit"
      :show-message="false"
      :rules="rules"
      :model="form"
      ref="formRef"
      class="login-form"
    >
      <el-form-item prop="username" class="form-item">
        <div class="input-wrapper" :class="{ focused: focusedField === 'username' }">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            class="modern-input"
            @focus="focusedField = 'username'"
            @blur="focusedField = ''"
          >
            <template #prefix>
              <div class="input-icon">
                <i class="el-icon-user"></i>
              </div>
            </template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item prop="password" class="form-item">
        <div class="input-wrapper" :class="{ focused: focusedField === 'password' }">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="modern-input"
            @focus="focusedField = 'password'"
            @blur="focusedField = ''"
          >
            <template #prefix>
              <div class="input-icon">
                <i class="el-icon-lock"></i>
              </div>
            </template>
          </el-input>
        </div>
      </el-form-item>
      <el-form-item prop="confirmPassword" class="form-item">
        <div class="input-wrapper" :class="{ focused: focusedField === 'confirmPassword' }">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
            class="modern-input"
            @focus="focusedField = 'confirmPassword'"
            @blur="focusedField = ''"
          >
            <template #prefix>
              <div class="input-icon">
                <i class="el-icon-lock"></i>
              </div>
            </template>
          </el-input>
        </div>
      </el-form-item>

      <el-form-item class="form-item">
        <el-button type="primary" class="modern-button" native-type="submit" :loading="loading">
          <span class="button-text">注册</span>
        </el-button>
      </el-form-item>
    </el-form>
    <div class="login-footer">
      <span>已有账号？</span>
      <el-text type="primary" @click="onLoginClick" class="link">立即登录</el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { registerApi } from '../api/user';
import { encrypt } from '../utils/crypto';

defineProps<{
  rules: any;
}>();

const emit = defineEmits<{
  (e: 'login'): void;
}>();

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});
const loading = ref(false);
const formRef = ref();
const focusedField = ref('');

const handleSubmit = async () => {
  // 表单验证
  if (!formRef.value) return;

  formRef.value.validate(async (valid: boolean, invalidFields: any) => {
    if (valid) {
      // 手动验证确认密码
      if (form.password !== form.confirmPassword) {
        ElMessage.error('两次输入密码不一致');
        return;
      }

      loading.value = true;
      try {
        // 前端加密密码
        const encryptedPwd = encrypt(form.password);

        // 请求后端
        await registerApi({
          username: form.username,
          password: encryptedPwd,
        });

        ElMessage.success('注册成功');
        // 注册成功后切换到登录页面
        emit('login');
      } catch (err: any) {
        ElMessage.error(err.message || '注册失败');
      } finally {
        loading.value = false;
      }
    } else {
      // 遍历invalidFields对象，获取第一个错误信息
      for (const field in invalidFields) {
        if (invalidFields[field] && invalidFields[field].length > 0) {
          ElMessage.error(invalidFields[field][0].message);
          break;
        }
      }
    }
  });
};

const onLoginClick = () => {
  emit('login');
};
</script>

<style scoped lang="less">
@import '@/assets/css/variables.less';
@import '@/assets/css/mixins.less';

.register-form {
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

.password-toggle {
  position: absolute;
  right: @spacing-md;
  top: 50%;
  transform: translateY(-50%);
  color: @text-muted;
  cursor: pointer;
  transition: color @transition-fast;

  &:hover {
    color: @text-secondary;
  }
}

.register-btn {
  .btn-primary();
  width: 100%;
  height: 40px;
  margin-top: @spacing-sm;
}

.agree-terms {
  display: flex;
  align-items: center;
  gap: @spacing-xs;
  color: @text-muted;
  font-size: @font-size-xs;

  a {
    color: @accent-blue;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
