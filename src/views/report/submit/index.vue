<template>
  <div class="report-submit-page" style="min-height: 500px">
    <div v-if="!crudRef" style="padding: 20px; text-align: center; color: red;">
      页面正在加载中...<br>
      {{ errorMessage }}
    </div>
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :action-width="180"
      :action-min-width="180"
      :table-actions="{ view: true, edit: true, delete: false }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @view="handleView"
      @edit="handleApprove"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义状态列 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
      </template>

      <!-- 自定义是否补报列 -->
      <template #isSupplement="{ row }">
        <span :style="{ color: row.isSupplement === '是' ? '#f56c6c' : '#67c23a' }">{{ row.isSupplement }}</span>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">详情</el-button>
        <el-button type="success" link @click="handleApprove(row)">审批</el-button>
        <el-button v-if="row.status !== '待审批' && row.status !== '待提交'" type="warning" link @click="handleWithdraw(row)">撤回</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleWrittenStats">已写周报统计</el-button>
        <el-button type="warning" @click="handleUnwrittenStats">未写周报统计</el-button>
        <el-button type="success" @click="handleCompleteStats">完成数量统计</el-button>
      </template>
    </Crud>

    <!-- 查看对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="周报详情"
      width="900px"
      @close="handleViewDialogClose"
    >
      <BaseForm
        ref="viewFormRef"
        v-model="viewFormData"
        :fields="viewFormFields"
        :disabled="true"
        :show-buttons="false"
      />
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog
      v-model="approveDialogVisible"
      title="周报审批"
      width="700px"
      @close="handleApproveDialogClose"
    >
      <BaseForm
        ref="approveFormRef"
        v-model="approveFormData"
        :fields="approveFormFields"
        :rules="approveFormRules"
        :show-buttons="false"
      />
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">驳回</el-button>
        <el-button type="success" @click="handlePass">通过</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import BaseForm from '@/components/Form/index.vue'

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1
    const data = Array.from({ length: pageSize }, (_, i) => {
      const statusList = ['待审批', '已通过', '已驳回', '待提交']
      const isSubmitted = Math.random() > 0.2
      return {
        id: (page - 1) * pageSize + i + 1,
        status: statusList[Math.floor(Math.random() * (isSubmitted ? 3 : 1))],
        studentNo: '224102' + String(1000 + (page - 1) * pageSize + i).padStart(4, '0'),
        studentName: ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'][((page - 1) * pageSize + i) % 8],
        className: ['护理2201', '护理2202', '临床2201', '康复2201'][((page - 1) * pageSize + i) % 4],
        department: ['南丁格尔护理学院', '临床医学院', '康复医学院'][((page - 1) * pageSize + i) % 3],
        submitDate: isSubmitted ? `2026-03-${String(1 + i % 20).padStart(2, '0')}` : '-',
        week: `第${11 + i}周`,
        isSupplement: Math.random() > 0.8 ? '是' : '否',
        approver: ['刘老师', '陈老师', '杨老师', '王老师'][((page - 1) * pageSize + i) % 4],
        score: isSubmitted && Math.random() > 0.3 ? Math.floor(80 + Math.random() * 20) : '-',
        comment: isSubmitted && Math.random() > 0.5 ? ['内容充实', '认真完成', '需改进', '优秀'][Math.floor(Math.random() * 4)] : '-',
        approveTime: isSubmitted && Math.random() > 0.4 ? `2026-03-${String(2 + i % 20).padStart(2, '0')} 14:30:00` : '-'
      }
    })
    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: 235
      }
    })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'organization',
    label: '组织架构',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '南丁格尔护理学院', value: 'nursing' },
      { label: '临床医学院', value: 'clinical' },
      { label: '康复医学院', value: 'rehabilitation' }
    ],
    span: 6
  },
  {
    prop: 'week',
    label: '周次',
    type: 'select',
    options: Array.from({ length: 20 }, (_, i) => ({ label: `2026 第${i + 1}周`, value: i + 1 })),
    span: 6
  },
  {
    prop: 'studentName',
    label: '学生姓名',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '张三', value: '张三' },
      { label: '李四', value: '李四' },
      { label: '王五', value: '王五' }
    ],
    span: 4
  },
  {
    prop: 'keyword',
    label: '关键字',
    type: 'input',
    placeholder: '请输入关键字',
    span: 4
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '待审批', value: '待审批' },
      { label: '已通过', value: '已通过' },
      { label: '已驳回', value: '已驳回' },
      { label: '待提交', value: '待提交' }
    ],
    span: 4
  }
]

// 表格列配置
const tableColumns = [
  {
    prop: 'status',
    label: '状态',
    width: 100,
    align: 'center',
    slot: 'status'
  },
  { prop: 'studentNo', label: '学号', minWidth: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', minWidth: 100, align: 'center' },
  { prop: 'className', label: '所在班级', minWidth: 100, align: 'center' },
  { prop: 'department', label: '系部', minWidth: 120, align: 'center' },
  { prop: 'submitDate', label: '提交日期', width: 120, align: 'center' },
  { prop: 'week', label: '周次', width: 100, align: 'center' },
  {
    prop: 'isSupplement',
    label: '是否补报',
    width: 100,
    align: 'center',
    slot: 'isSupplement'
  },
  { prop: 'approver', label: '审批人', width: 100, align: 'center' },
  { prop: 'score', label: '评分', width: 80, align: 'center' },
  { prop: 'comment', label: '审批评语', minWidth: 120, align: 'center' },
  { prop: 'approveTime', label: '审批时间', minWidth: 160, align: 'center' }
]

// 状态类型映射
const getStatusType = (status) => {
  const statusMap = {
    '待审批': 'warning',
    '已通过': 'success',
    '已驳回': 'danger',
    '待提交': 'info'
  }
  return statusMap[status] || 'info'
}

// 查看表单字段配置
const viewFormFields = [
  { prop: 'studentNo', label: '学号', type: 'input', span: 12 },
  { prop: 'studentName', label: '学生姓名', type: 'input', span: 12 },
  { prop: 'className', label: '所在班级', type: 'input', span: 12 },
  { prop: 'department', label: '系部', type: 'input', span: 12 },
  { prop: 'week', label: '周次', type: 'input', span: 12 },
  { prop: 'submitDate', label: '提交日期', type: 'input', span: 12 },
  { prop: 'status', label: '状态', type: 'input', span: 12 },
  { prop: 'isSupplement', label: '是否补报', type: 'input', span: 12 },
  { prop: 'approver', label: '审批人', type: 'input', span: 12 },
  { prop: 'score', label: '评分', type: 'input', span: 12 },
  { prop: 'comment', label: '审批评语', type: 'textarea', span: 24, rows: 4 },
  { prop: 'approveTime', label: '审批时间', type: 'input', span: 12 }
]

// 审批表单字段配置
const approveFormFields = [
  { prop: 'studentName', label: '学生', type: 'input', disabled: true, span: 12 },
  { prop: 'week', label: '周次', type: 'input', disabled: true, span: 12 },
  { prop: 'status', label: '审批结果', type: 'select', span: 12, options: [
    { label: '通过', value: '已通过' },
    { label: '驳回', value: '已驳回' }
  ]},
  { prop: 'score', label: '评分', type: 'input', span: 12, placeholder: '请输入评分（0-100）' },
  { prop: 'comment', label: '审批评语', type: 'textarea', span: 24, rows: 5, placeholder: '请输入审批意见' }
]

// 审批表单验证规则
const approveFormRules = {
  status: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
  score: [
    { required: true, message: '请输入评分', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '评分范围为0-100', trigger: 'blur' }
  ],
  comment: [{ required: true, message: '请输入审批评语', trigger: 'blur' }]
}

// 查看对话框相关
const viewDialogVisible = ref(false)
const viewFormRef = ref()
const viewFormData = reactive({
  id: null,
  studentNo: '',
  studentName: '',
  className: '',
  department: '',
  week: '',
  submitDate: '',
  status: '',
  isSupplement: '',
  approver: '',
  score: '',
  comment: '',
  approveTime: ''
})

// 审批对话框相关
const approveDialogVisible = ref(false)
const approveFormRef = ref()
const approveFormData = reactive({
  id: null,
  studentName: '',
  week: '',
  status: '已通过',
  score: '',
  comment: ''
})

// Crud 组件引用
const crudRef = ref()
const errorMessage = ref('')

console.log('=================== 周报页面初始化 ===================')

// 监听 crudRef 变化
watch(crudRef, (newVal) => {
  console.log('crudRef 变化:', !!newVal)
}, { immediate: true })

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
}

// 刷新
const handleRefresh = () => {
  console.log('刷新列表')
  crudRef.value?.refresh()
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 已写周报统计
const handleWrittenStats = () => {
  ElMessageBox.alert('已提交周报学生：156人', '已写周报统计', {
    confirmButtonText: '确定'
  })
}

// 未写周报统计
const handleUnwrittenStats = () => {
  ElMessageBox.alert('未提交周报学生：79人', '未写周报统计', {
    confirmButtonText: '确定'
  })
}

// 完成数量统计
const handleCompleteStats = () => {
  ElMessageBox.alert('本周应提交：235人\n已提交：156人\n完成率：66.4%', '完成数量统计', {
    confirmButtonText: '确定',
    dangerouslyUseHTMLString: true
  })
}

// 详情
const handleView = (row) => {
  Object.assign(viewFormData, row)
  viewDialogVisible.value = true
}

// 审批
const handleApprove = (row) => {
  Object.assign(approveFormData, {
    id: row.id,
    studentName: row.studentName,
    week: row.week,
    status: '已通过',
    score: row.score !== '-' ? row.score : '',
    comment: row.comment !== '-' ? row.comment : ''
  })
  approveDialogVisible.value = true
}

// 通过
const handlePass = async () => {
  const valid = await approveFormRef.value?.validate()
  if (valid) {
    ElMessage.success('审批通过')
    approveDialogVisible.value = false
    crudRef.value?.refresh()
  }
}

// 驳回
const handleReject = async () => {
  approveFormData.status = '已驳回'
  const valid = await approveFormRef.value?.validate()
  if (valid) {
    ElMessage.success('已驳回')
    approveDialogVisible.value = false
    crudRef.value?.refresh()
  }
}

// 撤回
const handleWithdraw = (row) => {
  ElMessageBox.confirm(
    `确定要撤回学生【${row.studentName}】第【${row.week}】的周报吗？撤回后学生可以重新编辑和提交。`,
    '撤回确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('撤回成功')
    crudRef.value?.refresh()
  }).catch(() => {
    // 用户取消操作
  })
}

// 分页大小变化
const handleSizeChange = (size) => {
  console.log('每页条数变化:', size)
}

// 当前页变化
const handleCurrentChange = (page) => {
  console.log('当前页变化:', page)
}

// 关闭查看对话框
const handleViewDialogClose = () => {
  viewFormRef.value?.clearValidate()
}

// 关闭审批对话框
const handleApproveDialogClose = () => {
  approveFormRef.value?.clearValidate()
}
</script>

<style scoped>
</style>
