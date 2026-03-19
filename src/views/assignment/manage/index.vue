<template>
  <div class="assignment-manage-page">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: false, edit: true, delete: true }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @edit="handleEdit"
      @delete="handleDelete"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">+ 新建实习批次</el-button>
      </template>
    </Crud>

    <!-- 新增/编辑对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      formLabelWidth="140px"
      :show-form="true"
      :form-fields="formFields"
      :form-rules="formRules"
      :form-data="formData"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
      @confirm="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1
    const data = Array.from({ length: pageSize }, (_, i) => ({
      id: (page - 1) * pageSize + i + 1,
      batchName: [
        '2023-2024学年度2019级第一批',
        '测试周报批次',
        '2022-2023学年度2018级第一批',
        '2019-2020学年度2016级第一批'
      ][((page - 1) * pageSize + i) % 4],
      batchNo: ['20230301', 'cszbpc', '20220301', '20200618'][((page - 1) * pageSize + i) % 4],
      academicYear: ['2023', '2020', '2022', '2020'][((page - 1) * pageSize + i) % 4],
      startDate: [
        '2023-03-01',
        '2022-09-01',
        '2022-03-01',
        '2020-06-01'
      ][((page - 1) * pageSize + i) % 4],
      endDate: [
        '2023-12-31',
        '2025-09-30',
        '2023-12-01',
        '2021-12-31'
      ][((page - 1) * pageSize + i) % 4],
      companyName: '',
      positionName: ''
    }))
    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: 4
      }
    })
  },
  add: (data) => {
    console.log('新增实习批次:', data)
    return Promise.resolve({ code: 200, message: '新增成功' })
  },
  update: (data) => {
    console.log('编辑实习批次:', data)
    return Promise.resolve({ code: 200, message: '编辑成功' })
  },
  delete: (id) => {
    console.log('删除实习批次:', id)
    return Promise.resolve({ code: 200, message: '删除成功' })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'academicYear',
    label: '选择学年',
    type: 'select',
    placeholder: '请选择学年',
    options: [
      { label: '全部', value: '' },
      { label: '2023', value: '2023' },
      { label: '2022', value: '2022' },
      { label: '2021', value: '2021' },
      { label: '2020', value: '2020' }
    ],
    span: 6
  },
  {
    prop: 'batchNoOrName',
    label: '批次号/批次名称',
    type: 'input',
    placeholder: '请输入批次号或批次名称',
    span: 6
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'batchName', label: '批次名称', minWidth: 180 },
  { prop: 'batchNo', label: '批次号', minWidth: 100 },
  { prop: 'academicYear', label: '学年', width: 80 },
  { prop: 'startDate', label: '开始时间', width: 120 },
  { prop: 'endDate', label: '结束时间', width: 120 },
  { prop: 'companyName', label: '单位名称', minWidth: 120 },
  { prop: 'positionName', label: '岗位名称', minWidth: 120 }
]

// 表单字段配置
const formFields = [
  {
    title: '批次信息',
    fields: [
      {
        prop: 'batchName',
        label: '批次名称',
        type: 'input',
        required: true,
        placeholder: '请输入批次名称',
        span: 24
      },
      {
        prop: 'batchNo',
        label: '批次号',
        type: 'input',
        required: true,
        placeholder: '请输入批次号',
        span: 12
      },
      {
        prop: 'academicYear',
        label: '学年',
        type: 'select',
        required: true,
        placeholder: '请选择学年',
        span: 12,
        options: [
          { label: '2023-2024', value: '2023' },
          { label: '2022-2023', value: '2022' },
          { label: '2021-2022', value: '2021' },
          { label: '2020-2021', value: '2020' }
        ]
      },
      {
        prop: 'internDateRange',
        label: '实习起止时间',
        type: 'daterange',
        required: true,
        placeholder: '请选择实习起止时间',
        span: 24
      },
      {
        prop: 'weeklyReportCount',
        label: '要求提交周报数',
        type: 'number',
        required: true,
        min: 0,
        placeholder: '请输入要求提交周报数',
        span: 12
      },
      {
        prop: 'monthlyReportCount',
        label: '要求提交月报数',
        type: 'number',
        required: true,
        min: 0,
        placeholder: '请输入要求提交月报数',
        span: 12
      },
      {
        prop: 'checkinCount',
        label: '要求打卡数',
        type: 'number',
        required: true,
        min: 0,
        placeholder: '请输入要求打卡数',
        span: 12
      },
      {
        prop: 'monthlyVisitCount',
        label: '每月要求巡防次数',
        type: 'number',
        required: true,
        min: 0,
        placeholder: '请输入每月要求巡防次数',
        span: 12
      },
      {
        prop: 'guideTeacher',
        label: '指导老师',
        type: 'input',
        placeholder: '请输入指导老师',
        span: 12
      },
      {
        prop: 'teacherPhone',
        label: '指导老师电话',
        type: 'input',
        placeholder: '请输入指导老师电话',
        span: 12
      },
      {
        prop: 'batchRemark',
        label: '批次说明',
        type: 'textarea',
        placeholder: '请输入批次说明',
        rows: 3,
        span: 24
      }
    ]
  }
]

// 表单验证规则
const formRules = {
  batchName: [
    { required: true, message: '请输入批次名称', trigger: 'blur' }
  ],
  batchNo: [
    { required: true, message: '请输入批次号', trigger: 'blur' }
  ],
  academicYear: [
    { required: true, message: '请选择学年', trigger: 'change' }
  ],
  internDateRange: [
    { required: true, message: '请选择实习起止时间', trigger: 'change' }
  ],
  weeklyReportCount: [
    { required: true, message: '请输入要求提交周报数', trigger: 'blur' }
  ],
  monthlyReportCount: [
    { required: true, message: '请输入要求提交月报数', trigger: 'blur' }
  ],
  checkinCount: [
    { required: true, message: '请输入要求打卡数', trigger: 'blur' }
  ],
  monthlyVisitCount: [
    { required: true, message: '请输入每月要求巡防次数', trigger: 'blur' }
  ]
}

// Crud 组件引用
const crudRef = ref()
const dialogRef = ref()

// 获取表单引用
const formRef = computed(() => dialogRef.value?.formRef)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增实习批次')

// 表单数据
const formData = reactive({
  id: null,
  batchName: '',
  batchNo: '',
  academicYear: '',
  internDateRange: [],
  weeklyReportCount: null,
  monthlyReportCount: null,
  checkinCount: null,
  monthlyVisitCount: null,
  guideTeacher: '',
  teacherPhone: '',
  batchRemark: ''
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
  ElMessage.success('导出成功')
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新建实习批次'
  Object.assign(formData, {
    id: null,
    batchName: '',
    batchNo: '',
    academicYear: '',
    internDateRange: [],
    weeklyReportCount: null,
    monthlyReportCount: null,
    checkinCount: null,
    monthlyVisitCount: null,
    guideTeacher: '',
    teacherPhone: '',
    batchRemark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑实习批次'
  // 将 startDate/endDate 转换为日期范围格式
  const editData = { ...row }
  if (editData.startDate && editData.endDate) {
    editData.internDateRange = [editData.startDate, editData.endDate]
  } else {
    editData.internDateRange = []
  }
  Object.assign(formData, editData)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除批次"${row.batchName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await apiConfig.delete(row.id)
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

// 提交表单 - 自行验证
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    // 处理日期范围，转换为开始和结束日期
    const submitData = { ...formData }
    if (submitData.internDateRange && submitData.internDateRange.length === 2) {
      submitData.startDate = submitData.internDateRange[0]
      submitData.endDate = submitData.internDateRange[1]
    }
    delete submitData.internDateRange
    if (submitData.id) {
      await apiConfig.update(submitData)
      ElMessage.success('修改成功')
    } else {
      await apiConfig.add(submitData)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    crudRef.value?.refresh()
  } catch (error) {
    console.log('验证失败', error)
  }
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.assignment-manage-page {
  min-height: 500px;
}
</style>
