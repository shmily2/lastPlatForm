<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="mb-20">
      <el-breadcrumb-item>文件管理</el-breadcrumb-item>
      <el-breadcrumb-item>文件列表</el-breadcrumb-item>
    </el-breadcrumb>

    <Crud ref="crudRef" :search-fields="searchFields" :table-columns="tableColumns" :show-index="true"
      :show-actions="true" :table-actions="{ view: true, edit: true, delete: true }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }" :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig" :show-search="true" @search="handleSearch" @refresh="handleRefresh" @view="handleView"
      @edit="handleEdit" @delete="handleDelete">
      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleUpload">上传文件</el-button>
        <el-button @click="handleNewFolder">新建文件夹</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <!-- <el-button type="primary" link @click="handleView(row)">查看</el-button> -->
        <el-button type="success" link @click="handleEdit(row)">下载</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </Crud>
    <!-- 查看/编辑对话框
    <Dialog ref="dialogRef" v-model="dialogVisible" :title="dialogTitle" width="400px" :show-footer="!isView"
      :show-form="true" :view-mode="isView" :form-data="formData" :form-fields="formFields" :form-rules="formRules"
      :form-label-width="formLabelWidth" @update:form-data="formData = $event" @close="handleDialogClose"
      @confirm="handleSubmit" /> -->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'

const crudRef = ref(null)
const dialogVisible = ref(false)

// 模拟数据
const mockData = [
  { id: 1, name: '实习协议模板.docx', type: 'Word', size: '25KB', createTime: '2025-03-20 10:30:00', user: '管理员' },
  { id: 2, name: '实习报告模板.docx', type: 'Word', size: '18KB', createTime: '2025-03-18 14:20:00', user: '管理员' },
  { id: 3, name: '三方协议.pdf', type: 'PDF', size: '156KB', createTime: '2025-03-15 09:15:00', user: '管理员' },
  { id: 4, name: '实习安全承诺书.docx', type: 'Word', size: '15KB', createTime: '2025-03-10 16:45:00', user: '教师' },
  { id: 5, name: '实习鉴定表.xlsx', type: 'Excel', size: '32KB', createTime: '2025-03-05 11:20:00', user: '管理员' },
  { id: 6, name: '实习周记模板.docx', type: 'Word', size: '12KB', createTime: '2025-03-01 14:10:00', user: '教师' },
  { id: 7, name: '就业推荐表.pdf', type: 'PDF', size: '89KB', createTime: '2025-02-28 10:00:00', user: '管理员' },
  { id: 8, name: '实习证明模板.docx', type: 'Word', size: '20KB', createTime: '2025-02-25 15:30:00', user: '管理员' }
]

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
    let result = [...mockData]
    if (params.name) {
      result = result.filter(item => item.name.includes(params.name))
    }
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    return {
      code: 200,
      data: {
        list: result.slice(start, end),
        total: result.length
      }
    }
  }
}

// 搜索
const handleSearch = (params) => {
  console.log('搜索:', params)
}

// 刷新
const handleRefresh = () => {
  crudRef.value?.refresh()
}

// 上传文件
const handleUpload = () => {
  ElMessage.info('上传文件功能')
}

// 新建文件夹
const handleNewFolder = () => {
  ElMessage.info('新建文件夹功能')
}


// 编辑/下载
const handleEdit = (row) => {
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
  }).catch(() => { })
}
</script>

<style scoped>
.mb-20 {
  height: 30px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
</style>
