<template>
  <div class="page-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="mb-20">
      <el-breadcrumb-item>常用表格下载</el-breadcrumb-item>
      <el-breadcrumb-item>表格下载</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 表格分类卡片 -->
    <el-row :gutter="20" style="row-gap: 20px;">
      <el-col :xs="24" :sm="12" :md="8" v-for="category in tableCategories" :key="category.name">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ category.name }}</span>
            </div>
          </template>
          <div class="table-list">
            <div
              v-for="(item, index) in category.tables"
              :key="item.id"
              class="table-item"
            >
              <span class="table-index">{{ index + 1 }}.</span>
              <el-link type="primary" @click="handleDownload(item)">
                {{ item.name }}
              </el-link>
              <el-icon class="download-icon" @click="handleDownload(item)">
                <download />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

// 表格分类数据
const tableCategories = [
  {
    name: '91JOB',
    tables: [
      { id: 1, name: '生源信息表', url: '/files/生源信息表.docx' },
      { id: 2, name: '就业推荐表', url: '/files/就业推荐表.docx' },
      { id: 3, name: '毕业去向', url: '/files/毕业去向.docx' }
    ]
  },
  {
    name: '联合学院',
    tables: [
      { id: 4, name: '实习管理表', url: '/files/实习管理表.docx' },
      { id: 5, name: '应届毕业生就业表', url: '/files/应届毕业生就业表.docx' },
      { id: 6, name: '上届毕业生年底就业表', url: '/files/上届毕业生年底就业表.docx' }
    ]
  },
  {
    name: '中职系统',
    tables: [
      { id: 7, name: '实习过程采集表', url: '/files/实习过程采集表.docx' },
      { id: 8, name: '实习结果采集表', url: '/files/实习结果采集表.docx' }
    ]
  },
  {
    name: '南京市教育局',
    tables: [
      { id: 9, name: '就业名册表', url: '/files/就业名册表.docx' },
      { id: 10, name: '就业调查表', url: '/files/就业调查表.docx' },
      { id: 11, name: '实习情况统计表', url: '/files/实习情况统计表.docx' }
    ]
  },
  {
    name: '常规表格',
    tables: [
      { id: 12, name: '学生基础信息', url: '/files/学生基础信息.docx' },
      { id: 13, name: '学生实习过程跟踪', url: '/files/学生实习过程跟踪.docx' },
      { id: 14, name: '实习基本信息表', url: '/files/实习基本信息表.docx' }
    ]
  },
  {
    name: '其他',
    tables: [
      { id: 15, name: '实习名册', url: '/files/实习名册.docx' },
      { id: 16, name: '实习审批表', url: '/files/实习审批表.docx' },
      { id: 17, name: '实习周报', url: '/files/实习周报.docx' }
    ]
  }
]

// 下载
const handleDownload = (item) => {
  ElMessage.success(`开始下载: ${item.name}`)
  // 实际项目中这里会触发文件下载
  // window.open(item.url, '_blank')
}
</script>

<style scoped>
.page-container {
  padding: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
  height: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.table-list {
  padding: 10px 0;
}

.table-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.table-index {
  color: #606266;
  margin-right: 5px;
  min-width: 20px;
}

.download-icon {
  margin-left: auto;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
}

.download-icon:hover {
  color: #66b1ff;
}
</style>
