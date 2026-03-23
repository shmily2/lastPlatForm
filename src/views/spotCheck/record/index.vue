<template>
  <div class="check-record-page">
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
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </Crud>

    <!-- 编辑对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      title="编辑抽查记录"
      width="600px"
      :show-footer="true"
      :show-form="true"
      :form-fields="formFields"
      :form-data="formData"
      :form-rules="formRules"
      label-width="100px"
      @close="handleDialogClose"
      @confirm="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 50
    const page = params.page || 1

    const studentNames = ['许东旭', '李新成', '郑静文', '刘雪晴', '仲文静', '钱建宁', '戚明蕊', '姚菲', '陈瑶', '王于晨', '宋屿欣', '张小明', '王小红', '李小华', '赵小强']
    const checkers = ['高燕', '张老师', '李老师', '王老师']

    const data = Array.from({ length: pageSize }, (_, i) => {
      const index = (page - 1) * pageSize + i + 1
      return {
        id: index,
        studentNo: '21840' + String(7229 + i * 3).padStart(4, '0'),
        studentName: studentNames[i % studentNames.length],
        checkStatus: '已抽查',
        checker: checkers[i % checkers.length],
        checkTime: `2026-01-29 ${String(14 + Math.floor(i / 10)).padStart(2, '0')}:${String(28 + (i % 30)).padStart(2, '0')}:${String(20 + (i % 30)).padStart(2, '0')}`
      }
    })

    return Promise.resolve({
      data: {
        list: data,
        total: 1062
      }
    })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'keyword',
    label: '学号或姓名',
    type: 'input',
    placeholder: '学号或姓名',
    span: 6
  },
  {
    prop: 'status',
    label: '抽查状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '全部', value: '' },
      { label: '已抽查', value: '已抽查' },
      { label: '未抽查', value: '未抽查' }
    ],
    span: 4
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentNo', label: '学号', minWidth: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', minWidth: 100, align: 'center' },
  { prop: 'checkStatus', label: '抽查状态', width: 100, align: 'center',
    tag: (value) => value === '已抽查' ? 'success' : 'info'
  },
  { prop: 'checker', label: '抽查人', width: 100, align: 'center' },
  { prop: 'checkTime', label: '抽查时间', minWidth: 160, align: 'center' }
]

// 表单字段配置
const formFields = [
  { prop: 'studentNo', label: '学号', type: 'input', span: 24, disabled: true },
  { prop: 'studentName', label: '学生姓名', type: 'input', span: 24, disabled: true },
  { prop: 'checkStatus', label: '抽查状态', type: 'select', span: 24, required: true,
    options: [
      { label: '已抽查', value: '已抽查' },
      { label: '未抽查', value: '未抽查' }
    ]
  },
  { prop: 'checker', label: '抽查人', type: 'input', span: 24, required: true },
  { prop: 'checkTime', label: '抽查时间', type: 'datetime', span: 24, required: true }
]

// 表单验证规则
const formRules = {
  checkStatus: [{ required: true, message: '请选择抽查状态', trigger: 'change' }],
  checker: [{ required: true, message: '请输入抽查人', trigger: 'blur' }],
  checkTime: [{ required: true, message: '请选择抽查时间', trigger: 'change' }]
}

// Crud 组件引用
const crudRef = ref()
const dialogRef = ref()
const dialogVisible = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  studentNo: '',
  studentName: '',
  checkStatus: '',
  checker: '',
  checkTime: ''
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

// 编辑
const handleEdit = (row) => {
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除学号"${row.studentNo}"的抽查记录吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    crudRef.value?.refresh()
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  try {
    await dialogRef.value?.formRef?.validate()
    ElMessage.success('修改成功')
    dialogVisible.value = false
    crudRef.value?.refresh()
  } catch (err) {
    console.log('验证失败', err)
  }
}

// 关闭对话框
const handleDialogClose = () => {
  dialogRef.value?.formRef?.clearValidate()
}
</script>


