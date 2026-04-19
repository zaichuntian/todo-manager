<template>
  <el-card>
    <!-- 顶部操作栏 -->
    <div class="header-bar">
      <h3>用户管理</h3>
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>

    <!-- 用户表格 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="username" label="用户名" align="center" />
      <el-table-column label="创建时间" align="center">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template #default="{ row }">
          {{ formatTime(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="160" align="center">
        <template #default="{ row }">
          <div class="status-switch-wrapper">
            <span class="status-label disabled" :class="{ show: row.status === 0 }">禁用</span>
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              class="custom-switch"
              @change="(val) => handleStatusChange(row, val)"
            />
            <span class="status-label enabled" :class="{ show: row.status === 1 }">启用</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="130" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 👇 分页组件移到表格右下角，加上每页条数选择 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[5, 10, 15]"
        layout="total, prev, pager, next, sizes"
        @current-change="getUserList"
        @size-change="getUserList"
      />
    </div>
  </el-card>

  <!-- 新增/编辑弹窗：含表单校验 -->
  <el-dialog v-model="dialogVisible" title="用户信息">
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item v-if="isAdd" label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import dayjs from 'dayjs'
import { getUserListApi, deleteUserApi, updateUserApi, registerApi, updateUserStatusApi } from '../api/user'
import { encrypt } from '../utils/crypto'

const tableData = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(5)
const dialogVisible = ref(false)
const isAdd = ref(true)
const formRef = ref<InstanceType<typeof ElForm>>()

const form = ref({
  uuid: '',
  username: '',
  password: ''
})

// 表单校验规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度需在 2-20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度需在 6-20 个字符之间', trigger: 'blur' }
  ]
})

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY.MM.DD HH:mm:ss')
}

// 获取用户列表
const getUserList = async () => {
  const res: any = await getUserListApi({
    pageNum: pageNum.value,
    pageSize: pageSize.value
  })
  if (res.code === 200) {
    tableData.value = res.data.list
    total.value = res.data.total
  }
}

// 新增用户
const handleAdd = () => {
  isAdd.value = true
  form.value = { uuid: '', username: '', password: '' }
  dialogVisible.value = true
  setTimeout(() => {
    formRef.value?.clearValidate()
  }, 0)
}

// 编辑用户
const handleEdit = (row: any) => {
  isAdd.value = false
  form.value = {
    uuid: row.uuid,
    username: row.username,
    password: ''
  }
  dialogVisible.value = true
  setTimeout(() => {
    formRef.value?.clearValidate()
  }, 0)
}

// 删除用户
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    type: 'warning'
  })
  await deleteUserApi(row.uuid)
  ElMessage.success('删除成功')
  getUserList()
}

// 状态开关变更
const handleStatusChange = async (row: any, val: number) => {
  try {
    await updateUserStatusApi(row.uuid, val)
    ElMessage.success('状态更新成功')
  } catch (err) {
    ElMessage.error('状态更新失败')
    row.status = val === 1 ? 0 : 1
  }
}

// 提交新增/编辑
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (isAdd.value) {
    await registerApi({
      username: form.value.username,
      password: encrypt(form.value.password)
    })
    ElMessage.success('新增成功')
  } else {
    await updateUserApi(form.value.uuid, {
      username: form.value.username
    })
    ElMessage.success('修改成功')
  }

  dialogVisible.value = false
  getUserList()
}

onMounted(() => {
  getUserList()
})
</script>

<style scoped lang="less">
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.status-switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* 控制文字和开关之间的间距 */
}
.status-text {
  font-size: 12px;
  white-space: nowrap; /* 防止文字换行 */
}
.disable-text {
  color: #ff4949;
  margin-bottom: 2px;
}
.enable-text {
  color: #13ce66;
  margin-bottom: 4px;
}

.status-label {
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

// TODO 如果用户是禁用状态，那么启用就显示灰色，禁用文字高亮
// 如果用户是启用状态，那么禁用就显示灰色，启用文字高亮
.status-label.show {
  opacity: 1;
}
.status-label.enabled {
  color: #13ce66;
}
.status-label.disabled {
  color: #ff4949;
}

/* 🔥 关键：穿透修改开关颜色 */
:deep(.custom-switch) .el-switch__core {
  border-color: #ff4949;
  background-color: #ff4d4f !important; /* 禁用红色 */
}
:deep(.custom-switch.is-checked) .el-switch__core {
  border-color: #13ce66;
  background-color: #13ce66 !important; /* 启用绿色 */
}
</style>