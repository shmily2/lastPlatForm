
<template>
  <div class="info-config-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">学生信息采集配置</h2>
    </div>

    <!-- 配置卡片区域 -->
    <div class="config-container">
      <!-- 学生基础信息 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">学生基础信息-已配置</span>
            <el-button type="primary" size="small" @click="handleSave('basic')">
              保存
            </el-button>
          </div>
        </template>
        <el-table
          :data="basicInfoFields"
          border
          stripe
          size="small"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column prop="name" label="字段名称" min-width="100" />
          <el-table-column label="启用" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.enabled" />
            </template>
          </el-table-column>
          <el-table-column label="可编辑" width="70" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.editable" />
            </template>
          </el-table-column>
          <el-table-column label="必填" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.required" />
            </template>
          </el-table-column>
          <el-table-column label="默认值" width="80" align="center">
            <template #default="{ row }">
              <span class="default-value">{{ row.defaultValue || '--' }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 实习信息 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">实习信息-已配置</span>
            <el-button type="primary" size="small" @click="handleSave('internship')">
              保存
            </el-button>
          </div>
        </template>
        <el-table
          :data="internshipFields"
          border
          stripe
          size="small"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column prop="name" label="字段名称" min-width="120" />
          <el-table-column label="启用" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.enabled" />
            </template>
          </el-table-column>
          <el-table-column label="可编辑" width="70" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.editable" />
            </template>
          </el-table-column>
          <el-table-column label="必填" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.required" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 就业信息 -->
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">就业信息</span>
            <el-tag type="info" size="small">从91job自动同步，无需学生填写</el-tag>
          </div>
        </template>
        <el-table
          :data="employmentFields"
          border
          stripe
          size="small"
          :header-cell-style="{ background: '#f5f7fa' }"
        >
          <el-table-column prop="name" label="字段名称" min-width="120" />
          <el-table-column label="启用" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.enabled" />
            </template>
          </el-table-column>
          <el-table-column label="可编辑" width="70" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.editable" />
            </template>
          </el-table-column>
          <el-table-column label="必填" width="60" align="center">
            <template #default="{ row }">
              <el-checkbox v-model="row.required" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 学生基础信息字段
const basicInfoFields = ref([
  { name: '头像', enabled: true, editable: true, required: false, defaultValue: '' },
  { name: '一寸照片', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '学号', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '考生号', enabled: true, editable: true, required: false, defaultValue: '' },
  { name: '姓名', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '曾用名', enabled: true, editable: true, required: false, defaultValue: '' },
  { name: '性别', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '身份证号', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '出生年月', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '籍贯', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '政治面貌', enabled: true, editable: true, required: true, defaultValue: '团员' },
  { name: '民族', enabled: true, editable: true, required: true, defaultValue: '' },
  { name: '手机号码', enabled: true, editable: true, required: true, defaultValue: '' }
])

// 实习信息字段
const internshipFields = ref([
  { name: '实习去向', enabled: true, editable: true, required: true },
  { name: '实习项目名称', enabled: true, editable: true, required: true },
  { name: '实习开始时间', enabled: true, editable: true, required: true },
  { name: '实习结束时间', enabled: true, editable: true, required: true },
  { name: '实习时长', enabled: true, editable: true, required: true },
  { name: '实习单位名称', enabled: true, editable: true, required: true },
  { name: '实习岗位名称', enabled: true, editable: true, required: true },
  { name: '实习成绩', enabled: true, editable: true, required: true },
  { name: '实习薪酬', enabled: true, editable: true, required: true },
  { name: '实习单位来源', enabled: true, editable: true, required: true },
  { name: '法定监护人（或家长）是否同意', enabled: true, editable: true, required: true },
  { name: '实习指导教师工号', enabled: true, editable: true, required: true },
  { name: '校内指导教师姓名', enabled: true, editable: true, required: true }
])

// 就业信息字段
const employmentFields = ref([
  { name: '毕业去向', enabled: true, editable: true, required: true },
  { name: '单位名称', enabled: true, editable: true, required: true },
  { name: '单位性质', enabled: true, editable: true, required: true },
  { name: '联系人手机', enabled: true, editable: true, required: true },
  { name: '联系人传真', enabled: true, editable: true, required: true },
  { name: '单位邮编', enabled: true, editable: true, required: true },
  { name: '签约日期', enabled: true, editable: true, required: true },
  { name: '单位行业', enabled: true, editable: true, required: true },
  { name: '单位所在地', enabled: true, editable: true, required: true },
  { name: '工作职位类别', enabled: true, editable: true, required: true },
  { name: '统一社会信用代码', enabled: true, editable: true, required: true },
  { name: '单位联系人姓名', enabled: true, editable: true, required: true },
  { name: '单位联系人电话', enabled: true, editable: true, required: true }
])

// 保存配置
const handleSave = (type) => {
  const typeMap = {
    basic: '学生基础信息',
    internship: '实习信息'
  }
  ElMessage.success(`${typeMap[type]}配置保存成功`)
}
</script>

<style scoped>
.info-config-page {
  padding: 10px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.config-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.config-card {
  min-height: 500px;
}

.config-card :deep(.el-card__header) {
  padding: 12px 15px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.default-value {
  color: #909399;
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 1400px) {
  .config-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .config-container {
    grid-template-columns: 1fr;
  }
}
</style>