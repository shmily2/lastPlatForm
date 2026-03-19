<template>
  <div class="internship-list-page" style="min-height: 500px">
    <div v-if="!crudRef" style="padding: 20px; text-align: center; color: red;">
      页面正在加载中...<br>
      {{ errorMessage }}
    </div>
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: true, edit: true, delete: false }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @view="handleView"
      @edit="handleEdit"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="success" link @click="handleEdit(row)">修改</el-button>
        <el-button v-if="!row.auditStatus || row.auditStatus === '待审核'" type="warning" link @click="handleAudit(row)">审批</el-button>
        <el-button v-if="row.auditStatus && row.auditStatus !== '待审核'" type="danger" link @click="handleRevoke(row)">撤销</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleDownloadTemplate">下载模板</el-button>
        <el-button @click="handleImport">导入</el-button>
      </template>
    </Crud>

    <!-- 查看/编辑对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :show-footer="!isView"
      :show-form="false"
      :form-data="formData"
      :view-mode="isView"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
      @confirm="handleSubmit"
    >
      <!-- 自定义对话框内容：标签页 -->
      <el-tabs v-model="activeTab" class="internship-tabs" @tab-click="handleTabClick">
        <el-tab-pane
          v-for="tab in formData.tabs"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        >
          <BaseForm
            :gutter="0"
            :model-value="formData"
            @update:model-value="formData = $event"
            :fields="allFields"
            :rules="formRules"
            label-width="120px"
            :show-buttons="false"
            :view-mode="isView"
            :disabled="isView"
          />
        </el-tab-pane>
      </el-tabs>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import BaseForm from '@/components/Form/index.vue'

// Mock API 配置
const apiConfig = {
  list: (params) => { 
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1
    const auditStatuses = ['审核通过-生效', '待审核', '审核中', '审核未通过']
    const mockAttachments = [
      { name: '实习协议.jpg', url: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
      { name: '三方协议.jpg', url: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
      { name: '保险单.jpg', url: 'https://cube.elemecdn.com/e/5d/4a8a17d117ddb0827a3d1cf2c6b0djpeg.jpeg' },
      { name: '体检表.jpg', url: 'https://cube.elemecdn.com/3/f7/2c3efea53c084bad6931a56d5158a48jpeg.jpeg' },
      { name: '承诺书.jpg', url: 'https://cube.elemecdn.com/4/e6/2c3ef0a3c7c9638a54940382568c9dpng.png' },
      { name: '介绍信.jpg', url: 'https://cube.elemecdn.com/5/d7/4a8a17d117ddb0827a3d1cf2c6b0djpeg.jpeg' },
      { name: '申请表.jpg', url: 'https://cube.elemecdn.com/6/f8/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
      { name: '证明.jpg', url: 'https://cube.elemecdn.com/7/c9/2c3ef0a3c7c9638a54940382568c9dpng.png' },
      { name: '其他.jpg', url: 'https://cube.elemecdn.com/8/d0/4a8a17d117ddb0827a3d1cf2c6b0djpeg.jpeg' }
    ]
    const data = Array.from({ length: pageSize }, (_, i) => ({
      id: (page - 1) * pageSize + i + 1,
      studentNo: '224102' + String(1000 + (page - 1) * pageSize + i).padStart(4, '0'),
      studentName: ['张三', '李四', '王五', '赵六', '孙七'][((page - 1) * pageSize + i) % 5],
      className: '护理2201',
      department: '南丁格尔护理学院',
      destination: '1',
      companyName: ['泰康仙林鼓楼医院有限公司', '东南大学附属中大医院', '南京鼓楼医院'][((page - 1) * pageSize + i) % 3],
      teacherName: ['刘老师', '陈老师', '杨老师'][((page - 1) * pageSize + i) % 3],
      startDate: '2026-03-16',
      endDate: '2026-12-13',
      submitTime: '2026-03-09 15:16:54',
      auditStatus: auditStatuses[i % auditStatuses.length],
      attachments: mockAttachments,
      // 动态生成标签页数据，每个tab对应不同的数据
      tabs: [
        { 
          name: 'current', 
          label: '实习详情2(审核通过-生效)', 
          status: '审核通过-生效',
          // 当前生效的详情数据
          data: {
            companyName: ['泰康仙林鼓楼医院有限公司', '东南大学附属中大医院', '南京鼓楼医院'][((page - 1) * pageSize + i) % 3],
            startDate: '2026-03-16',
            endDate: '2026-12-13',
            teacherName: ['刘老师', '陈老师', '杨老师'][((page - 1) * pageSize + i) % 3],
            department: '南丁格尔护理学院'
          }
        },
        { 
          name: 'history', 
          label: '实习详情1(审核通过-已变更)', 
          status: '审核通过-已变更',
          // 历史变更的详情数据
          data: {
            companyName: ['南京军区总医院', '南京市第一医院', '江苏省人民医院'][((page - 1) * pageSize + i) % 3],
            startDate: '2025-09-01',
            endDate: '2026-02-28',
            teacherName: ['张老师', '王老师', '李老师'][((page - 1) * pageSize + i) % 3],
            department: '临床医学院'
          }
        }
      ]
    }))
    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: 461
      }
    })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'organization',
    label: '组织架构',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '南丁格尔护理学院', value: 'nursing' },
      { label: '临床医学院', value: 'clinical' },
      { label: '康复医学院', value: 'rehabilitation' }
    ],
    span: 6
  },
  {
    prop: 'studentCompany',
    label: '学生姓名/企业姓名',
    type: 'input',
    placeholder: '请输入学生姓名或企业名称',
    span: 6
  },
  {
    prop: 'effective',
    label: '是否生效',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '是', value: '1' },
      { label: '否', value: '0' }
    ],
    span: 6
  },
  {
    prop: 'arrangeType',
    label: '安排方式',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '自主实习', value: 'self' },
      { label: '统一安排', value: 'unified' },
      { label: '校企合作', value: 'cooperation' }
    ],
    span: 6
  },
  {
    prop: 'matchMajor',
    label: '专业是否对口',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '是', value: '1' },
      { label: '否', value: '0' }
    ],
    span: 6
  },
  {
    prop: 'insured',
    label: '是否投保',
    type: 'select',
    options: [
      { label: '全部', value: 'all' },
      { label: '是', value: '1' },
      { label: '否', value: '0' }
    ],
    span: 6
  },
  {
    prop: 'status',
    label: '实习状态',
    type: 'select',
    options: [
      { label: '全部', value: 'all' },
      { label: '实习', value: '1' },
      { label: '参军', value: '2' },
      { label: '升学/升本', value: '3' },
      { label: '出国', value: '4' },
      { label: '长病假', value: '5' },
      { label: '实习结束', value: '6' }
    ],
    span: 6
  },
  {
    prop: 'archived',
    label: '状态待完善',
    type: 'select',
    options: [
      { label: '全部', value: 'all' },
      { label: '待完善', value: '1' },
      { label: '待审核', value: '2' },
      { label: '审核通过', value: '3' },
      { label: '审核拒绝', value: '3' }
    ],
    span: 6
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentNo', label: '学号', minWidth: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', minWidth: 100, align: 'center' },
  { prop: 'className', label: '所在班级', minWidth: 100, align: 'center' },
  { prop: 'department', label: '系部', minWidth: 120, align: 'center' },
  {
    prop: 'destination',
    label: '实习去向',
    width: 100,
    align: 'center',
    formatter: (value) => value === '1' ? '实习' : '其他'
  },
  { prop: 'companyName', label: '实习企业', minWidth: 180, align: 'center' },
  { prop: 'teacherName', label: '指导老师', minWidth: 100, align: 'center' },
  { prop: 'startDate', label: '开始时间', width: 150, align: 'center' },
  { prop: 'endDate', label: '结束时间', width: 150, align: 'center' },
  { prop: 'submitTime', label: '提交时间', minWidth: 150, align: 'center' },
  {
    prop: 'auditStatus',
    label: '审核状态',
    width: 120,
    align: 'center'
  }
]

// 表单字段配置
const formFields = [
  { prop: 'studentNo', label: '学号', type: 'input', span: 12 },
  { prop: 'studentName', label: '学生姓名', type: 'input', span: 12 },
  { prop: 'className', label: '所在班级', type: 'input', span: 12 },
  { prop: 'department', label: '系部', type: 'input', span: 12 },
  {
    prop: 'destination',
    label: '实习去向',
    type: 'select',
    span: 12,
    options: [
      { label: '实习', value: '1' },
      { label: '其他', value: '2' }
    ]
  },
  { prop: 'companyName', label: '实习企业', type: 'input', span: 12 },
  { prop: 'teacherName', label: '指导老师', type: 'input', span: 12 },
  { prop: 'startDate', label: '开始时间', type: 'date', span: 12 },
  { prop: 'endDate', label: '结束时间', type: 'date', span: 12 }
]

// 表单验证规则
const formRules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
  className: [{ required: true, message: '请输入所在班级', trigger: 'blur' }],
  department: [{ required: true, message: '请输入系部', trigger: 'blur' }],
  destination: [{ required: true, message: '请选择实习去向', trigger: 'change' }],
  companyName: [{ required: true, message: '请输入实习企业', trigger: 'blur' }],
  // 企业信息
  companyDept: [{ required: true, message: '请输入企业部门', trigger: 'blur' }],
  internPosition: [{ required: true, message: '请输入实习岗位', trigger: 'blur' }],
  companyContact: [{ required: true, message: '请输入企业联系人', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系人电话', trigger: 'blur' }],
  teacherName: [{ required: true, message: '请输入指导老师', trigger: 'blur' }],
  teacherPhone: [{ required: true, message: '请输入指导老师电话', trigger: 'blur' }],
  internSalary: [{ required: true, message: '请输入实习薪资', trigger: 'blur' }],
  workAddress: [{ required: true, message: '', trigger: 'blur' }],
  arrangeType: [{ required: true, message: '请选择安排方式', trigger: 'change' }],
  majorMatch: [{ required: true, message: '请选择专业对口情况', trigger: 'change' }],
  hasContract: [{ required: true, message: '请选择有无劳动合同', trigger: 'change' }],
  hasInsurance: [{ required: true, message: '请选择是否购买保险', trigger: 'change' }],
  hasProvidentFund: [{ required: true, message: '请选择有无公积金', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择实习开始时间', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择实习结束时间', trigger: 'change' }]
}

// 企业列表（带筛选功能）
const companyOptions = ref([
  { value: '泰康仙林鼓楼医院有限公司', label: '泰康仙林鼓楼医院有限公司', creditCode: '91320113MA1MHA5X0M', companyType: '有限责任公司（非自然人投资或控股的法人独资）' },
  { value: '南京鼓楼医院', label: '南京鼓楼医院', creditCode: '91320100MA1N5WJT5X', companyType: '公立医院' },
  { value: '南京市第一医院', label: '南京市第一医院', creditCode: '91320100MA1N5WJ123', companyType: '公立医院' },
  { value: '江苏省人民医院', label: '江苏省人民医院', creditCode: '91320000MA1N5WJ456', companyType: '公立医院' },
  { value: '南京医科大学第二附属医院', label: '南京医科大学第二附属医院', creditCode: '91320100MA1N5WJ789', companyType: '公立医院' }
])

// 所有表单字段（分组格式）
const allFields = [
  // 模块1：学生信息
  {
    title: '学生信息',
    fields: [
      { prop: 'studentName', label: '姓名', type: 'input', span: 8 },
      { prop: 'className', label: '班级', type: 'input', span: 8 },
      { prop: 'destinationText', label: '实习去向', type: 'input', span: 8 }
    ]
  },
  // 模块2：企业信息
  {
    title: '企业信息',
    fields: [
      { prop: 'companyName', label: '企业名称', type: 'select', span: 24, filterable: true, options: companyOptions, onChange: (val) => {
        const company = companyOptions.value.find(item => item.value === val)
        if (company) {
          formData.creditCode = company.creditCode
          formData.companyType = company.companyType
        } else {
          formData.creditCode = ''
          formData.companyType = ''
        }
      }},
      { prop: 'creditCode', label: '社会统一信用代码', type: 'input', span: 12, disabled: true },
      { prop: 'companyType', label: '企业性质', type: 'input', span: 12, disabled: true },
      { prop: 'companyDept', label: '企业部门', type: 'input', span: 12, placeholder: '企业部门', required: true },
      { prop: 'internPosition', label: '实习岗位', type: 'input', span: 12, placeholder: '实习岗位', required: true },
      { prop: 'companyContact', label: '企业联系人', type: 'input', span: 12, placeholder: '企业联系人', required: true },
      { prop: 'contactPhone', label: '联系人电话', type: 'input', span: 12, placeholder: '联系人电话', required: true },
      { prop: 'teacherName', label: '指导老师', type: 'input', span: 12, placeholder: '指导老师', required: true },
      { prop: 'teacherPhone', label: '指导老师电话', type: 'input', span: 12, placeholder: '指导老师电话', required: true },
      { prop: 'internSalary', label: '实习薪资', type: 'input', span: 24, placeholder: '实习薪资', required: true },
      { prop: 'workAddress', label: '实际上班地址', type: 'input', span: 24, placeholder: '请输入地址', required: true },
       { prop: 'arrangeType', label: '安排方式', type: 'radio', span: 24, required: true,
        options: [
          { label: '学校安排', value: '学校安排' },
          { label: '自主选择', value: '自主选择' },
          { label: '定向培养', value: '定向培养' }
        ]
      },
      { prop: 'majorMatch', label: '专业对口情况', type: 'radio', span: 12, required: true,
        options: [
          { label: '对口', value: '是' },
          { label: '不对口', value: '否' }
        ]
      },
      { prop: 'hasContract', label: '有无劳动合同', type: 'radio', span: 12, required: true,
        options: [
          { label: '有', value: '是' },
          { label: '没有', value: '否' }
        ]
      },
      { prop: 'hasInsurance', label: '是否购买保险', type: 'radio', span: 12, required: true,
        options: [
          { label: '有', value: '是' },
          { label: '没有', value: '否' }
        ]
      },
      { prop: 'hasProvidentFund', label: '有无公积金', type: 'radio', span: 12, required: true,
        options: [
          { label: '有', value: '是' },
          { label: '没有', value: '否' }
        ]
      },
      { prop: 'startDate', label: '实习开始时间', type: 'date', span: 12, required: true },
      { prop: 'endDate', label: '实习结束时间', type: 'date', span: 12, required: true }
    ]
  },
  // 模块3：资料附件
  {
    title: '资料附件',
    fields: [
      { prop: 'attachments', label: '协议/资料', type: 'upload', span: 24, limit: 9, accept: 'image/*', listType: 'picture-card', showPreview: true }
    ]
  }
]

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('查看实习申请')
const isView = ref(false)
const dialogRef = ref()
const activeTab = ref('current')

// 点击tab时更新对应的数据
const handleTabClick = (tab) => {
  const targetTabName = tab.props.name
  
  // 先保存当前 tab 的数据
  const currentTab = formData.tabs?.find(t => t.name === activeTab.value)
  if (currentTab) {
    // 保存表单中修改的字段到当前 tab
    currentTab.data = { ...formData }
  }
  
  // 切换到目标 tab
  const targetTab = formData.tabs?.find(t => t.name === targetTabName)
  if (targetTab?.data) {
    // 将目标 tab 的数据合并到 formData
    Object.assign(formData, targetTab.data)
  }
}

// 获取表单引用
const formRef = computed(() => dialogRef.value?.formRef)

// 字段值转换为中文显示
const getFieldLabel = (prop, value) => {
  if (!value && value !== 0) return '-'

  // 查找字段定义
  for (const group of allFields) {
    const field = group.fields.find(f => f.prop === prop)
    if (field && field.options) {
      // 处理 ref 对象或普通数组
      const options = field.options.value || field.options
      if (Array.isArray(options)) {
        const option = options.find(o => o.value === value)
        if (option) return option.label
      }
    }
  }

  // 实习去向
  if (prop === 'destination') {
    const map = { '1': '实习', '2': '就业', '3': '升学', '4': '创业' }
    return map[value] || value
  }

  return value
}

const formData = reactive({
  id: null,
  studentNo: '2241021001',
  studentName: '李妍辰',
  className: '护理2201',
  department: '',
  destination: '1',
  destinationText: '实习',
  companyName: '泰康仙林鼓楼医院有限公司',
  teacherName: '',
  startDate: '2026-03-16',
  endDate: '2026-12-13',
  // 企业信息
  creditCode: '91320113MA1MHA5X0M',
  companyType: '有限责任公司（非自然人投资或控股的法人独资）',
  companyDept: '',
  internPosition: '',
  companyContact: '',
  contactPhone: '',
  teacherPhone: '',
  internSalary: '',
  workAddress: '',
  // 实习安排与合规
  arrangeType: '学校安排',
  majorMatch: '是',
  hasContract: '否',
  hasInsurance: '否',
  hasProvidentFund: '否',
  // 资料附件 - 默认模拟图片数据
  attachments: [
    { name: '实习协议.jpg', url: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
    { name: '三方协议.jpg', url: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png' },
    { name: '保险单.jpg', url: 'https://cube.elemecdn.com/e/5d/4a8a17d117ddb0827a3d1cf2c6b0djpeg.jpeg' },
    { name: '体检表.jpg', url: 'https://cube.elemecdn.com/3/f7/2c3efea53c084bad6931a56d5158a48jpeg.jpeg' },
    { name: '承诺书.jpg', url: 'https://cube.elemecdn.com/4/e6/2c3ef0a3c7c9638a54940382568c9dpng.png' },
    { name: '介绍信.jpg', url: 'https://cube.elemecdn.com/5/d7/4a8a17d117ddb0827a3d1cf2c6b0djpeg.jpeg' },
    { name: '申请表.jpg', url: 'https://cube.elemecdn.com/6/f8/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' },
    { name: '证明.jpg', url: 'https://cube.elemecdn.com/7/c9/2c3ef0a3c7c9638a54940382568c9dpng.png' },
    { name: '其他.jpg', url: 'https://cube.elemecdn.com/8/d0/4a8a17d117ddb0827a3d1cf2c6b0djpeg.jpeg' }
  ],
  // 审核状态
  auditStatus: ''
})

// Crud 组件引用
const crudRef = ref()
const errorMessage = ref('')

// 监听 crudRef 变化
watch(crudRef, (newVal) => {
  console.log('crudRef 变化:', !!newVal)
}, { immediate: true })

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

// 下载模板
const handleDownloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

// 导入
const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

// 文件变化处理
const handleFileChange = (file, files) => {
  // 检查文件大小
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB')
    // 移除超大的文件
    const index = formData.attachments.findIndex(f => f.uid === file.uid)
    if (index > -1) {
      formData.attachments.splice(index, 1)
    }
    return
  }
  console.log('文件已添加:', file.name)
}

// 文件移除处理
const handleFileRemove = (file, files) => {
  console.log('文件已移除:', file.name)
}

// 文件预览处理
const handleFilePreview = (file) => {
  ElMessage.info('预览功能开发中: ' + file.name)
}

// 查看
const handleView = (row) => {
  // 深拷贝数据，避免互相干扰
  const rowData = JSON.parse(JSON.stringify(row))
  // 为每个 tab 创建独立的数据副本
  rowData.tabs = rowData.tabs?.map(tab => ({
    ...tab,
    data: { ...tab.data }
  })) || []
  
  Object.assign(formData, rowData)
  // 初始化第一个tab的数据
  activeTab.value = 'current'
  const firstTab = rowData.tabs?.[0]
  if (firstTab?.data) {
    Object.assign(formData, firstTab.data)
  }
  // 拼接审核状态到标题
  if (row.auditStatus) {
    dialogTitle.value = `查看实习申请`
  } else {
    dialogTitle.value = '查看实习申请'
  }
  isView.value = true
  dialogVisible.value = true
}

// 修改
const handleEdit = (row) => {
  dialogTitle.value = '编辑实习申请'
  isView.value = false
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 撤回
// 审批
const handleAudit = (row) => {
  ElMessageBox.confirm('确定要审批通过这条实习申请吗？', '审批确认', {
    confirmButtonText: '审批通过',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    row.auditStatus = '审核通过-生效'
    ElMessage.success('审批成功')
    crudRef.value?.refresh()
  }).catch(() => {})
}

// 撤销
const handleRevoke = (row) => {
  if (!row.auditStatus) {
    ElMessage.warning('该记录未经过审批，无法撤销')
    return
  }
  ElMessageBox.confirm('确定要撤销该实习申请的审批吗？', '撤销确认', {
    confirmButtonText: '确定撤销',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.auditStatus = ''
    ElMessage.success('撤销成功')
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

// 企业搜索
const handleCompanySearch = () => {
  if (!formData.companyName) {
    ElMessage.warning('请输入企业名称')
    return
  }
  // 模拟搜索结果赋值
  formData.creditCode = '91320113MA1MHA5X0M'
  formData.companyType = '有限责任公司（非自然人投资或控股的法人独资）'
  ElMessage.success('企业信息已填充')
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    ElMessage.success(formData.id ? '修改成功' : '新增成功')
    dialogVisible.value = false
  } catch (err) {
    console.log('验证失败', err)
  }
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.internship-tabs {
  padding: 0 10px;
}
.internship-tabs :deep(.el-tabs__item) {
  font-size: 14px;
}
.internship-tabs :deep(.el-tabs__item.is-active) {
  color: #409EFF;
  font-weight: bold;
}
</style>
