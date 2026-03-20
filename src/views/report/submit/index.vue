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
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button v-if="row.status === '待审批'" type="success" link @click="handleApprove(row)">审批</el-button>
        <el-button v-if="row.status !== '待审批' && row.status !== '待提交'" type="warning" link @click="handleWithdraw(row)">撤回</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleWrittenStats">已写周报统计</el-button>
        <el-button type="warning" @click="handleUnwrittenStats">未写周报统计</el-button>
        <el-button type="success" @click="handleCompleteStats">完成数量统计</el-button>
      </template>
    </Crud>

    <!-- 详情/审批对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :form-label-width="formLabelWidth"
      :show-footer="true"
      :show-form="true"
      :form-fields="dialogFields"
      :form-rules="!isViewMode ? approveFormRules : {}"
      :form-data="dialogFormData"
      :view-mode="isViewMode"
      :disabled="isViewMode"
      @update:form-data="dialogFormData = $event"
      @close="handleDialogClose"
    >
      <template #footer>
        <template v-if="!isViewMode">
          <el-button type="success" @click="handlePass">通过</el-button>
          <el-button type="danger" @click="handleReject">驳回</el-button>
        </template>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1
    const mockAttachments = [
      { name: '工作照片1.jpg', url: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
      { name: '工作照片2.jpg', url: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
      { name: '工作照片3.jpg', url: 'https://cube.elemecdn.com/e/5d/4a8a17d117ddb0827a3d1cf2c6b0djpeg.jpeg' }
    ]
    const data = Array.from({ length: pageSize }, (_, i) => {
      // 增加"待审批"状态的概率
      const random = Math.random()
      // 40% 待审批，20% 已通过，10% 已驳回，30% 待提交
      let status
      if (random < 0.4) {
        status = '待审批'
      } else if (random < 0.6) {
        status = '已通过'
      } else if (random < 0.7) {
        status = '已驳回'
      } else {
        status = '待提交'
      }
      const isSubmitted = status !== '待提交'
      return {
        id: (page - 1) * pageSize + i + 1,
        status,
        studentNo: '224102' + String(1000 + (page - 1) * pageSize + i).padStart(4, '0'),
        studentName: ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'][((page - 1) * pageSize + i) % 8],
        className: ['护理2201', '护理2202', '临床2201', '康复2201'][((page - 1) * pageSize + i) % 4],
        department: ['南丁格尔护理学院', '临床医学院', '康复医学院'][((page - 1) * pageSize + i) % 3],
        submitDate: isSubmitted ? `2026-03-${String(1 + i % 20).padStart(2, '0')}` : '-',
        week: `第${11 + i}周`,
        isSupplement: Math.random() > 0.8 ? '是' : '否',
        content: '本周主要完成了护理岗位的基础技能培训，包括患者生命体征监测、护理记录填写、药品发放等内容。在带教老师的指导下，进行了静脉输液的实际操作练习。',
        workPlan: '下周计划：1. 继续加强静脉输液操作练习；2. 学习患者健康宣教；3. 参与科室病例讨论。',
        problems: '在静脉输液时有时难以一次穿刺成功，需要多加练习。',
        attachments: isSubmitted ? mockAttachments : [],
        approver: ['刘老师', '陈老师', '杨老师', '王老师'][((page - 1) * pageSize + i) % 4],
        score: isSubmitted && Math.random() > 0.3 ? Math.floor(1 + Math.random() * 5) : '-',
        comment: isSubmitted && Math.random() > 0.5 ? '认真完成实习任务，继续保持！' : '',
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
    type: 'organizational',
    span: 4
  },
  {
    prop: 'week',
    label: '周次',
    type: 'select',
    options: Array.from({ length: 20 }, (_, i) => ({ label: `2026 第${i + 1}周`, value: i + 1 })),
    span: 4
  },
  {
    prop: 'studentName',
    label: '学生姓名/关键字',
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

// 查看表单字段配置（分组模式）
const viewFormFields = [
  {
    title: '报告内容',
    fields: [
      { prop: 'studentName', label: '学生姓名', type: 'input', span: 12 },
      { prop: 'className', label: '所在班级', type: 'input', span: 12 },
      { prop: 'week', label: '周次', type: 'input', span: 12 },
      { prop: 'submitDate', label: '提交日期', type: 'input', span: 12 },
      { prop: 'isSupplement', label: '是否补交', type: 'input', span: 12 },
      { prop: 'content', label: '报告内容', type: 'textarea', span: 24, rows: 4 },
      { prop: 'workPlan', label: '工作计划', type: 'textarea', span: 24, rows: 3 },
      { prop: 'problems', label: '遇到问题', type: 'textarea', span: 24, rows: 3 },
      { prop: 'attachments', label: '上传图片', type: 'upload', span: 24, listType: 'picture-card', limit: 9 }
    ]
  },
  {
    title: '审批结果',
    fields: [
      { prop: 'status', label: '审批结果', type: 'input', span: 24 },
      { prop: 'score', label: '评分', type: 'rate', span: 24 },
      { prop: 'comment', label: '评语', type: 'textarea', span: 24, rows: 3 }
    ]
  }
]

// 审批表单验证规则
const approveFormRules = {
  comment: [{ required: true, message: '请输入审批意见', trigger: 'blur' }]
}

const formLabelWidth = '100px'

// 合并后的对话框相关
const dialogVisible = ref(false)
const dialogRef = ref()
const dialogFormData = reactive({
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
  approveTime: '',
  content: '',
  workPlan: '',
  problems: '',
  attachments: []
})

// 对话框标题
const dialogTitle = computed(() => {
  return `${dialogFormData.studentName || ''} ${dialogFormData.week || ''} 工作周报`
})

// 对话框表单字段（根据isViewMode判断是否可编辑）
const dialogFields = computed(() => {
  if (!isViewMode.value) {
    // 审批模式：报告内容只读 + 审批结果可编辑
    return [
      {
        title: '报告内容',
        fields: [
          { prop: 'studentName', label: '学生姓名', type: 'input', disabled: true, span: 12 },
          { prop: 'className', label: '所在班级', type: 'input', disabled: true, span: 12 },
          { prop: 'week', label: '周次', type: 'input', disabled: true, span: 12 },
          { prop: 'submitDate', label: '提交日期', type: 'input', disabled: true, span: 12 },
          { prop: 'isSupplement', label: '是否补交', type: 'input', disabled: true, span: 12 },
          { prop: 'content', label: '报告内容', type: 'textarea', disabled: true, span: 24, rows: 4 },
          { prop: 'workPlan', label: '工作计划', type: 'textarea', disabled: true, span: 24, rows: 3 },
          { prop: 'problems', label: '遇到问题', type: 'textarea', disabled: true, span: 24, rows: 3 },
          { prop: 'attachments', label: '上传图片', type: 'upload', span: 24, listType: 'picture-card', limit: 9, hideUpload: true, hideDelete: true }
        ]
      },
      {
        title: '审批结果',
        fields: [
          { prop: 'status', label: '审批结果', type: 'input', disabled: true, span: 24 },
          { prop: 'score', label: '评分', type: 'rate', span: 24, max: 5, allowHalf: false, clearable: true },
          { prop: 'comment', label: '评语', type: 'textarea', span: 24, rows: 3, placeholder: '请输入审批意见' }
        ]
      }
    ]
  } else {
    // 查看模式
    return viewFormFields
  }
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

// 详情模式标记
const isViewMode = ref(true)

// 详情（始终只读）
const handleView = (row) => {
  isViewMode.value = true
  Object.assign(dialogFormData, row)
  // 分数已经是1-5，直接使用
  const scoreNum = Number(row.score)
  dialogFormData.score = (!isNaN(scoreNum) && scoreNum > 0) ? scoreNum : 0
  dialogVisible.value = true
}

// 审批（可编辑评分和评语）
const handleApprove = (row) => {
  isViewMode.value = false
  Object.assign(dialogFormData, row)
  // 分数已经是1-5，直接使用
  const scoreNum = Number(row.score)
  dialogFormData.score = (!isNaN(scoreNum) && scoreNum > 0) ? scoreNum : 0
  dialogVisible.value = true
}

// 关闭对话框
const handleDialogClose = () => {
  dialogRef.value?.formRef?.clearValidate()
}

// 通过
const handlePass = async () => {
  dialogFormData.status = '已通过'
  if (!isViewMode.value) {
    const valid = await dialogRef.value?.formRef?.validate()
    if (valid) {
      ElMessage.success('审批通过')
      dialogVisible.value = false
      crudRef.value?.refresh()
    }
  }
}

// 驳回
const handleReject = async () => {
  dialogFormData.status = '已驳回'
  if (!isViewMode.value) {
    const valid = await dialogRef.value?.formRef?.validate()
    if (valid) {
      ElMessage.success('已驳回')
      dialogVisible.value = false
      crudRef.value?.refresh()
    }
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
</script>


<style scoped>
</style>
