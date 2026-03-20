<template>
  <div class="approval-detail">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
          <span class="title">{{ title }}</span>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="巡访教师">{{ detailData.teacherName }}</el-descriptions-item>
        <el-descriptions-item label="巡访日期">{{ detailData.visitTime }}</el-descriptions-item>
        <el-descriptions-item label="巡访学生">{{ detailData.studentName }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailData.companyName }}</el-descriptions-item>
        <el-descriptions-item label="岗位">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="巡访形式">{{ detailData.visitType }}</el-descriptions-item>
        <el-descriptions-item label="巡访情况">{{ detailData.visitResult }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getStatusType(detailData.status)">{{ detailData.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="巡访地址" :span="2">{{ detailData.visitAddress }}</el-descriptions-item>
        <el-descriptions-item label="小结" :span="2">{{ detailData.summary }}</el-descriptions-item>
        <el-descriptions-item label="审核时间" :span="2">{{ detailData.auditTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核备注" :span="2">{{ detailData.auditRemark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const title = ref('巡访详情')
const detailData = ref({})

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    '待审核': 'warning',
    '审核通过': 'success',
    '审核退回': 'danger'
  }
  return typeMap[status] || 'info'
}

// 返回列表
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 从路由参数获取详情数据
  const id = route.query.id
  // 模拟数据，实际应该从接口获取
  const mockData = {
    1: {
      teacherName: '张老师',
      visitTime: '2025-11-10',
      studentName: '赵雨欣',
      companyName: '深圳市第一幼儿园',
      position: '幼教',
      visitType: '实地巡访',
      visitResult: '优秀',
      visitAddress: '深圳市南山区科技园',
      summary: '学生表现良好，积极参与教学活动，与小朋友相处融洽。',
      status: '待审核',
      auditTime: '',
      auditRemark: ''
    },
    2: {
      teacherName: '李老师',
      visitTime: '2025-11-09',
      studentName: '王梓雯',
      companyName: '深圳市第二幼儿园',
      position: '助教',
      visitType: '视频巡访',
      visitResult: '良好',
      visitAddress: '深圳市福田区',
      summary: '学生适应能力强，服从安排。',
      status: '审核通过',
      auditTime: '2025-11-09 15:30:00',
      auditRemark: '符合要求，同意通过'
    }
  }
  detailData.value = mockData[id] || mockData[1]
  title.value = `${detailData.value.studentName} 巡访详情`
})
</script>

<style scoped>
.approval-detail {
  padding: 10px;
}

.detail-card {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}
</style>
