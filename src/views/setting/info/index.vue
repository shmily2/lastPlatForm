<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <span>个人信息</span>
      </template>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="头像">
          <el-avatar :size="80" :src="formData.avatar">
            <el-icon :size="40"><user /></el-icon>
          </el-avatar>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

const formData = reactive({
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  avatar: ''
})

const handleSave = () => {
  ElMessage.success('保存成功')
}

const handleReset = () => {
  formData.nickname = '管理员'
  formData.email = 'admin@example.com'
  formData.phone = '13800138000'
}
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
