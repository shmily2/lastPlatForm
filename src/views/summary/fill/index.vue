<template>
  <div class="questionnaire-page">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
    >
      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">新增计划</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button v-if="row.status !== '已发布'" type="success" link @click="handlePublish(row)">发布</el-button>
      </template>

      <!-- 自定义二维码列 -->
      <template #qrCode="{ row }">
        <el-popover v-if="row.qrCode" placement="right" :width="200" trigger="click">
          <template #reference>
            <el-image
              :src="row.qrCode"
              fit="contain"
              style="width: 40px; height: 40px; cursor: pointer;"
            />
          </template>
          <el-image
            :src="row.qrCode"
            :preview-src-list="[row.qrCode]"
            fit="contain"
            style="width: 180px; height: 180px;"
          />
        </el-popover>
        <span v-else>-</span>
      </template>
    </Crud>

    <!-- 查看对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      title="问卷详情"
      width="800px"
      :show-footer="false"
      :show-form="false"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="问卷名称">{{ currentRow.title }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ currentRow.publisher }}</el-descriptions-item>
        <el-descriptions-item label="调查对象">{{ currentRow.target }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentRow.publishTime }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ currentRow.endTime }}</el-descriptions-item>
        <el-descriptions-item label="参与人数">{{ currentRow.participantCount }}</el-descriptions-item>
        <el-descriptions-item label="发布状态">
          <el-tag :type="currentRow.status === '已发布' ? 'success' : 'info'">{{ currentRow.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="二维码">
          <el-image v-if="currentRow.qrCode" :src="currentRow.qrCode" style="width: 80px; height: 80px;" />
        </el-descriptions-item>
      </el-descriptions>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1

    const data = [
      {
        id: 1,
        title: '2018届就业情况跟踪问卷调查',
        publisher: 'ngztest',
        target: '学生',
        publishTime: '2023-08-01 16:05:09',
        endTime: '2024-09-30 00:00:00',
        notifyTime: '2023-08-01 16:06:21',
        participantCount: 907,
        status: '未发布',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=questionnaire1'
      },
      {
        id: 2,
        title: '2023届毕业生满意度调查',
        publisher: 'admin',
        target: '学生',
        publishTime: '2024-01-15 09:30:00',
        endTime: '2024-03-15 00:00:00',
        notifyTime: '2024-01-15 09:35:00',
        participantCount: 568,
        status: '已发布',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=questionnaire2'
      },
      {
        id: 3,
        title: '实习单位满意度调查',
        publisher: 'teacher1',
        target: '企业',
        publishTime: '2024-06-01 10:00:00',
        endTime: '2024-07-01 00:00:00',
        notifyTime: '2024-06-01 10:05:00',
        participantCount: 128,
        status: '已发布',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=questionnaire3'
      }
    ]

    return Promise.resolve({
      data: {
        list: data,
        total: data.length
      }
    })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'title',
    label: '计划名称',
    type: 'input',
    placeholder: '计划名称',
    span: 4
  },
  {
    prop: 'dateRange',
    label: '日期范围',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    span: 6
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'title', label: '名称', minWidth: 200, align: 'left' },
  { prop: 'publisher', label: '发布人', width: 100, align: 'center' },
  { prop: 'target', label: '调查对象', width: 100, align: 'center' },
  { prop: 'publishTime', label: '问卷发布时间', minWidth: 160, align: 'center' },
  { prop: 'endTime', label: '调查截止日期', minWidth: 160, align: 'center' },
  { prop: 'notifyTime', label: '通知时间', minWidth: 160, align: 'center' },
  { prop: 'participantCount', label: '参与人数', width: 100, align: 'center' },
  { prop: 'status', label: '发布状态', width: 100, align: 'center',
    tag: (value) => value === '已发布' ? 'success' : 'info'
  },
  { prop: 'qrCode', label: '二维码', width: 100, align: 'center', slot: 'qrCode' }
]

// Crud 组件引用
const crudRef = ref()
const dialogVisible = ref(false)
const dialogRef = ref()
const currentRow = ref({})

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
}

// 刷新
const handleRefresh = () => {
  console.log('刷新列表')
  crudRef.value?.refresh()
}

// 新增计划
const handleAdd = () => {
  ElMessage.info('新增计划功能')
}

// 发布
const handlePublish = (row) => {
  ElMessage.success(`发布成功: ${row.title}`)
}

// 查看
const handleView = (row) => {
  currentRow.value = row
  dialogVisible.value = true
}
</script>

