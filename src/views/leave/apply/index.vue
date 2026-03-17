<template>
  <div class="leave-apply-page">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :action-width="220"
      :action-min-width="200"
      :table-actions="{ view: true, approve: true }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @view="handleView"
      @approve="handleApprove"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button
          v-if="row.approvalStatus === 'pending'"
          type="success"
          link
          @click="handleApprove(row)"
        >
          审批
        </el-button>
      </template>
    </Crud>

    <!-- 新增/查看/编辑对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :form-label-width="formLabelWidth"
      :show-footer="true"
      :show-form="true"
      :form-fields="formFields"
      :form-rules="formRules"
      :form-data="formData"
      :view-mode="isViewMode"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
      @confirm="handleSubmit"
    >
      <!-- 自定义底部按钮 -->
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <!-- 审批模式：显示通过和驳回按钮 -->
        <template v-if="dialogMode === 'approve'">
          <el-button type="success" @click="handleApproveSubmit">通过</el-button>
          <el-button type="danger" @click="handleRejectSubmit">驳回</el-button>
        </template>
        <!-- 查看模式：只显示确定按钮 -->
        <el-button v-else-if="dialogMode === 'view'" type="primary" @click="dialogVisible = false">确定</el-button>
        <!-- 新增/编辑模式：显示确定按钮 -->
        <el-button v-else type="primary" @click="handleDialogConfirm">确定</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
// 学生数据
const students = [
  { id: 1, name: '阮文欣', className: '护理2201' },
  { id: 2, name: '江焮漪', className: '护理2201' },
  { id: 3, name: '王佳璐', className: '护理2201' },
  { id: 4, name: '赵佳羽', className: '护理2202' },
  { id: 5, name: '李妍辰', className: '护理2202' },
  { id: 6, name: '梁雨露', className: '护理2203' },
  { id: 7, name: '林欣', className: '护理2203' },
  { id: 8, name: '李慧珍', className: '护理2203' }
]

// 班级数据
const classes = [
  '护理2201',
  '护理2202',
  '护理2203',
  '护理2204',
  '护理2205',
  '临床2201',
  '临床2202'
]

// 请假类型
const leaveTypes = [
  { label: '事假', value: 'personal' },
  { label: '病假', value: 'sick' },
  { label: '公假', value: 'official' },
  { label: '婚假', value: 'marriage' },
  { label: '产假', value: 'maternity' }
]

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1

    // 模拟请假数据
    const mockData = [
      {
        id: 1,
        applicant: '阮文欣',
        className: '护理2201',
        title: '病假申请',
        type: '病假',
        leaveDays: '3',
        leaveTime: '2025-03-10',
        reason: '因身体不适，需要去医院检查治疗',
        applyTime: '2025-03-08 10:30:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 2,
        applicant: '江焮漪',
        className: '护理2201',
        title: '事假申请',
        type: '事假',
        leaveDays: '2',
        leaveTime: '2025-03-15',
        reason: '家里有急事需要处理',
        applyTime: '2025-03-12 09:15:00',
        approvalStatus: 'approved',
        approver: '张老师'
      },
      {
        id: 3,
        applicant: '王佳璐',
        className: '护理2202',
        title: '病假申请',
        type: '病假',
        leaveDays: '5',
        leaveTime: '2025-03-20',
        reason: '感冒发烧，需要休息',
        applyTime: '2025-03-18 14:20:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 4,
        applicant: '赵佳羽',
        className: '护理2203',
        title: '公假申请',
        type: '公假',
        leaveDays: '1',
        leaveTime: '2025-03-05',
        reason: '参加学校组织的重要会议',
        applyTime: '2025-03-03 08:45:00',
        approvalStatus: 'approved',
        approver: '李主任'
      },
      {
        id: 5,
        applicant: '李妍辰',
        className: '护理2201',
        title: '事假申请',
        type: '事假',
        leaveDays: '1',
        leaveTime: '2025-03-25',
        reason: '家庭事务需要处理',
        applyTime: '2025-03-23 11:00:00',
        approvalStatus: 'rejected',
        approver: '王老师'
      },
      {
        id: 6,
        applicant: '梁雨露',
        className: '护理2202',
        title: '病假申请',
        type: '病假',
        leaveDays: '2',
        leaveTime: '2025-03-28',
        reason: '肠胃不适，需要就医',
        applyTime: '2025-03-26 15:30:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 7,
        applicant: '林欣',
        className: '护理2203',
        title: '事假申请',
        type: '事假',
        leaveDays: '3',
        leaveTime: '2025-04-02',
        reason: '参加朋友的婚礼',
        applyTime: '2025-03-30 09:50:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 8,
        applicant: '李慧珍',
        className: '护理2201',
        title: '病假申请',
        type: '病假',
        leaveDays: '4',
        leaveTime: '2025-04-08',
        reason: '需要进行牙科手术',
        applyTime: '2025-04-05 13:25:00',
        approvalStatus: 'approved',
        approver: '张老师'
      },
      {
        id: 9,
        applicant: '何宇豪',
        className: '护理2202',
        title: '公假申请',
        type: '公假',
        leaveDays: '1',
        leaveTime: '2025-04-12',
        reason: '参加实习单位组织的培训',
        applyTime: '2025-04-10 10:10:00',
        approvalStatus: 'approved',
        approver: '李主任'
      },
      {
        id: 10,
        applicant: '谢雅',
        className: '护理2203',
        title: '事假申请',
        type: '事假',
        leaveDays: '2',
        leaveTime: '2025-04-18',
        reason: '处理个人事务',
        applyTime: '2025-04-15 14:40:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 11,
        applicant: '侯欣妍',
        className: '护理2204',
        title: '病假申请',
        type: '病假',
        leaveDays: '3',
        leaveTime: '2025-04-22',
        reason: '身体检查需要住院观察',
        applyTime: '2025-04-20 08:55:00',
        approvalStatus: 'rejected',
        approver: '王老师'
      },
      {
        id: 12,
        applicant: '张颖',
        className: '护理2205',
        title: '公假申请',
        type: '公假',
        leaveDays: '1',
        leaveTime: '2025-04-25',
        reason: '参加学校组织的义务活动',
        applyTime: '2025-04-23 11:30:00',
        approvalStatus: 'approved',
        approver: '张老师'
      }
    ]

    // 分页处理
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = mockData.slice(start, end)

    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: mockData.length
      }
    })
  },
  add: (data) => {
    console.log('新增请假申请:', data)
    return Promise.resolve({ code: 200, message: '新增成功' })
  },
  update: (data) => {
    console.log('修改请假申请:', data)
    return Promise.resolve({ code: 200, message: '修改成功' })
  },
  approve: (data) => {
    console.log('审批请假申请:', data)
    return Promise.resolve({ code: 200, message: '审批成功' })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'className',
    label: '请选择组织架构',
    type: 'select',
    placeholder: '请选择组织架构',
    options: classes.map(c => ({ label: c, value: c })),
    span: 4
  },
  {
    prop: 'studentName',
    label: '学生姓名',
    type: 'select',
    placeholder: '请选择学生/关键字',
    options: students.map(s => ({ label: s.name, value: s.name })),
    span: 4
  },
  {
    prop: 'month',
    label: '月份',
    type: 'month',
    placeholder: '选择月份',
    span: 4
  },
  {
    prop: 'approvalStatus',
    label: '审批状态',
    type: 'select',
    placeholder: '全部',
    options: [
      { label: '全部', value: '' },
      { label: '待审批', value: 'pending' },
      { label: '已通过', value: 'approved' },
      { label: '已驳回', value: 'rejected' }
    ],
    span: 4
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'applicant', label: '发起人', minWidth: 90 },
  { prop: 'className', label: '班级', minWidth: 110 },
  { prop: 'title', label: '标题', minWidth: 150 },
  { prop: 'type', label: '类型', width: 80 },
  { prop: 'leaveDays', label: '请假天数', width: 100 },
  { prop: 'leaveTime', label: '请假时间', minWidth: 180 },
  { prop: 'reason', label: '请假原因', minWidth: 150 },
  { prop: 'applyTime', label: '申请时间', width: 160 },
  {
    prop: 'approvalStatus',
    label: '审批状态',
    width: 100,
    formatter: (row) => {
      const statusMap = {
        pending: '待审批',
        approved: '已通过',
        rejected: '已驳回'
      }
      return statusMap[row.approvalStatus] || '-'
    }
  },
  { prop: 'approver', label: '审批人', width: 90 }
]

// 表单字段配置
const formFields = [
  {
    prop: 'applicant',
    label: '发起人',
    type: 'input',
    required: true,
    placeholder: '请输入发起人',
    disabled: true,
    span: 12
  },
  {
    prop: 'className',
    label: '班级',
    type: 'select',
    required: true,
    placeholder: '请选择班级',
    span: 12,
    options: classes.map(c => ({ label: c, value: c }))
  },
  {
    prop: 'title',
    label: '标题',
    type: 'input',
    required: true,
    placeholder: '请输入标题',
    span: 24
  },
  {
    prop: 'type',
    label: '请假类型',
    type: 'select',
    required: true,
    placeholder: '请选择请假类型',
    span: 12,
    options: leaveTypes
  },
  {
    prop: 'leaveDays',
    label: '请假天数',
    type: 'input',
    required: true,
    placeholder: '请输入请假天数',
    span: 12
  },
  {
    prop: 'leaveTime',
    label: '请假时间',
    type: 'date',
    required: true,
    placeholder: '请选择请假时间',
    span: 24
  },
  {
    prop: 'reason',
    label: '请假原因',
    type: 'textarea',
    required: true,
    placeholder: '请输入请假原因',
    span: 24
  }
]

// 表单验证规则
const formRules = {
  applicant: [
    { required: true, message: '请输入发起人', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择请假类型', trigger: 'change' }
  ],
  leaveDays: [
    { required: true, message: '请输入请假天数', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的天数', trigger: 'blur' }
  ],
  leaveTime: [
    { required: true, message: '请选择请假时间', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入请假原因', trigger: 'blur' },
    { min: 10, message: '请假原因至少10个字符', trigger: 'blur' }
  ]
}

// Crud 组件引用
const crudRef = ref()
const dialogRef = ref()

// 获取表单引用
const formRef = computed(() => dialogRef.value?.formRef)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('查看请假申请')
const dialogMode = ref('view')
const formLabelWidth = '100px'

// 表单数据
const formData = reactive({
  id: null,
  applicant: '',
  className: '',
  title: '',
  type: '',
  leaveDays: '',
  leaveTime: '',
  reason: '',
  applyTime: '',
  approvalStatus: 'pending',
  approver: ''
})

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
  ElMessage.success('导出请假记录成功')
}

// 查看
const handleView = (row) => {
  dialogMode.value = 'view'
  dialogTitle.value = '查看请假申请'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 审批
const handleApprove = (row) => {
  dialogMode.value = 'approve'
  dialogTitle.value = '审批请假申请'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 判断对话框是否为只读模式（查看或审批模式都不可编辑）
const isViewMode = computed(() => dialogMode.value === 'view' || dialogMode.value === 'approve')

// 审批通过
const handleApproveSubmit = async () => {
  try {
    await ElMessageBox.confirm('确定通过该请假申请？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })

    formData.approvalStatus = 'approved'
    formData.approver = '当前管理员'

    await apiConfig.approve(formData)
    ElMessage.success('审批通过成功')
    dialogVisible.value = false
    crudRef.value?.refresh()
  } catch (error) {
    // 用户取消
  }
}

// 审批驳回
const handleRejectSubmit = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入驳回原因', '驳回申请', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '驳回原因不能为空'
    })

    formData.approvalStatus = 'rejected'
    formData.approver = '当前管理员'
    formData.rejectReason = reason

    await apiConfig.approve(formData)
    ElMessage.success('审批驳回成功')
    dialogVisible.value = false
    crudRef.value?.refresh()
  } catch (error) {
    // 用户取消
  }
}

// 分页大小变化
const handleSizeChange = (size) => {
  console.log('每页条数变化:', size)
}

// 当前页变化
const handleCurrentChange = (page) => {
  console.log('当前页变化:', page)
}

// 对话框确认提交
const handleDialogConfirm = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    const now = new Date()
    formData.applyTime = now.toISOString()

    if (formData.id) {
      await apiConfig.update(formData)
      ElMessage.success('修改成功')
    } else {
      await apiConfig.add(formData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    crudRef.value?.refresh()
  }
}

// 提交表单（Dialog组件回调）
const handleSubmit = async () => {
  await handleDialogConfirm()
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.leave-apply-page {
  min-height: 500px;
}
</style>
