<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="mb-20">
      <el-breadcrumb-item>文件管理</el-breadcrumb-item>
      <el-breadcrumb-item>文件列表</el-breadcrumb-item>
    </el-breadcrumb>

    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
    >
      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleUpload">上传文件</el-button>
        <el-button @click="handleNewFolder">新建文件夹</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleDownload(row)">下载</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </Crud>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadVisible" title="上传文件" width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUploadConfirm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import Crud from '@/components/Crud/index.vue'

const crudRef = ref(null)
const uploadVisible = ref(false)

// 搜索字段
const searchFields = [
  { prop: 'name', label: '名称', type: 'input', placeholder: '请输入文件名' }
]

// 表格列配置
const tableColumns = [
  { prop: 'type', label: '类型', width: 60, align: 'center' },
  { prop: 'name', label: '文件名称', minWidth: 200, align: 'left' },
  { prop: 'createTime', label: '上传日期', minWidth: 160, align: 'center' },
  { prop: 'size', label: '文件大小', width: 100, align: 'center' },
  { prop: 'user', label: '上传用户', width: 100, align: 'center' }
]

// API配置
const apiConfig = {
  list: (params) => {
    const mockData = [
      { id: 1, type: '📄', name: '实习协议模板.docx', createTime: '2025-03-20 10:30:00', size: '25KB', user: '管理员' },
      { id: 2, type: '📄', name: '实习报告模板.docx', createTime: '2025-03-18 14:20:00', size: '18KB', user: '管理员' },
      { id: 3, type: '📕', name: '三方协议.pdf', createTime: '2025-03-15 09:15:00', size: '156KB', user: '管理员' },
      { id: 4, type: '📄', name: '实习安全承诺书.docx', createTime: '2025-03-10 16:45:00', size: '15KB', user: '教师' },
      { id: 5, type: '📊', name: '实习鉴定表.xlsx', createTime: '2025-03-05 11:20:00', size: '32KB', user: '管理员' }
    ]
    return {
      code: 200,
      data: {
        list: mockData,
        total: mockData.length
      }
    }
  }
}

// 上传文件
const handleUpload = () => {
  uploadVisible.value = true
}

// 上传确认
const handleUploadConfirm = () => {
  ElMessage.success('上传成功')
  uploadVisible.value = false
  crudRef.value?.refresh()
}

// 新建文件夹
const handleNewFolder = () => {
  ElMessage.info('新建文件夹功能')
}

// 下载
const handleDownload = (row) => {
  ElMessage.success('开始下载: ' + row.name)
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该文件吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    crudRef.value?.refresh()
  }).catch(() => {})
}
</script>

<style scoped>
.page-container { padding: 20px; }
.mb-20 { margin-bottom: 20px; }
</style>
