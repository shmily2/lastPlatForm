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
        <el-button v-if="row.status === '待审核'" type="warning" link @click="handleAudit(row)">审核</el-button>
      </template>
    </Crud>

    <!-- 统一弹框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="isViewMode ? '巡访详情' : '巡访审批'"
      width="800px"
      :show-footer="!isViewMode"
      :show-form="true"
      :form-fields="currentFields"
      :form-data="formData"
      :form-rules="!isViewMode ? formRules : {}"
      :view-mode="isViewMode"
      label-width="100px"
      @close="handleDialogClose"
    >
      <template #footer v-if="!isViewMode">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="danger" @click="handleReject">拒绝</el-button>
        <el-button type="success" @click="handleApprove">通过</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
const crudRef = ref(null)

// 弹框状态
const dialogVisible = ref(false)
const dialogRef = ref(null)
const isViewMode = ref(true) // true为查看模式，false为审批模式
const currentRow = ref(null)

// 表单数据
const formData = reactive({
  teacherName: '',
  visitTime: '',
  studentNames: '',
  studentNo: '',
  companyName: '',
  position: '',
  visitForm: '',
  visitSituation: '',
  visitSummary: '',
  attachments: [],
  auditor: '',
  auditStatus: '',
  auditComment: '',
  auditTime: '',
  auditSign: '',
  auditRemark: ''
})

// 表单校验规则
const formRules = {
  auditSign: [
    { required: true, message: '请签名后再审批', trigger: 'blur' }
  ]
}

// 弹框字段配置
const currentFields = computed(() => {
  if (isViewMode.value) {
    // 查看模式 - 详情弹框
    return [
      {
        title: '巡访详情',
        fields: [
          { prop: 'teacherName', label: '巡访教师', type: 'input', span: 12 },
          { prop: 'visitTime', label: '巡访日期', type: 'input', span: 12 },
          { prop: 'studentNames', label: '巡访学生', type: 'input', span: 12 },
          { prop: 'studentNo', label: '学号', type: 'input', span: 12 },
          { prop: 'companyName', label: '企业名称', type: 'input', span: 12 },
          { prop: 'position', label: '岗位', type: 'input', span: 12 },
          { prop: 'visitForm', label: '巡访形式', type: 'input', span: 12 },
          { prop: 'visitSituation', label: '巡访情况', type: 'input', span: 12 },
          { prop: 'visitSummary', label: '巡访小结', type: 'textarea', span: 24 },
          { prop: 'attachments', label: '现场照片', type: 'upload', span: 24, limit: 9, listType: 'picture-card', hideDelete: true }
        ]
      },
      {
        title: '审批详情',
        fields: [
          { prop: 'auditor', label: '审批人', type: 'input', span: 12 },
          { prop: 'auditStatus', label: '审批结果', type: 'input', span: 12, tag: true },
          { prop: 'auditComment', label: '审批评语', type: 'input', span: 24 },
          { prop: 'auditTime', label: '审批时间', type: 'input', span: 12 },
          { prop: 'auditSign', label: '审批人签名', type: 'image', span: 24 }
        ]
      }
    ]
  } else {
    // 审批模式 - 巡访信息只读，审批信息可编辑
    return [
      {
        title: '巡访详情',
        fields: [
          { prop: 'teacherName', label: '巡访教师', type: 'input', span: 12, disabled: true },
          { prop: 'visitTime', label: '巡访日期', type: 'input', span: 12, disabled: true },
          { prop: 'studentNames', label: '巡访学生', type: 'input', span: 12, disabled: true },
          { prop: 'studentNo', label: '学号', type: 'input', span: 12, disabled: true },
          { prop: 'companyName', label: '企业名称', type: 'input', span: 12, disabled: true },
          { prop: 'position', label: '岗位', type: 'input', span: 12, disabled: true },
          { prop: 'visitForm', label: '巡访形式', type: 'input', span: 12, disabled: true },
          { prop: 'visitSituation', label: '巡访情况', type: 'input', span: 12, disabled: true },
          { prop: 'visitSummary', label: '巡访小结', type: 'textarea', span: 24, disabled: true },
          { prop: 'attachments', label: '现场照片', type: 'image', span: 24 }
        ]
      },
      {
        title: '审批信息',
        fields: [
          { prop: 'auditRemark', label: '审批意见', type: 'textarea', span: 24, placeholder: '请输入审批意见（拒绝时必填）' },
          { prop: 'auditSign', label: '审批人签字', type: 'signature', span: 24, required: true }
        ]
      }
    ]
  }
})

// 模拟数据 - 更丰富的数据
const mockData = [
  {
    id: 1,
    teacherName: '李雯',
    visitTime: '2025-12-31 10:53:00',
    companyName: '南京脑科医院',
    studentCount: 2,
    studentNames: '刘奇蝶',
    studentNo: '214105115',
    publishTime: '2025-12-31 10:53',
    status: '待审核',
    position: '康复治疗师',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '该生目前在吞咽治疗室，已经能独立操作设备！嘱其把相关实习材料准备完毕！',
    attachments: [
      { name: '现场照片1.jpg', url: '/src/assets/code.png' },
      { name: '现场照片2.jpg', url: '/src/assets/qrcode.png' }
    ],
    auditor: '张华丽',
    auditTime: '2026-01-04 15:27:17',
    auditComment: '',
    auditSign: '张华丽'
  },
  {
    id: 2,
    teacherName: '陈静',
    visitTime: '2025-12-25 08:50:00',
    companyName: '南京市儿童医院',
    studentCount: 2,
    studentNames: '戴好婷 陆诗颖',
    studentNo: '214105201 214105202',
    publishTime: '2025-12-25 10:11',
    status: '待审核',
    position: '儿科护士',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '两名学生表现优秀，积极参与科室日常工作。',
    attachments: [],
    auditor: '',
    auditTime: '',
    auditComment: '',
    auditSign: ''
  },
  {
    id: 3,
    teacherName: '王轩雨',
    visitTime: '2025-12-17 10:38:00',
    companyName: '江苏省人民医院',
    studentCount: 3,
    studentNames: '李硕杰 和怡雨 张佳乐',
    studentNo: '214105301 214105302 214105303',
    publishTime: '2025-12-17 10:34',
    status: '审核通过',
    position: '临床实习',
    visitForm: '实地巡访',
    visitSituation: '优秀',
    visitSummary: '三位学生实习态度端正，专业知识扎实。',
    attachments: [{ name: '现场照片1.jpg', url: '/src/assets/code.png' }],
    auditor: '张华丽',
    auditTime: '2025-12-20 10:00:00',
    auditComment: '表现优秀，继续保持',
    auditSign: '张华丽'
  },
  {
    id: 4,
    teacherName: '毛纯',
    visitTime: '2025-12-15 14:20:00',
    companyName: '泰康之家苏园（南京）养老服务有限公司',
    studentCount: 1,
    studentNames: '陈思达',
    studentNo: '214105401',
    publishTime: '2025-12-15 14:10',
    status: '审核中',
    position: '养老护理员',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '学生适应能力强，与老人相处融洽。',
    attachments: [],
    auditor: '',
    auditTime: '',
    auditComment: '',
    auditSign: ''
  },
  {
    id: 5,
    teacherName: '冯宏军',
    visitTime: '2025-12-10 09:30:00',
    companyName: '江苏省中西医结合医院',
    studentCount: 2,
    studentNames: '沈歆 庆美洁',
    studentNo: '214105501 214105502',
    publishTime: '2025-12-10 09:25',
    status: '审核通过',
    position: '中医治疗师',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '两位学生学习认真，积极参与临床实践。',
    attachments: [],
    auditor: '张华丽',
    auditTime: '2025-12-12 14:30:00',
    auditComment: '',
    auditSign: '张华丽'
  },
  {
    id: 6,
    teacherName: '李程',
    visitTime: '2025-12-08 11:15:00',
    companyName: '南京市第一医院',
    studentCount: 1,
    studentNames: '王振',
    studentNo: '214105601',
    publishTime: '2025-12-08 11:00',
    status: '待审核',
    position: '外科护士',
    visitForm: '实地巡访',
    visitSituation: '一般',
    visitSummary: '学生需要加强操作技能训练。',
    attachments: [],
    auditor: '',
    auditTime: '',
    auditComment: '',
    auditSign: ''
  },
  {
    id: 7,
    teacherName: '朱彤',
    visitTime: '2025-12-05 16:40:00',
    companyName: '南京鼓楼医院',
    studentCount: 4,
    studentNames: '刘诗朵 金程 陈怡霭 李硕杰',
    studentNo: '214105701 214105702 214105703 214105704',
    publishTime: '2025-12-05 16:30',
    status: '审核通过',
    position: '手术室护士',
    visitForm: '实地巡访',
    visitSituation: '优秀',
    visitSummary: '团队协作良好，四名学生均表现优异。',
    attachments: [],
    auditor: '张华丽',
    auditTime: '2025-12-07 09:00:00',
    auditComment: '团队表现突出',
    auditSign: '张华丽'
  },
  {
    id: 8,
    teacherName: '张明',
    visitTime: '2025-12-01 10:20:00',
    companyName: '南京市中医院',
    studentCount: 2,
    studentNames: '和怡雨 张佳乐',
    studentNo: '214105801 214105802',
    publishTime: '2025-12-01 10:15',
    status: '审核未通过',
    position: '中药师',
    visitForm: '实地巡访',
    visitSituation: '较差',
    visitSummary: '学生纪律意识薄弱，需要加强管理。',
    attachments: [],
    auditor: '张华丽',
    auditTime: '2025-12-03 16:00:00',
    auditComment: '违反实习纪律',
    auditSign: '张华丽'
  },
  {
    id: 9,
    teacherName: '刘芳',
    visitTime: '2025-11-28 13:45:00',
    companyName: '南京医科大学第二附属医院',
    studentCount: 3,
    studentNames: '张一凡 董志远 史韵惠',
    studentNo: '214105901 214105902 214105903',
    publishTime: '2025-11-28 13:40',
    status: '审核通过',
    position: '康复科',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '三位学生实习积极主动。',
    attachments: [],
    auditor: '张华丽',
    auditTime: '2025-11-30 10:30:00',
    auditComment: '',
    auditSign: '张华丽'
  },
  {
    id: 10,
    teacherName: '王丽',
    visitTime: '2025-11-25 09:10:00',
    companyName: '南京市妇幼保健院',
    studentCount: 2,
    studentNames: '孟媛 金川木',
    studentNo: '214106001 214106002',
    publishTime: '2025-11-25 09:05',
    status: '待审核',
    position: '产科护士',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '学生对待患者热情细心。',
    attachments: [],
    auditor: '',
    auditTime: '',
    auditComment: '',
    auditSign: ''
  },
  {
    id: 11,
    teacherName: '陈晨',
    visitTime: '2025-11-20 15:30:00',
    companyName: '南京江北人民医院',
    studentCount: 1,
    studentNames: '王辰欣',
    studentNo: '214106101',
    publishTime: '2025-11-20 15:25',
    status: '审核通过',
    position: '急诊科护士',
    visitForm: '实地巡访',
    visitSituation: '优秀',
    visitSummary: '学生反应迅速，适应急诊节奏。',
    attachments: [],
    auditor: '张华丽',
    auditTime: '2025-11-22 11:00:00',
    auditComment: '表现优异',
    auditSign: '张华丽'
  },
  {
    id: 12,
    teacherName: '赵强',
    visitTime: '2025-11-18 10:50:00',
    companyName: '南京市栖霞区医院',
    studentCount: 2,
    studentNames: '朱恩恒 刘佳妤',
    studentNo: '214106201 214106202',
    publishTime: '2025-11-18 10:45',
    status: '审核中',
    position: '内科护士',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '两名学生表现良好。',
    attachments: [],
    auditor: '',
    auditTime: '',
    auditComment: '',
    auditSign: ''
  },
  {
    id: 13,
    teacherName: '周琳',
    visitTime: '2025-11-15 14:20:00',
    companyName: '南京明基医院',
    studentCount: 2,
    studentNames: '张鑫蕾 安韵惠',
    studentNo: '214106301 214106302',
    publishTime: '2025-11-15 14:15',
    status: '审核通过',
    position: '放射科',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '学生操作规范，遵守规章制度。',
    attachments: [],
    auditor: '张华丽',
    auditTime: '2025-11-17 09:30:00',
    auditComment: '',
    auditSign: '张华丽'
  },
  {
    id: 14,
    teacherName: '吴涛',
    visitTime: '2025-11-10 11:30:00',
    companyName: '南京市江宁医院',
    studentCount: 1,
    studentNames: '孟媛',
    studentNo: '214106401',
    publishTime: '2025-11-10 11:25',
    status: '待审核',
    position: '骨科护士',
    visitForm: '实地巡访',
    visitSituation: '良好',
    visitSummary: '学生勤奋好学。',
    attachments: [],
    auditor: '',
    auditTime: '',
    auditComment: '',
    auditSign: ''
  },
  {
    id: 15,
    teacherName: '郑浩',
    visitTime: '2025-11-05 16:15:00',
    companyName: '南京同仁医院',
    studentCount: 2,
    studentNames: '邵岩博 周文娜',
    studentNo: '214106501 214106502',
    publishTime: '2025-11-05 16:10',
    status: '审核通过',
    position: '眼科护士',
    visitForm: '实地巡访',
    visitSituation: '优秀',
    visitSummary: '两名学生专业素养高。',
    attachments: [],
    auditor: '张华丽',
    auditTime: '2025-11-07 14:00:00',
    auditComment: '优秀',
    auditSign: '张华丽'
  }
]

// API 配置
const apiConfig = {
  list: (params) => {
    const { page = 1, pageSize = 50 } = params || {}
    let filteredData = [...mockData]

    // 按月份筛选
    if (params?.month) {
      filteredData = filteredData.filter(item => item.visitTime.startsWith(params.month))
    }

    // 按企业名称筛选
    if (params?.companyName) {
      filteredData = filteredData.filter(item => 
        item.companyName.toLowerCase().includes(params.companyName.toLowerCase())
      )
    }

    // 关键字搜索
    if (params?.keyword) {
      const keyword = params.keyword.toLowerCase()
      filteredData = filteredData.filter(item =>
        item.teacherName.toLowerCase().includes(keyword) ||
        item.companyName.toLowerCase().includes(keyword) ||
        item.studentNames.toLowerCase().includes(keyword)
      )
    }

    // 按状态筛选
    if (params?.status && params.status !== 'all') {
      filteredData = filteredData.filter(item => item.status === params.status)
    }

    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = filteredData.slice(start, end)

    return Promise.resolve({
      code: 200,
      message: 'success',
      data: {
        list,
        total: filteredData.length
      }
    })
  },
  update: (data) => {
    const index = mockData.findIndex(item => item.id === data.id)
    if (index !== -1) {
      mockData[index] = { ...mockData[index], ...data }
    }
    return Promise.resolve({ code: 200, message: 'success' })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'month',
    label: '按月份',
    type: 'month',
    placeholder: '请选择月份',
    span: 4
  },
  {
    prop: 'companyName',
    label: '企业名称',
    type: 'input',
    placeholder: '请输入企业名称',
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
    placeholder: '全部状态',
    options: [
      { label: '全部状态', value: 'all' },
      { label: '待审核', value: '待审核' },
      { label: '审核中', value: '审核中' },
      { label: '审核通过', value: '审核通过' },
      { label: '审核未通过', value: '审核未通过' }
    ],
    span: 4
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'teacherName', label: '巡访教师', minWidth: 100, align: 'center' },
  { prop: 'visitTime', label: '巡访时间', minWidth: 160, align: 'center' },
  { prop: 'companyName', label: '企业名称', minWidth: 200, align: 'center' },
  { prop: 'studentCount', label: '巡访学生数', width: 100, align: 'center' },
  { prop: 'studentNames', label: '学生姓名', minWidth: 200, align: 'center' },
  { prop: 'publishTime', label: '发布日期', minWidth: 140, align: 'center' },
  { 
    prop: 'status', 
    label: '状态', 
    width: 100, 
    align: 'center',
    tag: (value) => {
      const tagMap = {
        '待审核': 'warning',
        '审核中': 'primary',
        '审核通过': 'success',
        '审核未通过': 'danger'
      }
      return tagMap[value] || 'info'
    }
  }
]

// 查看详情
const handleView = (row) => {
  currentRow.value = row
  Object.assign(formData, {
    teacherName: row.teacherName,
    visitTime: row.visitTime,
    studentNames: row.studentNames,
    studentNo: row.studentNo || '',
    companyName: row.companyName,
    position: row.position,
    visitForm: row.visitForm,
    visitSituation: row.visitSituation,
    visitSummary: row.visitSummary,
    attachments: row.attachments || [],
    auditor: row.auditor,
    auditStatus: row.status,
    auditComment: row.auditComment,
    auditTime: row.auditTime,
    auditSign: row.auditSign,
    auditRemark: ''
  })
  isViewMode.value = true
  dialogVisible.value = true
}

// 审核 - 打开审批弹框
const handleAudit = (row) => {
  currentRow.value = row
  Object.assign(formData, {
    teacherName: row.teacherName,
    visitTime: row.visitTime,
    studentNames: row.studentNames,
    studentNo: row.studentNo || '',
    companyName: row.companyName,
    position: row.position,
    visitForm: row.visitForm,
    visitSituation: row.visitSituation,
    visitSummary: row.visitSummary,
    attachments: row.attachments || [],
    auditor: row.auditor,
    auditStatus: row.status,
    auditComment: row.auditComment,
    auditTime: row.auditTime,
    auditSign: '',
    auditRemark: ''
  })
  isViewMode.value = false
  dialogVisible.value = true
}

// 审批通过
const handleApprove = async () => {
  // 检查签名
  if (!formData.auditSign) {
    ElMessage.warning('请先签名后再审批')
    return
  }
  
  const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  
  await apiConfig.update({
    id: currentRow.value.id,
    status: '审核通过',
    auditComment: formData.auditRemark,
    auditor: '张华丽',
    auditTime: now.replace(/\//g, '-'),
    auditSign: formData.auditSign
  })
  
  ElMessage.success('审批通过')
  formData.auditSign = ''
  formData.auditRemark = ''
  dialogVisible.value = false
  crudRef.value?.refresh()
}

// 审批拒绝
const handleReject = async () => {
  // 检查签名
  if (!formData.auditSign) {
    ElMessage.warning('请先签名后再审批')
    return
  }
  
  if (!formData.auditRemark) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  
  await apiConfig.update({
    id: currentRow.value.id,
    status: '审核未通过',
    auditComment: formData.auditRemark,
    auditor: '张华丽',
    auditTime: now.replace(/\//g, '-'),
    auditSign: formData.auditSign
  })
  
  ElMessage.success('已拒绝')
  formData.auditSign = ''
  formData.auditRemark = ''
  dialogVisible.value = false
  crudRef.value?.refresh()
}

// 关闭弹框时清空签名（仅在审批模式下）
const handleDialogClose = () => {
  if (!isViewMode.value) {
    // 先清空数据，再清除签名板
    formData.auditSign = ''
    formData.auditRemark = ''
    // 延迟清除签名板，确保 watch 不会重新初始化
    setTimeout(() => {
      dialogRef.value?.clearAllSignatures()
    }, 50)
  }
}

// 取消
const handleCancel = () => {
  // 先清空数据
  formData.auditSign = ''
  formData.auditRemark = ''
  // 延迟清除签名板
  setTimeout(() => {
    dialogRef.value?.clearAllSignatures()
  }, 50)
  dialogVisible.value = false
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

</style>
