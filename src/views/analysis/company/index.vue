<template>
  <div class="page-container">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{}"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
    >
      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button @click="handleReset">重置设置</el-button>
        <el-button type="primary" @click="handleExport">导出</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleViewDetail(row)">考评细则</el-button>
      </template>
    </Crud>

    <!-- 考评细则对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :show-form="true"
      :view-mode="isViewMode"
      :form-data="formData"
      :form-fields="formFields"
      :form-rules="formRules"
      :form-label-width="formLabelWidth"
      @update:form-data="formData = $event"
      @confirm="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

const crudRef = ref(null)
const dialogRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isViewMode = ref(false)
const formLabelWidth = '100px'

// 模拟数据
const mockData = [
  { id: 1, studentNo: '2021001', studentName: '张三', className: '520112', internshipScore: 95, clockScore: 88, weeklyScore: 92, monthlyScore: 90, totalScore: 91.25, assessmentMonth: '2026-03' },
  { id: 2, studentNo: '2021002', studentName: '李四', className: '520112', internshipScore: 88, clockScore: 92, weeklyScore: 85, monthlyScore: 88, totalScore: 88.25, assessmentMonth: '2026-03' },
  { id: 3, studentNo: '2021003', studentName: '王五', className: '520331', internshipScore: 90, clockScore: 85, weeklyScore: 88, monthlyScore: 85, totalScore: 87, assessmentMonth: '2026-03' },
  { id: 4, studentNo: '2021004', studentName: '赵六', className: '520331', internshipScore: 92, clockScore: 90, weeklyScore: 95, monthlyScore: 92, totalScore: 92.25, assessmentMonth: '2026-03' },
  { id: 5, studentNo: '2021005', studentName: '孙七', className: '520341', internshipScore: 85, clockScore: 88, weeklyScore: 82, monthlyScore: 85, totalScore: 85, assessmentMonth: '2026-03' },
  { id: 6, studentNo: '2021006', studentName: '周八', className: '520341', internshipScore: 93, clockScore: 95, weeklyScore: 90, monthlyScore: 93, totalScore: 92.75, assessmentMonth: '2026-03' },
  { id: 7, studentNo: '2021007', studentName: '吴九', className: '520332', internshipScore: 87, clockScore: 82, weeklyScore: 85, monthlyScore: 80, totalScore: 83.5, assessmentMonth: '2026-03' },
  { id: 8, studentNo: '2021008', studentName: '郑十', className: '520332', internshipScore: 91, clockScore: 89, weeklyScore: 88, monthlyScore: 90, totalScore: 89.5, assessmentMonth: '2026-03' }
]

// 搜索字段
const searchFields = [
  {
    prop: 'className',
    label: '选择班级',
    type: 'select',
    placeholder: '请选择班级',
    options: [
      { label: '520112', value: '520112' },
      { label: '520331', value: '520331' },
      { label: '520341', value: '520341' },
      { label: '520332', value: '520332' },
      { label: '520322', value: '520322' }
    ]
  },
  {
    prop: 'assessmentMonth',
    label: '考核周期',
    type: 'month',
    placeholder: '选择月份'
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentNo', label: '学号', width: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', width: 100, align: 'center' },
  { prop: 'className', label: '所在班级', width: 100, align: 'center' },
  { prop: 'internshipScore', label: '实习得分', width: 100, align: 'center' },
  { prop: 'clockScore', label: '打卡得分', width: 100, align: 'center' },
  { prop: 'weeklyScore', label: '周报得分', width: 100, align: 'center' },
  { prop: 'monthlyScore', label: '月报得分', width: 100, align: 'center' },
  { prop: 'totalScore', label: '总分', width: 100, align: 'center', formatter: (row) => row.totalScore.toFixed(2) },
  { prop: 'assessmentMonth', label: '考评月份', width: 100, align: 'center' }
]

// 表单字段（分组格式）
const formFields = [
  {
    title: '基本信息',
    fields: [
      {
        prop: 'studentNo',
        label: '学号',
        type: 'input',
        disabled: true
      },
      {
        prop: 'studentName',
        label: '学生姓名',
        type: 'input',
        disabled: true
      },
      {
        prop: 'className',
        label: '所在班级',
        type: 'input',
        disabled: true
      },
      {
        prop: 'assessmentMonth',
        label: '考评月份',
        type: 'input',
        disabled: true
      }
    ]
  },
  {
    title: '考核明细',
    fields: [
      {
        prop: 'internshipScore',
        label: '实习得分',
        type: 'number',
        disabled: true
      },
      {
        prop: 'clockScore',
        label: '打卡得分',
        type: 'number',
        disabled: true
      },
      {
        prop: 'weeklyScore',
        label: '周报得分',
        type: 'number',
        disabled: true
      },
      {
        prop: 'monthlyScore',
        label: '月报得分',
        type: 'number',
        disabled: true
      },
      {
        prop: 'totalScore',
        label: '总分',
        type: 'number',
        disabled: true
      }
    ]
  }
]

// 表单校验规则
const formRules = {}

// 表单数据
const formData = reactive({
  studentNo: '',
  studentName: '',
  className: '',
  assessmentMonth: '',
  internshipScore: 0,
  clockScore: 0,
  weeklyScore: 0,
  monthlyScore: 0,
  totalScore: 0
})

// API配置
const apiConfig = {
  list: async (params) => {
    let data = [...mockData]
    // 根据搜索条件过滤
    if (params.className) {
      data = data.filter(item => item.className === params.className)
    }
    if (params.assessmentMonth) {
      data = data.filter(item => item.assessmentMonth === params.assessmentMonth)
    }
    return {
      data,
      total: data.length
    }
  }
}

// 事件处理
const handleSearch = (params) => {
  console.log('搜索:', params)
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleRefresh = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

// 查看考评细则
const handleViewDetail = (row) => {
  isViewMode.value = true
  dialogTitle.value = '考评细则'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 重置设置
const handleReset = () => {
  ElMessageBox.confirm('确定要重置所有考核设置吗？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('重置成功')
  }).catch(() => {})
}

// 提交表单
const handleSubmit = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
