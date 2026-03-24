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
        <el-button type="primary" @click="handleAdd">添加实习总结</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
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
const currentRow = ref(null)

// 模拟数据
const mockData = [
  { id: 1, className: '520112', teacherId: '11516', teacherName: '童瑞', title: '520112实习总结', summaryTime: '2025-03-15', createTime: '2025-03-20 10:30:00' },
  { id: 2, className: '520331', teacherId: '13306', teacherName: '张徐', title: '520331实习总结下', summaryTime: '2025-03-10', createTime: '2025-03-18 14:20:00' },
  { id: 3, className: '520331', teacherId: '13306', teacherName: '张徐', title: '520331实习总结上', summaryTime: '2025-03-05', createTime: '2025-03-15 09:15:00' },
  { id: 4, className: '520341', teacherId: '13211', teacherName: '郑莎莎', title: '实习管理工作总结', summaryTime: '2024-07-15', createTime: '2024-07-20 16:45:00' },
  { id: 5, className: '520332', teacherId: '13311', teacherName: '吴忠', title: '实习总结报告', summaryTime: '2024-07-10', createTime: '2024-07-15 11:00:00' },
  { id: 6, className: '520322', teacherId: '13110', teacherName: '刘璇', title: '班级实习总结', summaryTime: '2024-10-15', createTime: '2024-10-20 10:00:00' },
  { id: 7, className: '519461', teacherId: '15110', teacherName: '许园园', title: '2023-2024第一学期实习工作总结', summaryTime: '2024-01-10', createTime: '2024-01-15 14:30:00' },
  { id: 8, className: '519421', teacherId: '15407', teacherName: '胡贵雅', title: '第一学期实习管理总结', summaryTime: '2024-01-05', createTime: '2024-01-10 09:00:00' }
]

// 搜索字段
const searchFields = [
  {
    prop: 'department',
    label: '组织架构',
    type: 'select',
    placeholder: '请选择组织架构',
    options: [
      { label: '信息工程系', value: '信息工程系' },
      { label: '机电工程系', value: '机电工程系' },
      { label: '经济管理系', value: '经济管理系' }
    ]
  },
  {
    prop: 'teacherInfo',
    label: '工号或姓名',
    type: 'input',
    placeholder: '请输入工号或姓名'
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'className', label: '班级名称', minWidth: 120, align: 'center' },
  { prop: 'teacherId', label: '教师工号', width: 100, align: 'center' },
  { prop: 'teacherName', label: '教师姓名', width: 100, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 280, align: 'left' },
  { prop: 'summaryTime', label: '总结时间', minWidth: 120, align: 'center' },
  { prop: 'createTime', label: '创建时间', minWidth: 160, align: 'center' }
]

// 表单字段（分组格式）
const formFields = [
  {
    fields: [
      {
        prop: 'className',
        label: '班级名称',
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
        prop: 'teacherId',
        label: '教师工号',
        type: 'input',
        placeholder: '请输入教师工号'
      },
      {
        prop: 'teacherName',
        label: '教师姓名',
        type: 'input',
        placeholder: '请输入教师姓名'
      },
      {
        prop: 'title',
        label: '标题',
        type: 'input',
        placeholder: '请输入标题'
      },
           {
        prop: 'summaryTime',
        label: '总结时间',
        type: 'date',
        placeholder: '选择日期'
      },
      {
        prop: 'content',
        label: '总结内容',
        type: 'textarea',
        rows: 4,
         span:24,
        placeholder: '请输入总结内容'
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'textarea',
        rows: 4,
        span:24,
        placeholder: '请输入备注'
      }
    ]
  },
]

// 表单校验规则
const formRules = {
  className: [{ required: true, message: '请选择班级', trigger: 'change' }],
  teacherId: [{ required: true, message: '请输入教师工号', trigger: 'blur' }],
  teacherName: [{ required: true, message: '请输入教师姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  summaryTime: [{ required: true, message: '请选择总结时间', trigger: 'change' }]
}

// 表单数据
const formData = reactive({
  className: '',
  teacherId: '',
  teacherName: '',
  title: '',
  summaryTime: '',
  content: '',
  remark: ''
})

// API配置
const apiConfig = {
  list: async (params) => {
    return {
      data: mockData,
      total: mockData.length
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

const handleSizeChange = (val) => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleCurrentChange = (val) => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

// 新增
const handleAdd = () => {
  isViewMode.value = false
  dialogTitle.value = '添加实习总结'
  Object.assign(formData, {
    className: '',
    teacherId: '',
    teacherName: '',
    title: '',
    summaryTime: '',
    content: '',
    remark: ''
  })
  currentRow.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isViewMode.value = false
  dialogTitle.value = '编辑实习总结'
  Object.assign(formData, { ...row })
  currentRow.value = row
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  isViewMode.value = true
  dialogTitle.value = '查看实习总结'
  Object.assign(formData, { ...row })
  currentRow.value = row
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条实习总结吗？', '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    if (crudRef.value) {
      crudRef.value.refresh()
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = () => {
  ElMessage.success(currentRow.value ? '修改成功' : '添加成功')
  dialogVisible.value = false
  crudRef.value?.refresh()
}
</script>
