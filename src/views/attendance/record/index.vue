<template>
  <div class="attendance-record-page">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :action-width="220"
      :action-min-width="200"
      :table-actions="{ view: true, edit: true, delete: true }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
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
    </Crud>

    <!-- 查看/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="handleDialogClose"
    >
      <BaseForm
        ref="formRef"
        v-model="formData"
        :fields="formFields"
        :rules="formRules"
        :disabled="dialogMode === 'view'"
        :show-buttons="false"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="dialogMode !== 'view'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import BaseForm from '@/components/Form/index.vue'

// 学生数据
const students = [
  { id: 1, studentNo: '224102131', name: '阮文欣', className: '护理2201', department: '护理系' },
  { id: 2, studentNo: '224102141', name: '江焮漪', className: '护理2201', department: '护理系' },
  { id: 3, studentNo: '224102121', name: '王佳璐', className: '护理2201', department: '护理系' },
  { id: 4, studentNo: '224102151', name: '赵佳羽', className: '护理2202', department: '护理系' },
  { id: 5, studentNo: '224102161', name: '李妍辰', className: '护理2202', department: '护理系' },
  { id: 6, studentNo: '224102171', name: '梁雨露', className: '护理2203', department: '护理系' },
  { id: 7, studentNo: '224102181', name: '林欣', className: '护理2203', department: '护理系' },
  { id: 8, studentNo: '224102191', name: '李慧珍', className: '护理2203', department: '护理系' }
]

// 班级数据
const classes = [
  '护理2201',
  '护理2202',
  '护理2203',
  '护理2204',
  '护理2205',
  '临床2201',
  '临床2202'
]

// 实习企业数据
const companies = [
  { name: '南京市浦口医院', address: '南京市浦口区浦园路18号' },
  { name: '南京市中西医结合医院', address: '南京市玄武区孝陵卫179号' },
  { name: '东南大学附属中大医院', address: '南京市鼓楼区丁家桥87号' },
  { name: '江苏省中西医结合医院', address: '南京市玄武区孝陵卫18号' },
  { name: '泰康仙林鼓楼医院有限公司', address: '南京市栖霞区仙林新村200号' },
  { name: '市妇幼丁家庄院区', address: '南京市栖霞区丁家庄' },
  { name: '南京明基医院有限公司', address: '南京市建邺区河西大街71号' },
  { name: '中国人民解放军东部战区总医院', address: '南京市玄武区中山东路305号' },
  { name: '江苏省省级机关医院', address: '南京市鼓楼区江苏路65号' },
  { name: '南京市六合区中医院', address: '南京市六合区雄州东路288号' },
  { name: '南京市中医院', address: '南京市秦淮区金陵路1号' }
]

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 20
    const page = params.page || 1

    // 模拟打卡数据
    const mockData = [
      {
        id: 1,
        studentNo: '224102131',
        studentName: '阮文欣',
        className: '护理2201',
        department: '护理系',
        companyName: '南京市浦口医院',
        companyAddress: '南京市浦口区浦园路18号',
        clockInAddress: '南京市浦口区浦园路18号A栋301室',
        clockInTime: '2025-03-10 08:25:30',
        status: 'normal'
      },
      {
        id: 2,
        studentNo: '224102141',
        studentName: '江焮漪',
        className: '护理2201',
        department: '护理系',
        companyName: '南京市中西医结合医院',
        companyAddress: '南京市玄武区孝陵卫179号',
        clockInAddress: '南京市玄武区孝陵卫179号门诊部',
        clockInTime: '2025-03-10 08:32:15',
        status: 'normal'
      },
      {
        id: 3,
        studentNo: '224102121',
        studentName: '王佳璐',
        className: '护理2201',
        department: '护理系',
        companyName: '东南大学附属中大医院',
        companyAddress: '南京市鼓楼区丁家桥87号',
        clockInAddress: '南京市鼓楼区丁家桥87号住院部',
        clockInTime: '2025-03-10 08:45:00',
        status: 'late'
      },
      {
        id: 4,
        studentNo: '224102151',
        studentName: '赵佳羽',
        className: '护理2202',
        department: '护理系',
        companyName: '江苏省中西医结合医院',
        companyAddress: '南京市玄武区孝陵卫18号',
        clockInAddress: '南京市玄武区孝陵卫18号急诊科',
        clockInTime: '2025-03-10 09:05:20',
        status: 'late'
      },
      {
        id: 5,
        studentNo: '224102161',
        studentName: '李妍辰',
        className: '护理2202',
        department: '护理系',
        companyName: '泰康仙林鼓楼医院有限公司',
        companyAddress: '南京市栖霞区仙林新村200号',
        clockInAddress: '南京市栖霞区仙林新村200号B区',
        clockInTime: '2025-03-10 08:15:45',
        status: 'normal'
      },
      {
        id: 6,
        studentNo: '224102171',
        studentName: '梁雨露',
        className: '护理2203',
        department: '护理系',
        companyName: '市妇幼丁家庄院区',
        companyAddress: '南京市栖霞区丁家庄',
        clockInAddress: '南京市栖霞区丁家庄住院楼',
        clockInTime: '2025-03-10 17:30:00',
        status: 'early'
      },
      {
        id: 7,
        studentNo: '224102181',
        studentName: '林欣',
        className: '护理2203',
        department: '护理系',
        companyName: '南京明基医院有限公司',
        companyAddress: '南京市建邺区河西大街71号',
        clockInAddress: '南京市建邺区河西大街71号门诊',
        clockInTime: '2025-03-10 08:00:00',
        status: 'normal'
      },
      {
        id: 8,
        studentNo: '224102191',
        studentName: '李慧珍',
        className: '护理2203',
        department: '护理系',
        companyName: '中国人民解放军东部战区总医院',
        companyAddress: '南京市玄武区中山东路305号',
        clockInAddress: '',
        clockInTime: '2025-03-10 08:00:00',
        status: 'absent'
      },
      {
        id: 9,
        studentNo: '224102201',
        studentName: '何宇豪',
        className: '护理2201',
        department: '护理系',
        companyName: '江苏省省级机关医院',
        companyAddress: '南京市鼓楼区江苏路65号',
        clockInAddress: '南京市鼓楼区江苏路65号病房',
        clockInTime: '2025-03-10 08:20:10',
        status: 'normal'
      },
      {
        id: 10,
        studentNo: '224102211',
        studentName: '谢雅',
        className: '护理2202',
        department: '护理系',
        companyName: '南京市六合区中医院',
        companyAddress: '南京市六合区雄州东路288号',
        clockInAddress: '南京市六合区雄州东路288号',
        clockInTime: '2025-03-10 08:35:50',
        status: 'normal'
      },
      {
        id: 11,
        studentNo: '224102221',
        studentName: '侯欣妍',
        className: '护理2204',
        department: '护理系',
        companyName: '南京市中医院',
        companyAddress: '南京市秦淮区金陵路1号',
        clockInAddress: '南京市秦淮区金陵路1号',
        clockInTime: '2025-03-10 08:40:20',
        status: 'normal'
      },
      {
        id: 12,
        studentNo: '224102231',
        studentName: '张颖',
        className: '护理2205',
        department: '护理系',
        companyName: '南京市浦口医院',
        companyAddress: '南京市浦口区浦园路18号',
        clockInAddress: '南京市浦口区浦园路18号',
        clockInTime: '2025-03-10 09:10:00',
        status: 'late'
      }
    ]

    // 分页处理
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = mockData.slice(start, end)

    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: mockData.length
      }
    })
  },
  update: (data) => {
    console.log('修改打卡记录:', data)
    return Promise.resolve({ code: 200, message: '修改成功' })
  },
  delete: (id) => {
    console.log('删除打卡记录:', id)
    return Promise.resolve({ code: 200, message: '删除成功' })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'className',
    label: '请选择班级/科室',
    type: 'select',
    placeholder: '请选择班级/科室',
    options: classes.map(c => ({ label: c, value: c })),
    span: 4
  },
  {
    prop: 'studentName',
    label: '学生姓名',
    type: 'select',
    placeholder: '请选择学生',
    options: students.map(s => ({ label: s.name, value: s.name })),
    span: 4
  },
  {
    prop: 'keyword',
    label: '请输入关键字',
    type: 'input',
    placeholder: '请输入关键字',
    span: 4
  },
  {
    prop: 'date',
    label: '打卡日期',
    type: 'date',
    placeholder: '选择打卡日期',
    span: 4
  },
  {
    prop: 'status',
    label: '打卡状态',
    type: 'select',
    placeholder: '全部',
    options: [
      { label: '全部', value: '' },
      { label: '正常', value: 'normal' },
      { label: '迟到', value: 'late' },
      { label: '早退', value: 'early' },
      { label: '缺卡', value: 'absent' }
    ],
    span: 4
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentNo', label: '学号', minWidth: 110 },
  { prop: 'studentName', label: '学生姓名', minWidth: 90 },
  { prop: 'className', label: '所在班级', minWidth: 110 },
  { prop: 'department', label: '系部', minWidth: 100 },
  { prop: 'companyName', label: '实习企业', minWidth: 180 },
  { prop: 'companyAddress', label: '企业地址', minWidth: 200 },
  { prop: 'clockInAddress', label: '打卡地址', minWidth: 200 },
  { prop: 'clockInTime', label: '打卡时间', width: 160 },
  {
    prop: 'status',
    label: '打卡状态',
    width: 90,
    tag: true,
    tagType: (value) => {
      const typeMap = {
        normal: 'success',
        late: 'warning',
        early: 'warning',
        absent: 'danger'
      }
      return typeMap[value] || ''
    },
    formatter: (value) => {
      const labelMap = {
        normal: '正常',
        late: '迟到',
        early: '早退',
        absent: '缺卡'
      }
      return labelMap[value] || '-'
    }
  }
]

// 表单字段配置
const formFields = [
  {
    prop: 'studentNo',
    label: '学号',
    type: 'input',
    required: true,
    placeholder: '请输入学号',
    disabled: true,
    span: 12
  },
  {
    prop: 'studentName',
    label: '学生姓名',
    type: 'input',
    required: true,
    placeholder: '请输入学生姓名',
    span: 12
  },
  {
    prop: 'className',
    label: '所在班级',
    type: 'select',
    required: true,
    placeholder: '请选择班级',
    span: 12,
    options: classes.map(c => ({ label: c, value: c }))
  },
  {
    prop: 'department',
    label: '系部',
    type: 'input',
    required: true,
    placeholder: '请输入系部',
    span: 12
  },
  {
    prop: 'companyName',
    label: '实习企业',
    type: 'select',
    required: true,
    placeholder: '请选择实习企业',
    span: 24,
    options: companies.map(c => ({ label: c.name, value: c.name }))
  },
  {
    prop: 'companyAddress',
    label: '企业地址',
    type: 'input',
    placeholder: '请输入企业地址',
    disabled: true,
    span: 24
  },
  {
    prop: 'clockInAddress',
    label: '打卡地址',
    type: 'input',
    required: true,
    placeholder: '请输入打卡地址',
    span: 12
  },
  {
    prop: 'clockInTime',
    label: '打卡时间',
    type: 'datetime',
    required: true,
    placeholder: '请选择打卡时间',
    span: 12
  },
  {
    prop: 'status',
    label: '打卡状态',
    type: 'select',
    required: true,
    placeholder: '请选择打卡状态',
    span: 12,
    options: [
      { label: '正常', value: 'normal' },
      { label: '迟到', value: 'late' },
      { label: '早退', value: 'early' },
      { label: '缺卡', value: 'absent' }
    ]
  }
]

// 表单验证规则
const formRules = {
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  studentName: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  className: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请输入系部', trigger: 'blur' }
  ],
  companyName: [
    { required: true, message: '请选择实习企业', trigger: 'change' }
  ],
  clockInAddress: [
    { required: true, message: '请输入打卡地址', trigger: 'blur' }
  ],
  clockInTime: [
    { required: true, message: '请选择打卡时间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择打卡状态', trigger: 'change' }
  ]
}

// Crud 组件引用
const crudRef = ref()
const formRef = ref()

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('查看打卡记录')
const dialogMode = ref('view')

// 表单数据
const formData = reactive({
  id: null,
  studentNo: '',
  studentName: '',
  className: '',
  department: '',
  companyName: '',
  companyAddress: '',
  clockInAddress: '',
  clockInTime: '',
  status: 'normal'
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
  ElMessage.success('导出打卡记录成功')
}

// 查看
const handleView = (row) => {
  dialogMode.value = 'view'
  dialogTitle.value = '查看打卡记录'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑打卡记录'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除学生"${row.studentName}"的打卡记录吗？`, '提示', {
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

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    await apiConfig.update(formData)
    ElMessage.success('修改成功')
    dialogVisible.value = false
    crudRef.value?.refresh()
  }
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.attendance-record-page {
  min-height: 500px;
}
</style>
