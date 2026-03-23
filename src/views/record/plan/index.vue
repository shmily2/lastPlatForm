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
        <el-button type="primary" @click="handleAdd">添加实习计划</el-button>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </Crud>

    <!-- 新增/编辑对话框 -->
    <Dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      @confirm="handleSubmit"
    >
      <Form
        ref="formRef"
        v-model="formData"
        :fields="formFields"
        :rules="formRules"
        label-width="100px"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import Form from '@/components/Form/index.vue'

const crudRef = ref(null)
const formRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentRow = ref(null)

// 模拟数据
const mockData = [
  { id: 1, className: '520112', teacherId: '11516', teacherName: '童瑞', title: '520112工作计划', planTime: '2025-03-02 00:00:00', createTime: '2025-10-31 12:32:49' },
  { id: 2, className: '520331', teacherId: '13306', teacherName: '张徐', title: '520331实习班主任工作计划下', planTime: '2025-10-31 00:00:00', createTime: '2025-10-31 09:37:43' },
  { id: 3, className: '520331', teacherId: '13306', teacherName: '张徐', title: '520331实习班主任工作计划上', planTime: '2025-10-31 00:00:00', createTime: '2025-10-31 09:36:55' },
  { id: 4, className: '520341', teacherId: '13211', teacherName: '郑莎莎', title: '实习管理工作计划', planTime: '2024-07-01 00:00:00', createTime: '2025-10-30 21:41:54' },
  { id: 5, className: '520332', teacherId: '13311', teacherName: '吴忠', title: '实习计划', planTime: '2025-10-30 00:00:00', createTime: '2025-10-30 18:28:45' },
  { id: 6, className: '520332', teacherId: '13311', teacherName: '吴忠', title: '实习管理工作计划', planTime: '2025-10-30 00:00:00', createTime: '2025-10-30 17:48:15' },
  { id: 7, className: '520322', teacherId: '13110', teacherName: '刘璇', title: '班级实习计划', planTime: '2024-10-01 00:00:00', createTime: '2025-07-01 10:43:27' },
  { id: 8, className: '519461', teacherId: '15110', teacherName: '许园园', title: '2023-2024第一学期实习班主任工作计划', planTime: '2023-09-14 00:00:00', createTime: '2023-09-14 10:36:59' },
  { id: 9, className: '519421', teacherId: '15407', teacherName: '胡贵雅', title: '第一学期实习管理计划', planTime: '2023-09-01 00:00:00', createTime: '2023-09-13 14:29:48' },
  { id: 10, className: '519461', teacherId: '15110', teacherName: '许园园', title: '实习工作计划', planTime: '2023-07-04 00:00:00', createTime: '2023-07-09 16:32:18' },
  { id: 11, className: '518453', teacherId: '20566', teacherName: '王继明', title: '518453工作计划', planTime: '2023-02-01 00:00:00', createTime: '2023-06-29 12:14:19' },
  { id: 12, className: '518461', teacherId: '15109', teacherName: '孙林碧', title: '2022-2023学年第二学期实习班主任工作计划', planTime: '2023-02-28 00:00:00', createTime: '2023-06-28 00:02:56' },
  { id: 13, className: '518421', teacherId: '15413', teacherName: '赵鹏明', title: '518421班实习班主任工作计划', planTime: '2022-07-01 00:00:00', createTime: '2023-06-26 19:12:13' },
  { id: 14, className: '518452', teacherId: '15307', teacherName: '黄晶晶', title: '518452班实习班主任工作计划2022-2023第二学期', planTime: '2023-02-04 00:00:00', createTime: '2023-06-26 08:10:25' },
  { id: 15, className: '518451', teacherId: '20525', teacherName: '胡兰', title: '五年级实习计划', planTime: '2023-01-01 00:00:00', createTime: '2023-06-08 12:25:58' },
  { id: 16, className: '518341', teacherId: '13212', teacherName: '岳文奇', title: '实习计划', planTime: '2023-06-07 00:00:00', createTime: '2023-06-07 11:56:28' },
  { id: 17, className: '519112', teacherId: '16313', teacherName: '王歌', title: '519112班实习工作计划', planTime: '2023-05-15 00:00:00', createTime: '2023-05-29 01:20:08' },
  { id: 18, className: '519112', teacherId: '11515', teacherName: '郭宇文', title: '519112班实习工作计划', planTime: '2023-05-15 00:00:00', createTime: '2023-05-29 01:20:08' }
]

// 搜索字段
const searchFields = [
  {
    prop: 'className',
    label: '班级名称',
    type: 'input',
    placeholder: '请输入班级名称'
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
  { prop: 'className', label: '班级名称', minWidth: 100, align: 'center' },
  { prop: 'teacherId', label: '教师工号', width: 100, align: 'center' },
  { prop: 'teacherName', label: '教师姓名', width: 100, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 280, align: 'left' },
  { prop: 'planTime', label: '计划时间', minWidth: 160, align: 'center' },
  { prop: 'createTime', label: '创建时间', minWidth: 160, align: 'center' }
]

// 表单字段
const formFields = [
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
    prop: 'planTime',
    label: '计划时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期'
  },
  {
    prop: 'content',
    label: '计划内容',
    type: 'textarea',
    rows: 4,
    placeholder: '请输入计划内容'
  },
  {
    prop: 'remark',
    label: '备注',
    type: 'textarea',
    rows: 2,
    placeholder: '请输入备注'
  }
]

// 表单校验规则
const formRules = {
  className: [{ required: true, message: '请选择班级', trigger: 'change' }],
  teacherId: [{ required: true, message: '请输入教师工号', trigger: 'blur' }],
  teacherName: [{ required: true, message: '请输入教师姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  planTime: [{ required: true, message: '请选择计划时间', trigger: 'change' }]
}

// 表单数据
const formData = reactive({
  className: '',
  teacherId: '',
  teacherName: '',
  title: '',
  planTime: [],
  content: '',
  remark: ''
})

// API配置 - 使用模拟数据
const apiConfig = {
  list: (params) => {
    let result = [...mockData]
    // 搜索过滤
    if (params.className) {
      result = result.filter(item => item.className.includes(params.className))
    }
    if (params.teacherInfo) {
      result = result.filter(item => 
        item.teacherId.includes(params.teacherInfo) || 
        item.teacherName.includes(params.teacherInfo)
      )
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
  dialogTitle.value = '添加实习计划'
  currentRow.value = null
  Object.assign(formData, {
    className: '',
    teacherId: '',
    teacherName: '',
    title: '',
    planTime: [],
    content: '',
    remark: ''
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑实习计划'
  currentRow.value = row
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该实习计划吗？', '删除确认', {
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
  const valid = await formRef.value?.validate()
  if (valid) {
    ElMessage.success(currentRow.value ? '修改成功' : '添加成功')
    dialogVisible.value = false
    crudRef.value?.refresh()
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
