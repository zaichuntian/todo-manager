<template>
  <div class="login">
    <el-card style="width: 400px; padding: 20px">
      <h2 style="text-align: center">登录</h2>
      <el-form @submit.prevent="handleLogin">
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="admin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="123456" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" native-type="submit" :loading="loading"> 登录 </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { loginApi } from '../api/user';
import { encrypt } from '../utils/crypto';
import { ElMessage } from 'element-plus';

const form = reactive({
  username: '',
  password: '',
});
const loading = ref(false);
const auth = useAuthStore();
const router = useRouter();

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号密码');
    return;
  }

  loading.value = true;
  try {
    // ✅ 前端加密密码
    const encryptedPwd = encrypt(form.password);

    // ✅ 请求后端
    const res = await loginApi({
      username: form.username,
      password: encryptedPwd,
    });

    if (res.code === 200) {
      ElMessage.success('登录成功');
      auth.setToken(res.data.token);
      router.push('/');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
</style>
