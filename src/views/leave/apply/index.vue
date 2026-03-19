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
        <!-- 审批模式：显示通过和驳回按钮 -->
        <template v-if="dialogMode === 'approve'">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="success" @click="handleApproveSubmit">通过</el-button>
          <el-button type="danger" @click="handleRejectSubmit">驳回</el-button>
        </template>
        <!-- 查看模式：只显示确定按钮 -->
        <el-button v-else-if="dialogMode === 'view'" type="primary" @click="dialogVisible = false">确定</el-button>
        <!-- 新增/编辑模式：显示取消和确定按钮 -->
        <template v-else>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
        </template>
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
        startTime: '2025-05-15 13:30:00',
        endTime: '2025-05-16 00:00:00',
        leaveDays: '1',
        reason: '回学校参加论文答辩',
        emergencyContact: '徐春霞',
        phone: '18205185846',
        attachments: [{ name: '证明.jpg', url: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' }],
        applyTime: '2025-05-10 10:30:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 2,
        applicant: '江焮漪',
        className: '护理2201',
        startTime: '2025-05-18 08:00:00',
        endTime: '2025-05-19 18:00:00',
        leaveDays: '2',
        reason: '家里有急事需要处理',
        emergencyContact: '江先生',
        phone: '13800138001',
        attachments: [],
        applyTime: '2025-05-12 09:15:00',
        approvalStatus: 'approved',
        approver: '张老师'
      },
      {
        id: 3,
        applicant: '王佳璐',
        className: '护理2202',
        startTime: '2025-05-20 09:00:00',
        endTime: '2025-05-22 17:00:00',
        leaveDays: '3',
        reason: '感冒发烧，需要休息就医',
        emergencyContact: '王先生',
        phone: '13900139002',
        attachments: [],
        applyTime: '2025-05-18 14:20:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 4,
        applicant: '赵佳羽',
        className: '护理2203',
        startTime: '2025-05-05 14:00:00',
        endTime: '2025-05-05 18:00:00',
        leaveDays: '0.5',
        reason: '参加学校组织的重要会议',
        emergencyContact: '赵女士',
        phone: '13700137003',
        attachments: [],
        applyTime: '2025-05-03 08:45:00',
        approvalStatus: 'approved',
        approver: '李主任'
      },
      {
        id: 5,
        applicant: '李妍辰',
        className: '护理2201',
        startTime: '2025-05-25 08:00:00',
        endTime: '2025-05-25 17:00:00',
        leaveDays: '1',
        reason: '家庭事务需要处理',
        emergencyContact: '李先生',
        phone: '13600136005',
        attachments: [],
        applyTime: '2025-05-23 11:00:00',
        approvalStatus: 'rejected',
        approver: '王老师'
      },
      {
        id: 6,
        applicant: '梁雨露',
        className: '护理2202',
        startTime: '2025-05-28 08:00:00',
        endTime: '2025-05-29 18:00:00',
        leaveDays: '2',
        reason: '肠胃不适，需要就医',
        emergencyContact: '梁女士',
        phone: '13500135006',
        attachments: [],
        applyTime: '2025-05-26 15:30:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 7,
        applicant: '林欣',
        className: '护理2203',
        startTime: '2025-06-02 08:00:00',
        endTime: '2025-06-04 18:00:00',
        leaveDays: '3',
        reason: '参加朋友的婚礼',
        emergencyContact: '林先生',
        phone: '13400134007',
        attachments: [],
        applyTime: '2025-05-30 09:50:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 8,
        applicant: '李慧珍',
        className: '护理2201',
        startTime: '2025-06-08 08:00:00',
        endTime: '2025-06-11 18:00:00',
        leaveDays: '4',
        reason: '需要进行牙科手术',
        emergencyContact: '李女士',
        phone: '13300133008',
        attachments: [],
        applyTime: '2025-06-05 13:25:00',
        approvalStatus: 'approved',
        approver: '张老师'
      },
      {
        id: 9,
        applicant: '何宇豪',
        className: '护理2202',
        startTime: '2025-06-12 08:00:00',
        endTime: '2025-06-12 18:00:00',
        leaveDays: '1',
        reason: '参加实习单位组织的培训',
        emergencyContact: '何先生',
        phone: '13200132009',
        attachments: [],
        applyTime: '2025-06-10 10:10:00',
        approvalStatus: 'approved',
        approver: '李主任'
      },
      {
        id: 10,
        applicant: '谢雅',
        className: '护理2203',
        startTime: '2025-06-18 08:00:00',
        endTime: '2025-06-19 18:00:00',
        leaveDays: '2',
        reason: '处理个人事务',
        emergencyContact: '谢先生',
        phone: '13100131010',
        attachments: [],
        applyTime: '2025-06-15 14:40:00',
        approvalStatus: 'pending',
        approver: ''
      },
      {
        id: 11,
        applicant: '侯欣妍',
        className: '护理2204',
        startTime: '2025-06-22 08:00:00',
        endTime: '2025-06-24 18:00:00',
        leaveDays: '3',
        reason: '身体检查需要住院观察',
        emergencyContact: '侯先生',
        phone: '13000130011',
        attachments: [],
        applyTime: '2025-06-20 08:55:00',
        approvalStatus: 'rejected',
        approver: '王老师'
      },
      {
        id: 12,
        applicant: '张颖',
        className: '护理2205',
        startTime: '2025-06-25 08:00:00',
        endTime: '2025-06-25 18:00:00',
        leaveDays: '1',
        reason: '参加学校组织的义务活动',
        emergencyContact: '张女士',
        phone: '18900129012',
        attachments: [],
        applyTime: '2025-06-23 11:30:00',
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
    console.log('新增请假条:', data)
    return Promise.resolve({ code: 200, message: '新增成功' })
  },
  update: (data) => {
    console.log('修改请假条:', data)
    return Promise.resolve({ code: 200, message: '修改成功' })
  },
  approve: (data) => {
    console.log('审批请假条:', data)
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
  { prop: 'applicant', label: '请假人', minWidth: 100 },
  { prop: 'className', label: '所在班级', minWidth: 110 },
  { prop: 'startTime', label: '开始日期', minWidth: 160 },
  { prop: 'endTime', label: '结束日期', minWidth: 160 },
  { prop: 'leaveDays', label: '请假天数', width: 100 },
  { prop: 'reason', label: '请假事由', minWidth: 150 },
  { prop: 'emergencyContact', label: '紧急联系人', minWidth: 100 },
  { prop: 'phone', label: '手机', width: 120 },
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
    title: '请假信息',
    fields: [
      {
        prop: 'applicant',
        label: '请假人',
        type: 'input',
        required: true,
        placeholder: '填写请假人姓名',
        span: 12
      },
      {
        prop: 'className',
        label: '所在班级',
        type: 'input',
        required: true,
        placeholder: '填写所属班级',
        span: 12
      },
      {
        prop: 'startTime',
        label: '开始日期',
        type: 'datetime',
        required: true,
        placeholder: '选择开始日期时间',
        span: 12
      },
      {
        prop: 'endTime',
        label: '结束日期',
        type: 'datetime',
        required: true,
        placeholder: '选择结束日期时间',
        span: 12
      },
      {
        prop: 'leaveDays',
        label: '请假天数',
        type: 'input',
        required: true,
        placeholder: '填写请假天数',
        suffix: '天',
        span: 12
      },
      {
        prop: 'reason',
        label: '请假事由',
        type: 'textarea',
        required: true,
        placeholder: '填写请假原因',
        rows: 3,
        span: 24
      },
      {
        prop: 'emergencyContact',
        label: '紧急联系人',
        type: 'input',
        required: true,
        placeholder: '填写紧急联络人姓名',
        span: 12
      },
      {
        prop: 'phone',
        label: '手机',
        type: 'input',
        required: true,
        placeholder: '填写联系电话',
        span: 12
      },
      {
        prop: 'attachments',
        label: '附件',
        type: 'upload',
        span: 24,
        limit: 3,
        accept: 'image/*',
        listType: 'picture-card',
        tip: '上传证明材料（最多3张）'
      }
    ]
  }
]

// 表单验证规则
const formRules = {
  applicant: [
    { required: true, message: '请输入请假人', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请输入所在班级', trigger: 'blur' }
  ],
  startTime: [
    { required: true, message: '请选择开始日期', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束日期', trigger: 'change' }
  ],
  leaveDays: [
    { required: true, message: '请输入请假天数', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的天数', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入请假事由', trigger: 'blur' }
  ],
  emergencyContact: [
    { required: true, message: '请输入紧急联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// Crud 组件引用
const crudRef = ref()
const dialogRef = ref()

// 获取表单引用
const formRef = computed(() => dialogRef.value?.formRef)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('请假条')
const dialogMode = ref('view')
const formLabelWidth = '100px'

// 表单数据
const formData = reactive({
  id: null,
  applicant: '',
  className: '',
  startTime: '',
  endTime: '',
  leaveDays: '',
  reason: '',
  emergencyContact: '',
  phone: '',
  attachments: [],
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
  dialogTitle.value = '请假条'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 审批
const handleApprove = (row) => {
  dialogMode.value = 'approve'
  dialogTitle.value = '审批请假条'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 判断对话框是否为只读模式（查看或审批模式都不可编辑）
const isViewMode = computed(() => dialogMode.value === 'view' || dialogMode.value === 'approve')

// 审批通过
const handleApproveSubmit = async () => {
  try {
    await ElMessageBox.confirm('确定通过该请假条？', '提示', {
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
