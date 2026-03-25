<template>
  <div class="teacher-info-container">
    <!-- 顶部导航 -->
    <div class="header-nav">
      <div class="nav-left">
        <span class="nav-text">人事信息 / 智能信息</span>
      </div>
      <div class="nav-right">
        <!-- 可以在这里添加其他操作按钮 -->
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="form-container">
      <BaseForm
        ref="formRef"
        v-model="formData"
        :fields="formFields"
        :rules="formRules"
        label-width="120px"
        :show-buttons="false"
        @submit="handleSave"
      />

      <!-- 底部按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button type="primary" @click="handleCancel">放弃修改</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import BaseForm from '@/components/Form/index.vue'

const formRef = ref(null)

// 表单数据
const formData = reactive({
  name: '张老师',
  workNo: 'T2021001',
  phone: '13800138001',
  landline: '010-12345678',
  email: 'zhanglaoshi@example.com',
  gender: '女',
  position: '计算机系教师',
  role: '教师'
})

// 角色选项
const roleOptions = [
  { label: '教师', value: '教师' },
  { label: '辅导员', value: '辅导员' },
  { label: '教务管理员', value: '教务管理员' },
  { label: '系主任', value: '系主任' },
  { label: '院长', value: '院长' }
]

// 表单字段配置
const formFields = [
  {
    fields: [
      { prop: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名', required: true },
      { prop: 'workNo', label: '职工号', type: 'input', placeholder: '请输入职工号', required: true },
      { prop: 'phone', label: '手机号', type: 'input', placeholder: '请输入手机号', required: true },
      { prop: 'landline', label: '座机号', type: 'input', placeholder: '请输入座机号' },
      { prop: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱', required: true },
      {
        prop: 'gender',
        label: '性别',
        type: 'radio',
        required: true,
        options: [
          { label: '男', value: '男' },
          { label: '女', value: '女' }
        ]
      },
      { prop: 'position', label: '部门职位', type: 'input', placeholder: '请输入部门职位', required: true },
      {
        prop: 'role',
        label: '系统角色',
        type: 'select',
        placeholder: '请选择系统角色',
        required: true,
        options: roleOptions
      }
    ]
  }
]

// 表单校验规则
const formRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  workNo: [{ required: true, message: '请输入职工号', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  position: [{ required: true, message: '请输入部门职位', trigger: 'blur' }],
  role: [{ required: true, message: '请选择系统角色', trigger: 'change' }]
}

// 保存
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    console.log('保存表单数据:', formData)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 放弃修改
const handleCancel = () => {
  ElMessage.info('已放弃修改')
  // 可以在这里恢复原始数据
}
</script>

<style scoped>
.teacher-info-container {
  min-height: 100vh;
  background: #e6f1fc;
  padding: 10px;
}

/* 顶部导航 */
.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-left .nav-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 表单容器 */
.form-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.teacher-form {
  max-width: 1200px;
}

.teacher-form :deep(.el-form-item__label) {
  color: #333;
  font-weight: 500;
}

.teacher-form :deep(.el-input__wrapper) {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.teacher-form :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

.teacher-form :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.teacher-form :deep(.el-select .el-input__wrapper) {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.teacher-form :deep(.el-date-editor .el-input__wrapper) {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.teacher-form :deep(.el-input-number) {
  width: 100%;
}

.teacher-form :deep(.el-input-number .el-input__wrapper) {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.teacher-form :deep(.el-radio) {
  color: #333;
}

.teacher-form :deep(.el-radio__label) {
  color: #333;
}

.teacher-form :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

/* 底部按钮 */
.form-actions {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.form-actions .el-button {
  margin: 0 15px;
  min-width: 120px;
  height: 40px;
  font-size: 14px;
}

.form-actions .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.form-actions .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 响应式 */
@media (max-width: 768px) {
  .form-container {
    padding: 20px;
  }

  .form-actions .el-button {
    margin: 5px;
    min-width: 100px;
  }
}
</style>
