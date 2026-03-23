<template>
  <div class="file-list-page">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item>文件管理</el-breadcrumb-item>
      <el-breadcrumb-item>文件列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="file-card">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-input
          v-model="searchName"
          placeholder="请输入关键字"
          class="search-input"
          clearable
        >
          <template #prepend>名称</template>
        </el-input>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button type="primary" @click="handleUpload">
          <el-icon><Upload /></el-icon>上传文件
        </el-button>
        <el-button type="primary" @click="handleFolder">
          <el-icon><Folder /></el-icon>文件夹
        </el-button>
      </div>

      <!-- 文件表格 -->
      <el-table
        :data="fileList"
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column prop="type" label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-icon :size="20">
              <Document v-if="row.type === 'file'" />
              <Folder v-else />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="文件名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="uploadTime" label="上传日期" width="180" align="center" />
        <el-table-column prop="size" label="文件大小" width="120" align="center" />
        <el-table-column prop="uploadUser" label="上传用户" width="120" align="center" />
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="fileList.length === 0 && !loading" description="暂无数据" />

      <!-- 分页 -->
      <el-pagination
        v-if="fileList.length > 0"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传文件" width="500px">
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="uploadFileList"
        multiple
      >
        <el-icon class="el-icon--upload"><Upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
      </el-upload>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Upload, Folder, Document, UploadFilled } from '@element-plus/icons-vue'

// 搜索
const searchName = ref('')
const loading = ref(false)

// 分页
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 文件列表
const fileList = ref([])

// 上传对话框
const uploadDialogVisible = ref(false)
const uploadFileList = ref([])

// 搜索
const handleSearch = () => {
  console.log('搜索:', searchName.value)
  loading.value = true
  setTimeout(() => {
    loading.value = false
    fileList.value = []
    total.value = 0
  }, 500)
}

// 上传文件
const handleUpload = () => {
  uploadDialogVisible.value = true
  uploadFileList.value = []
}

// 文件夹
const handleFolder = () => {
  ElMessage.info('文件夹功能')
}

// 文件变化
const handleFileChange = (file, fileList) => {
  uploadFileList.value = fileList
}

// 确认上传
const confirmUpload = () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }
  ElMessage.success('上传成功')
  uploadDialogVisible.value = false
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

// 当前页变化
const handleCurrentChange = (val) => {
  page.value = val
  handleSearch()
}
</script>

<style scoped>
.file-list-page {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.file-card {
  min-height: 500px;
}

.search-area {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
