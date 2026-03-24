<template>
  <div class="page-container">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :action-width="220"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @view="handleView"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </Crud>

    <!-- 查看对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :show-footer="true"
      :view-mode="isViewMode"
      :form-data="formData"
      :show-form="true"
      :form-fields="formFields"
      :form-rules="formRules"
      :formLabelWidth="formLabelWidth"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
      @confirm="handleDialogConfirm"
    >
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
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
const dialogRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref('view')
const isViewMode = computed(() => dialogMode.value === 'view')
const formLabelWidth = ref('80px')
const formData = reactive({
  studentId: '',
  studentName: '',
  department: '',
  className: '',
  teacherName: '',
  year: '',
  month: '',
  createTime: '',
  evaluation: ''
})

// 模拟数据
const mockData = [
  { id: 1, studentId: '2019003', studentName: '温麦三', department: '计算机管理系', className: '520421', teacherName: '蔡颖', year: '2023', month: '8', createTime: '2023-08-25 15:36:47', evaluation: '表现优秀' },
  { id: 2, studentId: '2019003', studentName: '温麦三', department: '计算机管理系', className: '520421', teacherName: '蔡颖', year: '2023', month: '7', createTime: '2023-08-25 15:37:48', evaluation: '表现良好' },
  { id: 3, studentId: '2019003', studentName: '温麦三', department: '计算机管理系', className: '520421', teacherName: '蔡颖', year: '2023', month: '6', createTime: '2023-08-25 15:43:43', evaluation: '表现良好' },
  { id: 4, studentId: '2019003', studentName: '温麦三', department: '计算机管理系', className: '520421', teacherName: '蔡颖', year: '2023', month: '5', createTime: '2023-08-25 15:48:19', evaluation: '表现优秀' },
  { id: 5, studentId: '2019004', studentName: '温麦4', department: '计算机管理系', className: '520422', teacherName: '王惠', year: '2023', month: '8', createTime: '2023-08-25 16:00:19', evaluation: '表现良好' },
  { id: 6, studentId: '2019001', studentName: '温麦一', department: '计算机管理系', className: '520411', teacherName: '张老师', year: '2023', month: '8', createTime: '2023-08-25 16:04:06', evaluation: '表现优秀' },
  { id: 7, studentId: '2019001', studentName: '温麦一', department: '计算机管理系', className: '520411', teacherName: '张老师', year: '2023', month: '7', createTime: '2023-08-25 16:05:28', evaluation: '表现良好' },
  { id: 8, studentId: '200242114', studentName: '谭清如', department: '计算机管理系', className: '520421', teacherName: '蔡颖', year: '2025', month: '3', createTime: '2025-03-27 13:04:08', evaluation: '表现优秀' },
  { id: 9, studentId: '200245202', studentName: '孔梦婷', department: '计算机管理系', className: '520452', teacherName: '王惠', year: '2025', month: '2', createTime: '2025-04-08 14:13:43', evaluation: '表现良好' },
  { id: 10, studentId: '200245202', studentName: '孔梦婷', department: '计算机管理系', className: '520452', teacherName: '王惠', year: '2025', month: '3', createTime: '2025-04-08 14:14:07', evaluation: '表现优秀' },
  { id: 11, studentId: '200245202', studentName: '孔梦婷', department: '计算机管理系', className: '520452', teacherName: '王惠', year: '2025', month: '4', createTime: '2025-04-08 14:14:19', evaluation: '表现良好' },
  { id: 12, studentId: '200245202', studentName: '孔梦婷', department: '计算机管理系', className: '520452', teacherName: '王惠', year: '2025', month: '5', createTime: '2025-05-01 23:16:06', evaluation: '表现优秀' },
  { id: 13, studentId: '200245202', studentName: '孔梦婷', department: '计算机管理系', className: '520452', teacherName: '王惠', year: '2025', month: '6', createTime: '2025-06-01 23:21:21', evaluation: '表现良好' }
]

// API配置
const apiConfig = {
  list: (params) => {
    let result = [...mockData]
    if (params.organization) {
      result = result.filter(item => item.department === params.organization)
    }
    if (params.studentName) {
      result = result.filter(item => item.studentName.includes(params.studentName))
    }
    if (params.className) {
      result = result.filter(item => item.className.includes(params.className))
    }
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    return Promise.resolve({
      code: 200,
      data: { list: result.slice(start, end), total: result.length }
    })
  }
}

// 搜索字段
const searchFields = [
   {
    prop: 'organization',
    label: '组织架构',
    type: 'organizational',
    span: 4
  },
  { prop: 'studentName', label: '学生姓名', type: 'input', placeholder: '请输入学生姓名', span: 4 },
  { prop: 'className', label: '班级', type: 'input', placeholder: '请输入班级', span: 4 },
  {
    prop: 'month',
    label: '月份',
    type: 'month',
    placeholder: '选择月份',
    span: 4
  },
]

// 表格列配置
const tableColumns = [
  { prop: 'studentId', label: '学号', minWidth: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', width: 100, align: 'center' },
  { prop: 'department', label: '系部', minWidth: 120, align: 'center' },
  { prop: 'className', label: '班级', width: 100, align: 'center' },
  { prop: 'teacherName', label: '班主任', width: 100, align: 'center' },
  { prop: 'year', label: '年份', width: 80, align: 'center' },
  { prop: 'month', label: '月份', width: 80, align: 'center' },
  { prop: 'createTime', label: '创建时间', minWidth: 160, align: 'center' }
]

// 表单字段（分组格式）
const formFields = [
  {
    fields: [
      {
        prop: 'studentId',
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
        prop: 'department',
        label: '系部',
        type: 'input',
        disabled: true
      },
      {
        prop: 'className',
        label: '班级',
        type: 'input',
        disabled: true
      },
        {
        prop: 'year',
        label: '年份',
        type: 'input',
        disabled: true
      },
      {
        prop: 'month',
        label: '月份',
        type: 'input',
        disabled: true
      },
      {
        prop: 'teacherName',
        label: '班主任',
        type: 'input',
        disabled: true
      },
      {
        prop: 'evaluation',
        label: '考评意见',
        type: 'textarea',
        rows: 4,
        disabled: true
      }
    ]
  },
]

// 表单校验规则
const formRules = {}

const handleSearch = (params) => console.log('搜索:', params)
const handleRefresh = () => crudRef.value?.refresh()

const handleView = (row) => {
  dialogTitle.value = '查看考评意见'
  dialogMode.value = 'view'
  Object.assign(formData, row)
  dialogVisible.value = true
}
const handleDelete = (row) => {
  //二次确认
  ElMessageBox.confirm('确定要删除此条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 实现删除逻辑
    mockData = mockData.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
    crudRef.value?.refresh()
  })
}
const handleDialogClose = () => {
  dialogVisible.value = false
}

const handleDialogConfirm = () => {
  dialogVisible.value = false
}
</script>

