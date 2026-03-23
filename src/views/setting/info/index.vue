<template>
  <div class="page-container">
    <el-card>
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
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formData = reactive({
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000'
})

const handleSave = () => {
  ElMessage.success('保存成功')
}
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
