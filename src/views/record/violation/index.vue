<template>
  <div class="page-container" style="min-height: 500px">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: true, edit: true, delete: true }"
      :actions="{ add: false, batchDelete: false, export: false, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">添加</el-button>
      </template>
    </Crud>

    <!-- 对话框 - 使用Dialog内置表单 -->
    <Dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :show-form="true"
      :view-mode="isViewMode"
      :form-data="formData"
      :form-fields="formFields"
      :form-rules="formRules"
      :form-label-width="formLabelWidth"

      @confirm="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

// 模拟数据
const mockData = [
  { id: 1, studentNo: '2021001', studentName: '张三', teacher: '李老师', company: '腾讯科技', incidentDate: '2024-01-15', description: '迟到早退', creator: '管理员', createTime: '2024-01-15 10:30:00' },
  { id: 2, studentNo: '2021002', studentName: '李四', teacher: '王老师', company: '阿里巴巴', incidentDate: '2024-01-12', description: '未按时提交周报', creator: '管理员', createTime: '2024-01-12 14:20:00' },
  { id: 3, studentNo: '2021003', studentName: '王五', teacher: '张老师', company: '字节跳动', incidentDate: '2024-01-10', description: '旷工一天', creator: '管理员', createTime: '2024-01-10 09:15:00' },
  { id: 4, studentNo: '2021004', studentName: '赵六', teacher: '刘老师', company: '百度', incidentDate: '2024-01-08', description: '工作态度不端正', creator: '管理员', createTime: '2024-01-08 16:45:00' },
  { id: 5, studentNo: '2021005', studentName: '孙七', teacher: '陈老师', company: '美团', incidentDate: '2024-01-05', description: '违反公司规定', creator: '管理员', createTime: '2024-01-05 11:00:00' }
]

// 搜索字段
const searchFields = [
 {
    prop: 'organization',
    label: '组织架构',
    type: 'organizational',
    span: 4
  },
  {
    prop: 'studentName',
    label: '学生姓名',
    type: 'input',
    placeholder: '请输入学生姓名',
    span:4
  }
]

// 表格列
const tableColumns = [
  { prop: 'studentNo', label: '学号', width: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', width: 100, align: 'center' },
  { prop: 'teacher', label: '就业老师', width: 100, align: 'center' },
  { prop: 'company', label: '实习单位', minWidth: 150 },
  { prop: 'incidentDate', label: '突发日期', width: 120, align: 'center' },
  { prop: 'description', label: '情况说明', minWidth: 200 },
  { prop: 'creator', label: '创建人', width: 100, align: 'center' },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
]

// API配置
const apiConfig = {
  list: (params) => {
    let result = [...mockData]
    if (params.studentName) {
      result = result.filter(item => item.studentName.includes(params.studentName))
    }
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    return {
      code: 200,
      data: {
        list: result.slice(start, end),
        total: result.length
      }
    }
  }
}

const crudRef = ref(null)

// 事件处理
const handleSearch = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleRefresh = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleSizeChange = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleCurrentChange = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加违规处理')
const isViewMode = ref(false)
const formLabelWidth = '100px'
const formData = reactive({
  studentNo: '',
  studentName: '',
  teacher: '',
  company: '',
  incidentDate: '',
  description: '',
  creator: ''
})

// 表单字段（分组格式）
const formFields = [
  {
    fields: [
      {
        prop: 'studentNo',
        label: '学号',
        type: 'input',
        placeholder: '请输入学号'
      },
      {
        prop: 'studentName',
        label: '学生姓名',
        type: 'input',
        placeholder: '请输入学生姓名'
      },
      {
        prop: 'teacher',
        label: '就业老师',
        type: 'input',
        placeholder: '请输入就业老师'
      },
      {
        prop: 'company',
        label: '实习单位',
        type: 'input',
        placeholder: '请输入实习单位'
      },
           {
        prop: 'incidentDate',
        label: '突发日期',
        type: 'date',
        placeholder: '选择日期'
      },
      {
        prop: 'description',
        label: '情况说明',
        type: 'textarea',
        rows: 4,
        span:24,
        placeholder: '请输入情况说明'
      }
    ]
  }
]

// 表单校验
const formRules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
  teacher: [{ required: true, message: '请输入就业老师', trigger: 'blur' }],
  company: [{ required: true, message: '请输入实习单位', trigger: 'blur' }],
  incidentDate: [{ required: true, message: '请选择突发日期', trigger: 'change' }],
  description: [{ required: true, message: '请输入情况说明', trigger: 'blur' }]
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '添加违规处理'
  Object.assign(formData, {
    studentNo: '',
    studentName: '',
    teacher: '',
    company: '',
    incidentDate: '',
    description: '',
    creator: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isViewMode.value = false
  dialogTitle.value = '编辑违规处理'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  isViewMode.value = true
  dialogTitle.value = '查看违规处理'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 删除
const handleDelete = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

// 提交
const handleSubmit = () => {
  dialogVisible.value = false
}
</script>

