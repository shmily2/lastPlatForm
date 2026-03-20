<template>
  <div class="approval-page">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: false, edit: false, delete: false }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">详情</el-button>
        <el-button type="success" link @click="handleApprove(row)" v-if="row.status === 'pending'">审核</el-button>
      </template>
    </Crud>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Crud from '@/components/Crud/index.vue'

const router = useRouter()

// 模拟数据
const mockData = [
  { id: 1, teacherName: '张三', studentName: '李四', companyName: '阿里巴巴集团', position: '前端开发', visitType: '视频巡访', visitTime: '2026-03-15', status: 'pending', createTime: '2026-03-10 10:30:00' },
  { id: 2, teacherName: '李老师', studentName: '王五', companyName: '腾讯科技', position: '后端开发', visitType: '实地巡访', visitTime: '2026-03-14', status: 'approved', createTime: '2026-03-09 14:20:00' },
  { id: 3, teacherName: '王老师', studentName: '赵六', companyName: '字节跳动', position: '产品经理', visitType: '视频巡访', visitTime: '2026-03-13', status: 'rejected', createTime: '2026-03-08 09:15:00' },
  { id: 4, teacherName: '赵老师', studentName: '钱七', companyName: '美团', position: '算法工程师', visitType: '实地巡访', visitTime: '2026-03-12', status: 'pending', createTime: '2026-03-07 16:45:00' },
  { id: 5, teacherName: '陈老师', studentName: '孙八', companyName: '京东集团', position: '测试工程师', visitType: '视频巡访', visitTime: '2026-03-11', status: 'approved', createTime: '2026-03-06 11:00:00' },
  { id: 6, teacherName: '刘老师', studentName: '周九', companyName: '拼多多', position: '运营专员', visitType: '实地巡访', visitTime: '2026-03-10', status: 'pending', createTime: '2026-03-05 13:30:00' },
  { id: 7, teacherName: '周老师', studentName: '吴十', companyName: '网易', position: '游戏开发', visitType: '视频巡访', visitTime: '2026-03-09', status: 'approved', createTime: '2026-03-04 10:00:00' },
  { id: 8, teacherName: '吴老师', studentName: '郑十一', companyName: '快手', position: '数据分析师', visitType: '实地巡访', visitTime: '2026-03-08', status: 'rejected', createTime: '2026-03-03 15:20:00' },
  { id: 9, teacherName: '郑老师', studentName: '冯十二', companyName: '滴滴出行', position: '安全工程师', visitType: '视频巡访', visitTime: '2026-03-07', status: 'pending', createTime: '2026-03-02 09:45:00' },
  { id: 10, teacherName: '孙老师', studentName: '陈十三', companyName: '小米科技', position: '硬件工程师', visitType: '实地巡访', visitTime: '2026-03-06', status: 'approved', createTime: '2026-03-01 14:10:00' }
]

// API 配置 - 直接返回模拟数据
const apiConfig = {
  list: (params) => {
    const { page = 1, pageSize = 10 } = params || {}
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = mockData.slice(start, end)
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: {
        list,
        total: mockData.length
      }
    })
  }
}

// 搜索字段
const searchFields = [
  { prop: 'teacherName', label: '教师姓名', type: 'input', placeholder: '请输入教师姓名' },
  { prop: 'studentName', label: '学生姓名', type: 'input', placeholder: '请输入学生姓名' },
  {
    prop: 'status',
    label: '审核状态',
    type: 'select',
    placeholder: '请选择审核状态',
    options: [
      { label: '待审核', value: 'pending' },
      { label: '审核通过', value: 'approved' },
      { label: '审核退回', value: 'rejected' }
    ]
  },
  {
    prop: 'visitType',
    label: '巡访形式',
    type: 'select',
    placeholder: '请选择巡访形式',
    options: [
      { label: '视频巡访', value: 'video' },
      { label: '实地巡访', value: 'field' }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'teacherName', label: '教师姓名', width: 100, align: 'center' },
  { prop: 'studentName', label: '学生姓名', width: 100, align: 'center' },
  { prop: 'companyName', label: '企业名称', minWidth: 180, align: 'center' },
  { prop: 'position', label: '岗位', width: 100, align: 'center' },
  { prop: 'visitType', label: '巡访形式', width: 100, align: 'center' },
  { prop: 'visitTime', label: '巡访日期', width: 120, align: 'center' },
  {
    prop: 'status',
    label: '审核状态',
    width: 100,
    align: 'center',
    formatter: (row) => {
      const statusMap = {
        pending: '待审核',
        approved: '审核通过',
        rejected: '审核退回'
      }
      return statusMap[row.status] || row.status
    }
  },
  { prop: 'createTime', label: '申请时间', width: 160, align: 'center' }
]

// 查看详情 - 跳转到详情页面
const handleView = (row) => {
  router.push({
    path: '/visit/approval/detail',
    query: { id: row.id }
  })
}

// 审核
const handleApprove = (row) => {
  router.push({
    path: '/visit/approval-audit',
    query: { id: row.id }
  })
}

// 搜索
const handleSearch = (searchData) => {
  console.log('搜索:', searchData)
}

// 刷新
const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 分页大小变化
const handleSizeChange = (size) => {
  console.log('分页大小:', size)
}

// 当前页变化
const handleCurrentChange = (page) => {
  console.log('当前页:', page)
}
</script>

<style scoped>
.approval-page {
  padding: 10px;
}
</style>
