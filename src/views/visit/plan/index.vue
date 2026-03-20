<template>
  <div class="visit-plan-page" style="min-height: 500px">
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
        <el-button type="success" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">新增巡访</el-button>
        <el-button type="primary" @click="handleExportVisit">导出巡访手册</el-button>
      </template>
    </Crud>

    <!-- 详情/编辑/新增对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :show-footer="dialogMode !== 'view'"
      :show-form="true"
      :form-fields="dialogMode === 'view' ? detailFields : formFields"
      :form-data="formData"
      :view-mode="dialogMode === 'view'"
      @confirm="handleConfirm"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
    >
      <template #footer v-if="dialogMode !== 'view'">
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">提交</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

// 对话框模式：view-查看，edit-编辑，add-新增
const dialogMode = ref('view')

// 学生多选选项（必须在formFields之前定义）
const studentOptions = [
  { label: '赵雨欣 - 2022350101 - 助教', value: '1' },
  { label: '王梓雯 - 2022350102 - 幼教', value: '2' },
  { label: '徐宁 - 2022350103 - 助教', value: '3' },
  { label: '毕雪艳 - 2022350104 - 保育员', value: '4' },
  { label: '陈诗琪 - 2022350105 - 助教', value: '5' },
  { label: '陈玘涵 - 2022350106 - 幼教', value: '6' },
  { label: '严卓越 - 2022350107 - 助教', value: '7' }
]

// 新增/编辑表单字段配置
const formFields = [
  {
    title: '巡访信息',
    fields: [
      { prop: 'visitTime', label: '巡访日期', type: 'date', span: 12, required: true, format: 'yyyy-MM-dd HH:mm:ss', valueFormat: 'yyyy-MM-dd HH:mm:ss' },
      { prop: 'visitType', label: '巡访形式', type: 'select', span: 12, required: true, options: [
        { label: '视频巡访', value: '视频巡访' },
        { label: '实地巡访', value: '实地巡访' }
      ]},
      { prop: 'studentSelect', label: '巡访学生', type: 'select', span: 24, required: true, multiple: true, filterable: true, placeholder: '请选择或搜索学生', options: studentOptions },
      { prop: 'companyName', label: '企业', type: 'input', span: 12, required: true },
      { prop: 'position', label: '岗位', type: 'input', span: 12, required: true },
      { prop: 'visitAddress', label: '教师巡访地址', type: 'input', span: 24, required: true },
      { prop: 'visitResult', label: '巡访情况', type: 'select', span: 12, required: true, options: [
        { label: '优秀', value: '优秀' },
        { label: '良好', value: '良好' },
        { label: '一般', value: '一般' }
      ]},
      { prop: 'summary', label: '巡访小结', type: 'textarea', span: 24, rows: 4, required: true },
      { prop: 'attachments', label: '上传图片', type: 'upload', span: 24, limit: 9, accept: 'image/*', listType: 'picture-card' }
    ]
  }
]

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1

    const teacherName = '赵伊多'
    const companies = [
      '南京市深水区琴韵华庭',
      '雨花台区洁均栢百货经',
      '南京星宝联萌婴幼儿托',
      '南京晓庄健身俱乐部',
      '江苏华新教育科技有限公司',
      '南京天正信息技术有限公司',
      '南京思创信息技术有限公司'
    ]
    const students = [
      '赵雨欣', '王梓雯', '徐宁', '毕雪艳', '陈诗琪', '陈玘涵', '严卓越',
      '洪乙菲', '王雨轩', '马雨珊', '石勤勤', '殷熙脉', '李清音', '夏雪',
      '陈蕊', '钟桃', '金曼', '张静恩', '史欣悦'
    ]
    const addresses = [
      '江苏省南京市玄武区中山东路',
      '江苏省南京市鼓楼区广州路',
      '江苏省南京市鼓楼区草场门大街124-3号临',
      '江苏省南京市玄武区龙蟠中路30号',
      '江苏省南京市秦淮区内环东线',
      '江苏省南京市栖霞区灵山北路',
      '江苏省南京市玄武区鹤鸣路52-1号',
      '江苏省南京市玄武区鹤鸣路52-3号',
      '江苏省南京市栖霞区麒麟门大道',
      '江苏省南京市栖霞区沪蓉高速',
      '江苏省南京市秦淮区长白街265-26号',
      '江苏省南京市鼓楼区漓江路辅路',
      '江苏省南京市鼓楼区凤羽路',
      '江苏省南京市栖霞区尧化平',
      '江苏省南京市栖霞区寅春西路',
      '江苏省南京市浦口区金色朝阳',
      '江苏省南京市玄武区中山门大街'
    ]
    const visitTypes = ['视频巡访', '实地巡访']
    const visitResults = ['优秀', '良好', '一般']

    const positions = ['质量检测', '客户服务', '市场营销', '行政助理', '技术研发', '人事专员', '财务会计']
    const summaries = [
      '工作认真踏实，对客人热情，服务态度好',
      '表现良好，能够积极配合企业工作',
      '实习态度端正，学习能力强',
      '与同事相处融洽，工作积极主动',
      '专业技能掌握较好，适应能力强'
    ]

    const data = Array.from({ length: pageSize }, (_, i) => {
      const studentCount = i === 3 ? 16 : 1
      const studentNames = []
      const count = i === 3 ? 16 : Math.min(2, students.length)
      for (let j = 0; j < count; j++) {
        studentNames.push(students[(i + j) % students.length])
      }
      if (studentCount > 2) {
        studentNames.push('...')
      }

      // 生成巡访学生信息
      const studentInfo = studentCount === 1 
        ? `${students[i % students.length]}、2022350${i + 1}、22服务${(i % 5) + 1}班、`
        : `${students[0]}等${studentCount}人`

      // 审核状态：0-待审核，1-审核通过，2-已退回
      const auditStatusOptions = ['pending', 'approved', 'rejected']
      const auditStatus = auditStatusOptions[i % 3]

      return {
        id: (page - 1) * pageSize + i + 1,
        teacherName: teacherName,
        visitTime: `2025-06-${29 - (i % 10)} ${String(22 - (i % 12)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}:00`,
        companyName: companies[i % companies.length],
        studentCount: studentCount,
        studentNames: studentNames.join(' '),
        studentInfo: studentInfo,
        position: positions[i % positions.length],
        visitType: visitTypes[i % visitTypes.length],
        visitResult: visitResults[i % visitResults.length],
        summary: summaries[i % summaries.length],
        visitAddress: addresses[i % addresses.length],
        auditStatus: auditStatus,
        attachments: [{ name: '巡访照片.jpg', url: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' }]
      }
    })

    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: 120
      }
    })
  },
  delete: (params) => {
    console.log('删除参数:', params)
    return Promise.resolve({ data: { success: true } })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'visitMonth',
    label: '选择月',
    type: 'month',
    placeholder: '请选择月份',
    span: 6
  },
  {
    prop: 'teacherName',
    label: '教师名称',
    type: 'select',
    placeholder: '请选择教师',
    options: [
      { label: '全部', value: '' },
      { label: '赵伊多', value: '赵伊多' }
    ],
    span: 6
  },
  {
    prop: 'keyword',
    label: '请输入关键字',
    type: 'input',
    placeholder: '请输入关键字',
    span: 6
  },
  {
    prop: 'school',
    label: '学校',
    type: 'select',
    placeholder: '请选择学校',
    options: [
      { label: '全部', value: '' },
      { label: '南京市玄武中等专业学校', value: 'xuanwu' },
      { label: '南京市栖霞中等专业学校', value: 'xintaixia' },
      { label: '南京市秦淮中等专业学校', value: 'qinhuai' }
    ],
    span: 6
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'teacherName', label: '巡访教师', minWidth: 100, align: 'center' },
  { prop: 'visitTime', label: '巡访时间', minWidth: 160, align: 'center' },
  { prop: 'companyName', label: '企业名称', minWidth: 180, align: 'center', showOverflowTooltip: true },
  { prop: 'studentCount', label: '巡访学生数', width: 100, align: 'center' },
  { prop: 'studentNames', label: '学生姓名', minWidth: 150, align: 'center', showOverflowTooltip: true },
  { prop: 'visitType', label: '巡访类型', width: 100, align: 'center' },
  { prop: 'visitResult', label: '巡访情况', width: 100, align: 'center' },
  { prop: 'visitAddress', label: '巡访地址', minWidth: 200, align: 'center', showOverflowTooltip: true },
  {
    prop: 'auditStatus',
    label: '审核状态',
    width: 100,
    align: 'center',
    formatter: (value, row) => {
      const statusMap = {
        'pending': '待审核',
        'approved': '审核通过',
        'rejected': '已退回'
      }
      return statusMap[value] || value
    }
  }
]

// 详情表单字段
const detailFields = [
  {
    title: '巡访信息',
    fields: [
      { prop: 'teacherName', label: '巡访教师', type: 'input', span: 12 },
      { prop: 'visitTime', label: '巡访日期', type: 'input', span: 12 },
      { prop: 'studentInfo', label: '巡访学生', type: 'input', span: 24 },
      { prop: 'companyName', label: '企业名称', type: 'input', span: 24 },
      { prop: 'position', label: '岗位', type: 'input', span: 12 },
      { prop: 'visitType', label: '巡访形式', type: 'input', span: 12 },
      { prop: 'visitResult', label: '巡访情况', type: 'input', span: 12 },
      { prop: 'summary', label: '小结', type: 'textarea', span: 24, rows: 3 },
      { prop: 'visitAddress', label: '巡访地址', type: 'input', span: 24 },
      { prop: 'attachments', label: '附件', type: 'upload', span: 24, hideDelete: true }
    ]
  }
]

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('巡访详情')
const dialogRef = ref()

const formData = reactive({
  id: null,
  teacherName: '',
  visitTime: '',
  companyName: '',
  studentCount: 0,
  studentNames: '',
  studentInfo: '',
  studentSelect: '',
  position: '',
  visitType: '',
  visitResult: '',
  summary: '',
  visitAddress: '',
  attachments: []
})

// Crud 组件引用
const crudRef = ref()

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

// 导出巡访手册
const handleExportVisit = () => {
  ElMessage.success('导出巡访手册成功')
}

// 查看
const handleView = (row) => {
  Object.assign(formData, row)
  dialogTitle.value = `${row.studentNames} 巡访记录详情`
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  Object.assign(formData, row)
  // 将学生姓名转换为 studentSelect 数组
  const studentNames = row.studentNames?.split(' ').filter(n => n && n !== '...') || []
  const selected = studentOptions
    .filter(opt => studentNames.some(name => opt.label.startsWith(name)))
    .map(opt => opt.value)
  formData.studentSelect = selected
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑巡访'
  nextTick(() => {
    const formEl = dialogRef.value?.formRef
    if (formEl) {
      formEl.clearValidate()
    }
  })
  dialogVisible.value = true
}

// 新增
const handleAdd = () => {
  Object.assign(formData, {
    id: null,
    teacherName: '赵伊多',
    visitTime: '',
    companyName: '',
    studentCount: 0,
    studentNames: '',
    studentInfo: '',
    studentSelect: [],
    position: '',
    visitType: '',
    visitResult: '',
    summary: '',
    visitAddress: '',
    attachments: []
  })
  dialogMode.value = 'add'
  dialogTitle.value = '新增巡访'
  // 清除表单验证状态
  nextTick(() => {
    dialogRef.value?.$nextTick(() => {
      const formEl = dialogRef.value?.formRef
      if (formEl) {
        formEl.clearValidate()
      }
    })
  })
  dialogVisible.value = true
}


// 表单确认
const handleConfirm = () => {
  console.log('提交表单数据:', formData)
  ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '保存成功')
  dialogVisible.value = false
  crudRef.value?.refresh()
}

// 保存草稿
const handleSaveDraft = () => {
  console.log('保存草稿数据:', formData)
  ElMessage.success('草稿保存成功')
  dialogVisible.value = false
  crudRef.value?.refresh()
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条巡访记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    crudRef.value?.refresh()
  }).catch(() => {})
}

// 分页大小变化
const handleSizeChange = (size) => {
  console.log('每页条数变化:', size)
}

// 当前页变化
const handleCurrentChange = (page) => {
  console.log('当前页变化:', page)
}

// 关闭对话框
const handleDialogClose = () => {
  console.log('对话框关闭')
}
</script>

<style scoped>

</style>
