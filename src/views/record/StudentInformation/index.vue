<template>
  <div class="page-container">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
    >
      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">添加学生访谈记录</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </Crud>

    <!-- 新增/编辑对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :show-form="true"
      :form-data="formData"
      :form-fields="formFields"
      :form-rules="formRules"
      form-label-width="100px"
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
const currentRow = ref(null)

// 模拟数据
const mockData = [
  {
    id: 1,
    studentId: '2021001',
    studentName: '张三',
    className: '20艺术1班',
    parentName: '李四',
    contactMethod: '电话',
    contactTime: '2025-03-20 14:30:00',
    creator: '王老师',
    createTime: '2025-03-20 14:35:00'
  },
  {
    id: 2,
    studentId: '2021002',
    studentName: '李小红',
    className: '20艺术1班',
    parentName: '李明',
    contactMethod: '微信',
    contactTime: '2025-03-21 09:15:00',
    creator: '王老师',
    createTime: '2025-03-21 09:20:00'
  },
  {
    id: 3,
    studentId: '2021003',
    studentName: '王五',
    className: '20会计2班',
    parentName: '王建国',
    contactMethod: '家访',
    contactTime: '2025-03-22 10:00:00',
    creator: '李老师',
    createTime: '2025-03-22 10:05:00'
  },
  {
    id: 4,
    studentId: '2021004',
    studentName: '赵六',
    className: '20会计2班',
    parentName: '赵丽',
    contactMethod: '电话',
    contactTime: '2025-03-23 15:20:00',
    creator: '李老师',
    createTime: '2025-03-23 15:25:00'
  },
  {
    id: 5,
    studentId: '2021005',
    studentName: '孙七',
    className: '20计算机3班',
    parentName: '孙伟',
    contactMethod: '微信',
    contactTime: '2025-03-24 11:10:00',
    creator: '张老师',
    createTime: '2025-03-24 11:15:00'
  }
]

// 搜索字段
const searchFields = [
  {
    prop: 'keyword',
    label: '学号或学生姓名',
    type: 'input',
    span: 4,
    placeholder: '请输入学号或学生姓名'
  },
  {
    prop: 'className',
    label: '班级名称',
    type: 'input',
    span: 4,
    placeholder: '请输入班级名称'
  },
  {
    prop: 'contactTimeRange',
    label: '访谈时间',
    type: 'daterange',
    span: 6,
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentId', label: '学号', width: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', width: 100, align: 'center' },
  { prop: 'className', label: '班级名称', minWidth: 120, align: 'center' },
  { prop: 'parentName', label: '家长姓名', width: 100, align: 'center' },
  { prop: 'contactMethod', label: '访谈方式', width: 100, align: 'center' },
  { prop: 'contactTime', label: '访谈时间', minWidth: 160, align: 'center' },
  { prop: 'creator', label: '创建人', width: 100, align: 'center' },
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
        placeholder: '请输入学号'
      },
      {
        prop: 'studentName',
        label: '学生姓名',
        type: 'input',
        placeholder: '请输入学生姓名'
      },
      {
        prop: 'className',
        label: '班级名称',
        type: 'select',
        placeholder: '请选择班级',
        options: [
          { label: '20艺术1班', value: '20艺术1班' },
          { label: '20会计2班', value: '20会计2班' },
          { label: '20计算机3班', value: '20计算机3班' },
          { label: '20护理4班', value: '20护理4班' }
        ]
      },
      {
        prop: 'parentName',
        label: '家长姓名',
        type: 'input',
        placeholder: '请输入家长姓名'
      },
      {
        prop: 'contactMethod',
        label: '访谈方式',
        type: 'select',
        placeholder: '请选择访谈方式',
        options: [
          { label: '电话', value: '电话' },
          { label: '微信', value: '微信' },
          { label: '家访', value: '家访' },
          { label: '面谈', value: '面谈' }
        ]
      },
      {
        prop: 'contactTime',
        label: '访谈时间',
        type: 'datetime',
        placeholder: '请选择访谈时间'
      },
      {
        prop: 'content',
        label: '访谈内容',
        type: 'textarea',
        rows: 4,
        span: 24,
        placeholder: '请输入访谈内容'
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'textarea',
        rows: 2,
        span: 24,
        placeholder: '请输入备注'
      }
    ]
  }
]

// 表单校验规则
const formRules = {
  studentId: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
  className: [{ required: true, message: '请选择班级', trigger: 'change' }],
  parentName: [{ required: true, message: '请输入家长姓名', trigger: 'blur' }],
  contactMethod: [{ required: true, message: '请选择访谈方式', trigger: 'change' }],
  contactTime: [{ required: true, message: '请选择访谈时间', trigger: 'change' }]
}

// 表单数据
const formData = reactive({
  studentId: '',
  studentName: '',
  className: '',
  parentName: '',
  contactMethod: '',
  contactTime: '',
  content: '',
  remark: ''
})

// API配置 - 使用模拟数据
const apiConfig = {
  list: (params) => {
    let result = [...mockData]
    // 搜索过滤
    if (params.keyword) {
      result = result.filter(item =>
        item.studentId.includes(params.keyword) ||
        item.studentName.includes(params.keyword)
      )
    }
    if (params.className) {
      result = result.filter(item => item.className.includes(params.className))
    }
    if (params.contactTimeRange && params.contactTimeRange.length === 2) {
      const [startDate, endDate] = params.contactTimeRange
      result = result.filter(item => {
        const contactTime = item.contactTime
        return contactTime >= startDate + ' 00:00:00' &&
               contactTime <= endDate + ' 23:59:59'
      })
    }
    // 分页
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

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
}

// 刷新
const handleRefresh = () => {
  console.log('刷新列表')
  crudRef.value?.refresh()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '添加学生访谈记录'
  currentRow.value = null
  Object.assign(formData, {
    studentId: '',
    studentName: '',
    className: '',
    parentName: '',
    contactMethod: '',
    contactTime: '',
    content: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑学生访谈记录'
  currentRow.value = row
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该学生访谈记录吗？', '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    crudRef.value?.refresh()
  }).catch(() => {})
}

// 提交表单
const handleSubmit = () => {
  ElMessage.success(currentRow.value ? '修改成功' : '添加成功')
  dialogVisible.value = false
  crudRef.value?.refresh()
}
</script>
