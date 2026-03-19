<template>
  <div class="assignment-record-page">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: true, edit: true, delete: true }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50, 100]"
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
        <el-button type="primary" link @click="handleEdit(row)">实习分配</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>

      <!-- 自定义导出按钮 -->
      <template #extra-operations>
        <el-button @click="handleExport">导出实习记录</el-button>
      </template>
    </Crud>

    <!-- 查看弹框 -->
    <Dialog
      ref="viewDialogRef"
      v-model="viewDialogVisible"
      title="查看实习记录"
      width="900px"
      :show-footer="false"
      :show-form="true"
      :form-fields="viewFields"
      :form-data="formData"
      view-mode
      label-width="120px"
      @close="handleViewDialogClose"
    />

    <!-- 实习分配弹框 -->
    <Dialog
      ref="editDialogRef"
      v-model="editDialogVisible"
      title="实习分配"
      width="500px"
      :show-footer="true"
      :show-form="true"
      :form-fields="editFields"
      :form-rules="formRules"
      :form-data="formData"
      label-width="120px"
      @update:form-data="formData = $event"
      @close="handleEditDialogClose"
      @confirm="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

// 学生数据
const students = [
  { id: 1, studentNo: '224102131', name: '阮文欣', className: '护理2201' },
  { id: 2, studentNo: '224102141', name: '江焮漪', className: '护理2201' },
  { id: 3, studentNo: '224102121', name: '王佳璐', className: '护理2201' },
  { id: 4, studentNo: '224102151', name: '赵佳羽', className: '护理2201' },
  { id: 5, studentNo: '224102161', name: '李妍辰', className: '护理2201' },
  { id: 6, studentNo: '224102171', name: '梁雨露', className: '护理2201' },
  { id: 7, studentNo: '224102181', name: '林欣', className: '护理2201' },
  { id: 8, studentNo: '224102191', name: '李慧珍', className: '护理2201' },
  { id: 9, studentNo: '224102201', name: '何宇豪', className: '护理2201' },
  { id: 10, studentNo: '224102211', name: '谢雅', className: '护理2201' },
  { id: 11, studentNo: '224102221', name: '侯欣妍', className: '护理2201' },
  { id: 12, studentNo: '224102231', name: '张颖', className: '护理2201' },
  { id: 13, studentNo: '224102241', name: '邹慧欣', className: '护理2201' },
  { id: 14, studentNo: '224102251', name: '梁毅涵', className: '护理2201' },
  { id: 15, studentNo: '224102261', name: '刘瑜涵', className: '护理2201' },
  { id: 16, studentNo: '224102271', name: '张欣乐', className: '护理2201' },
  { id: 17, studentNo: '224102281', name: '朱欣妍', className: '护理2201' }
]

// 医院数据
const hospitals = [
  { label: '南京市浦口医院', value: '南京市浦口医院' },
  { label: '南京市中西医结合医院', value: '南京市中西医结合医院' },
  { label: '东南大学附属中大医院', value: '东南大学附属中大医院' },
  { label: '江苏省中西医结合医院', value: '江苏省中西医结合医院' },
  { label: '泰康仙林鼓楼医院有限公司', value: '泰康仙林鼓楼医院有限公司' },
  { label: '市妇幼丁家庄院区', value: '市妇幼丁家庄院区' },
  { label: '南京明基医院有限公司', value: '南京明基医院有限公司' },
  { label: '中国人民解放军东部战区总医院', value: '中国人民解放军东部战区总医院' },
  { label: '江苏省省级机关医院', value: '江苏省省级机关医院' },
  { label: '南京市六合区中医院', value: '南京市六合区中医院' },
  { label: '南京市中医院', value: '南京市中医院' }
]

// 职位数据
const positions = [
  { label: '护士', value: '护士' },
  { label: '护理员', value: '护理员' },
  { label: '康复治疗师', value: '康复治疗师' },
  { label: '影像技师', value: '影像技师' },
  { label: '检验技师', value: '检验技师' },
  { label: '药剂师', value: '药剂师' },
  { label: '医生助理', value: '医生助理' }
]

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 50
    const page = params.page || 1

    // 生成模拟数据
    const data = Array.from({ length: pageSize }, (_, i) => {
      const student = students[((page - 1) * pageSize + i) % students.length]
      const hospital = hospitals[((page - 1) * pageSize + i) % hospitals.length]
      return {
        id: (page - 1) * pageSize + i + 1,
        studentNo: student.studentNo,
        name: student.name,
        internshipDirection: '实习',
        destinationText: '实习',
        className: student.className,
        hospitalName: hospital.label,
        companyName: hospital.label,
        creditCode: '913201' + String(100000 + i).padStart(6, '0'),
        companyType: '公立医院',
        companyDept: '护理部',
        internPosition: '护士',
        companyContact: '张主任',
        contactPhone: '138' + String(10000000 + i).padStart(8, '0'),
        teacherName: '王老师',
        teacherPhone: '139' + String(10000000 + i).padStart(8, '0'),
        internSalary: '2000-3000元/月',
        workAddress: hospital.label + '护理部',
        arrangeType: '学校安排',
        majorMatch: '对口',
        hasContract: '有',
        hasInsurance: '有',
        hasProvidentFund: '没有',
        startDate: '2026-03-01',
        endDate: '2026-12-31',
        position: '护士',
        contact: '张主任',
        attachments: [
          { name: '实习协议.jpg', url: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
          { name: '三方协议.jpg', url: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' }
        ]
      }
    })

    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: 435
      }
    })
  },
  add: (data) => {
    console.log('新增实习记录:', data)
    return Promise.resolve({ code: 200, message: '新增成功' })
  },
  update: (data) => {
    console.log('实习分配实习记录:', data)
    return Promise.resolve({ code: 200, message: '实习分配成功' })
  },
  delete: (id) => {
    console.log('删除实习记录:', id)
    return Promise.resolve({ code: 200, message: '删除成功' })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'internshipType',
    label: '请选择组织架构',
    type: 'select',
    placeholder: '请选择组织架构',
    options: [
      { label: '全部', value: '' },
      { label: '毕业实习', value: 'graduation' },
      { label: '见习实习', value: 'probation' },
      { label: '实习中', value: 'internship' }
    ],
    span: 5
  },
  {
    prop: 'internshipDirection',
    label: '实习去向',
    type: 'select',
    placeholder: '请选择实习去向',
    options: [
      { label: '全部', value: '' },
      { label: '实习', value: 'internship' },
      { label: '就业', value: 'employment' },
      { label: '升学', value: 'further' }
    ],
    span: 5
  },
  {
    prop: 'hospitalName',
    label: '选择医院',
    type: 'select',
    placeholder: '请选择医院',
    options: hospitals.map(h => ({ label: h, value: h })),
    span: 5
  },
  {
    prop: 'keyword',
    label: '姓名/学号',
    type: 'input',
    placeholder: '请输入姓名或学号',
    span: 5
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentNo', label: '学号', minWidth: 110 },
  { prop: 'name', label: '姓名', minWidth: 90 },
  { prop: 'internshipDirection', label: '实习去向', width: 90 },
  { prop: 'className', label: '班级', minWidth: 110 },
  { prop: 'hospitalName', label: '医院名称', minWidth: 200 },
  { prop: 'position', label: '岗位', minWidth: 120 },
  { prop: 'contact', label: '单位联系人', minWidth: 120 }
]

// 查看弹框字段（与 /internship/list 一样）
const viewFields = [
  // 模块1：学生信息
  {
    title: '学生信息',
    fields: [
      { prop: 'studentNo', label: '学号', type: 'input', span: 8 },
      { prop: 'name', label: '姓名', type: 'input', span: 8 },
      { prop: 'className', label: '班级', type: 'input', span: 8 },
      { prop: 'destinationText', label: '实习去向', type: 'input', span: 8 }
    ]
  },
  // 模块2：企业信息
  {
    title: '企业信息',
    fields: [
      { prop: 'companyName', label: '企业名称', type: 'input', span: 24 },
      { prop: 'creditCode', label: '社会统一信用代码', type: 'input', span: 12 },
      { prop: 'companyType', label: '企业性质', type: 'input', span: 12 },
      { prop: 'companyDept', label: '企业部门', type: 'input', span: 12 },
      { prop: 'internPosition', label: '实习岗位', type: 'input', span: 12 },
      { prop: 'companyContact', label: '企业联系人', type: 'input', span: 12 },
      { prop: 'contactPhone', label: '联系人电话', type: 'input', span: 12 },
      { prop: 'teacherName', label: '指导老师', type: 'input', span: 12 },
      { prop: 'teacherPhone', label: '指导老师电话', type: 'input', span: 12 },
      { prop: 'internSalary', label: '实习薪资', type: 'input', span: 12 },
      { prop: 'workAddress', label: '实际上班地址', type: 'input', span: 12 },
      { prop: 'arrangeType', label: '安排方式', type: 'input', span: 12 },
      { prop: 'majorMatch', label: '专业对口情况', type: 'input', span: 12 },
      { prop: 'hasContract', label: '有无劳动合同', type: 'input', span: 12 },
      { prop: 'hasInsurance', label: '是否购买保险', type: 'input', span: 12 },
      { prop: 'hasProvidentFund', label: '有无公积金', type: 'input', span: 12 },
      { prop: 'startDate', label: '实习开始时间', type: 'date', span: 12 },
      { prop: 'endDate', label: '实习结束时间', type: 'date', span: 12 }
    ]
  },
  // 模块3：资料附件
  {
    title: '资料附件',
    fields: [
      { prop: 'attachments', label: '协议/资料', type: 'upload', span: 24 }
    ]
  }
]

// 实习分配弹框字段
const editFields = [
  {
    title: '分配信息',
    fields: [
      { prop: 'hospitalName', label: '实习医院', type: 'select', span: 24, required: true, filterable: true, placeholder: '请选择实习医院', options: hospitals },
      { prop: 'internDateRange', label: '实习起止时间', type: 'daterange', span: 24, required: true, placeholder: '请选择实习起止时间' },
      { prop: 'position', label: '职位', type: 'select', span: 24, placeholder: '请选择职位', options: positions },
      { prop: 'internPosition', label: '实习岗位', type: 'input', span: 24, placeholder: '请输入实习岗位' },
    ]
  }
]

// 表单验证规则
const formRules = {
  hospitalName: [
    { required: true, message: '请选择实习医院', trigger: 'change' }
  ],
  internDateRange: [
    { required: true, message: '请选择实习起止时间', trigger: 'change' }
  ]
}

// Crud 组件引用
const crudRef = ref()
const viewDialogRef = ref()
const editDialogRef = ref()

// 获取表单引用
const formRef = computed(() => editDialogRef.value?.formRef)

// 对话框
const viewDialogVisible = ref(false)
const editDialogVisible = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  studentNo: '',
  name: '',
  internshipDirection: '',
  className: '',
  destinationText: '',
  // 实习分配字段
  hospitalName: '',
  position: '',
  internDateRange: [],
  // 企业信息字段（查看时使用）
  companyName: '',
  creditCode: '',
  companyType: '',
  companyDept: '',
  internPosition: '',
  companyContact: '',
  contactPhone: '',
  teacherName: '',
  teacherPhone: '',
  internSalary: '',
  workAddress: '',
  arrangeType: '',
  majorMatch: '',
  hasContract: '',
  hasInsurance: '',
  hasProvidentFund: '',
  startDate: '',
  endDate: '',
  attachments: []
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
  ElMessage.success('导出实习记录成功')
}

// 查看
const handleView = (row) => {
  Object.assign(formData, row)
  viewDialogVisible.value = true
}

// 编辑（实习分配）
const handleEdit = (row) => {
  // 将 startDate/endDate 转换为日期范围格式
  const editData = { ...row }
  if (editData.startDate && editData.endDate) {
    editData.internDateRange = [editData.startDate, editData.endDate]
  } else {
    editData.internDateRange = []
  }
  Object.assign(formData, editData)
  editDialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除学生"${row.name}"的实习记录吗？`, '提示', {
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
  try {
    await formRef.value?.validate()
    // 处理日期范围，转换为开始和结束日期
    const submitData = { ...formData }
    if (submitData.internDateRange && submitData.internDateRange.length === 2) {
      submitData.startDate = submitData.internDateRange[0]
      submitData.endDate = submitData.internDateRange[1]
    }
    delete submitData.internDateRange
    if (formData.id) {
      await apiConfig.update(submitData)
      ElMessage.success('实习分配成功')
    } else {
      await apiConfig.add(submitData)
      ElMessage.success('新增成功')
    }
    editDialogVisible.value = false
    crudRef.value?.refresh()
  } catch (error) {
    console.log('验证失败', error)
  }
}

// 关闭查看对话框
const handleViewDialogClose = () => {
  viewDialogVisible.value = false
}

// 关闭实习分配对话框
const handleEditDialogClose = () => {
  formRef.value?.clearValidate()
  editDialogVisible.value = false
}
</script>

<style scoped>
.assignment-record-page {
  min-height: 500px;
}
</style>
