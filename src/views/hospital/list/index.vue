<template>
  <div class="hospital-list-page" style="min-height: 500px">
    <div v-if="!crudRef" style="padding: 20px; text-align: center; color: red;">
      页面正在加载中...
    </div>
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @view="handleView"
      @edit="handleEdit"
      @add="handleAdd"
      @delete="handleDelete"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleInternStudents(row)">实习学生</el-button>
        <el-button type="success" link @click="handleEdit(row)">修改</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">新增企业</el-button>
        <el-button type="warning" @click="handleExportDuplicate">重复企业导出</el-button>
        <el-button type="success" @click="handleBatchExport">批量导出数据</el-button>
        <el-button @click="handleImport">导入</el-button>
        <el-button @click="handleExportData">导出</el-button>
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
      <BaseForm
        :gutter="20"
        :model-value="formData"
        @update:model-value="formData = $event"
        :fields="formFields"
        :rules="formRules"
        label-width="140px"
        :show-buttons="false"
        :view-mode="isView"
        :disabled="isView"
      />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import BaseForm from '@/components/Form/index.vue'

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1

    const companyTypes = ['个人独资企业', '有限责任公司(自然人投资或控股)', '股份有限公司', '合伙企业', '国有企业']
    const districts = ['南京市江宁区', '南京市鼓楼区', '南京市秦淮区', '南京市建邺区', '南京市玄武区', '南京市栖霞区', '南京市雨花台区', '南京市浦口区']
    const entryMethods = ['学生自选', '学校推荐', '企业直招', '校企合作']

    const data = [
      { id: 1, companyName: '南京正瑞霖供应链管理有限公司', orgCode: '91320118M...', contactPerson: '周小牛', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 2, companyName: '南京君宏电脑经营部', orgCode: '92320104M...', contactPerson: '陈光', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 3, companyName: '南京胜学教育科技有限公司', orgCode: '91320115M...', contactPerson: '夏非凡', contactPhone: '', internCount: 1, address: '南京市江宁区东...', companyType: '有限责任公司(自然人投资或控股)', district: '南京市江...', isPartner: '否', entryMethod: '学生自选' },
      { id: 4, companyName: '江宁区萍浩百货超市店', orgCode: '92320115M...', contactPerson: '陈俊', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 5, companyName: '南京运之都科技有限公司', orgCode: '91320104M...', contactPerson: '冯北斗', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 6, companyName: '南京东印来纸制品有限公司', orgCode: '91320104M...', contactPerson: '吴永彬', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 7, companyName: '日达智造科技(如皋)有限公司', orgCode: '91320682M...', contactPerson: '张宇光', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 8, companyName: '南京怡和安消防设备有限公司', orgCode: '91320113M...', contactPerson: '毛尧春', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 9, companyName: '南京乐均贸易有限公司', orgCode: '91320111M...', contactPerson: '丁大华', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 10, companyName: '南京万普物流有限公司', orgCode: '9132010677...', contactPerson: '汪习祥', contactPhone: '', internCount: 1, address: '南京市鼓楼区建...', companyType: '有限责任公司(自然人投资或控股)', district: '南京市鼓...', isPartner: '否', entryMethod: '学生自选' },
      { id: 11, companyName: '南京市江北新区孙家小馆餐饮店', orgCode: '92320191M...', contactPerson: '孙大梅', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 12, companyName: '南京亚豪汽车维修服务中心', orgCode: '92320104M...', contactPerson: '许先武', contactPhone: '', internCount: 2, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 13, companyName: '南京市雨花台区富察图文工作室', orgCode: '92320114M...', contactPerson: '严丽', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 14, companyName: '南通艾康丽生物科技有限公司', orgCode: '91320621M...', contactPerson: '蔡苏璐', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 15, companyName: '南京鼎辉市政工程有限公司', orgCode: '91320114M...', contactPerson: '徐林', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' },
      { id: 16, companyName: '南京市勇捷商贸有限公司', orgCode: '913201066M...', contactPerson: '杨勇', contactPhone: '', internCount: 1, address: '', companyType: '个人独资企业', district: '', isPartner: '否', entryMethod: '学生自选' }
    ]

    return Promise.resolve({
      data: {
        list: data,
        total: data.length
      }
    })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'companyName',
    label: '企业名称',
    type: 'input',
    placeholder: '企业名称',
    span: 5
  },
  {
    prop: 'isPartner',
    label: '是否合作企业',
    type: 'select',
    placeholder: '是否合作企业',
    options: [
      { label: '全部', value: '' },
      { label: '是', value: '是' },
      { label: '否', value: '否' }
    ],
    span: 4
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '未毕业',
    options: [
      { label: '全部', value: '' },
      { label: '未毕业', value: '未毕业' },
      { label: '已毕业', value: '已毕业' }
    ],
    span: 3
  },
  {
    prop: 'year',
    label: '年份',
    type: 'select',
    placeholder: '2026',
    options: [
      { label: '2026', value: '2026' },
      { label: '2025', value: '2025' },
      { label: '2024', value: '2024' }
    ],
    span: 3
  },
  {
    prop: 'entryYear',
    label: '企业入驻年份',
    type: 'input',
    placeholder: '企业入驻年份',
    span: 5
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'companyName', label: '企业名称', minWidth: 220, align: 'left' },
  { prop: 'orgCode', label: '组织代码', minWidth: 120, align: 'center' },
  { prop: 'contactPerson', label: '企业负责人', width: 100, align: 'center' },
  { prop: 'contactPhone', label: '联系电话', width: 120, align: 'center' },
  { prop: 'internCount', label: '实习人数', width: 80, align: 'center' },
  { prop: 'address', label: '企业地址', minWidth: 150, align: 'center' },
  { prop: 'companyType', label: '企业性质', minWidth: 180, align: 'center' },
  { prop: 'district', label: '地区', width: 100, align: 'center' },
  { prop: 'isPartner', label: '是否合作企业', width: 100, align: 'center' },
  { prop: 'entryMethod', label: '进校方式', width: 100, align: 'center',
    tag: (value) => {
      const tagMap = { '学生自选': 'info', '学校推荐': 'primary', '企业直招': 'success', '校企合作': 'warning' }
      return tagMap[value] || 'info'
    }
  }
]

// 表单字段配置
const formFields = [
  {
    title: '基本信息',
    fields: [
      { prop: 'companyName', label: '企业名称', type: 'input', span: 24, required: true },
      { prop: 'orgCode', label: '组织代码', type: 'input', span: 12, required: true },
      { prop: 'companyType', label: '企业性质', type: 'select', span: 12, required: true,
        options: [
          { label: '个人独资企业', value: '个人独资企业' },
          { label: '有限责任公司(自然人投资或控股)', value: '有限责任公司(自然人投资或控股)' },
          { label: '股份有限公司', value: '股份有限公司' },
          { label: '合伙企业', value: '合伙企业' },
          { label: '国有企业', value: '国有企业' }
        ]
      },
      { prop: 'contactPerson', label: '企业负责人', type: 'input', span: 12, required: true },
      { prop: 'contactPhone', label: '联系电话', type: 'input', span: 12, required: true },
      { prop: 'address', label: '企业地址', type: 'input', span: 24, required: true }
    ]
  },
  {
    title: '其他信息',
    fields: [
      { prop: 'district', label: '地区', type: 'input', span: 12 },
      { prop: 'isPartner', label: '是否合作企业', type: 'radio', span: 12,
        options: [
          { label: '是', value: '是' },
          { label: '否', value: '否' }
        ]
      },
      { prop: 'entryMethod', label: '进校方式', type: 'select', span: 12,
        options: [
          { label: '学生自选', value: '学生自选' },
          { label: '学校推荐', value: '学校推荐' },
          { label: '企业直招', value: '企业直招' },
          { label: '校企合作', value: '校企合作' }
        ]
      },
      { prop: 'internCount', label: '实习人数', type: 'number', span: 12 }
    ]
  }
]

// 表单验证规则
const formRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  orgCode: [{ required: true, message: '请输入组织代码', trigger: 'blur' }],
  companyType: [{ required: true, message: '请选择企业性质', trigger: 'change' }],
  contactPerson: [{ required: true, message: '请输入企业负责人', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入企业地址', trigger: 'blur' }]
}

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('查看企业信息')
const isView = ref(false)
const dialogRef = ref()

// 表单数据
const formData = reactive({
  id: null,
  companyName: '',
  orgCode: '',
  companyType: '',
  contactPerson: '',
  contactPhone: '',
  internCount: 0,
  address: '',
  district: '',
  isPartner: '否',
  entryMethod: '学生自选'
})

// Crud 组件引用
const crudRef = ref()

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
  dialogTitle.value = '新增企业'
  isView.value = false
  Object.assign(formData, {
    id: null,
    companyName: '',
    orgCode: '',
    companyType: '',
    contactPerson: '',
    contactPhone: '',
    internCount: 0,
    address: '',
    district: '',
    isPartner: '否',
    entryMethod: '学生自选'
  })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  dialogTitle.value = '查看企业信息'
  isView.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 实习学生
const handleInternStudents = (row) => {
  ElMessage.info(`查看企业"${row.companyName}"的实习学生`)
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑企业信息'
  isView.value = false
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除企业"${row.companyName}"吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    crudRef.value?.refresh()
  }).catch(() => {})
}

// 重复企业导出
const handleExportDuplicate = () => {
  ElMessage.success('重复企业导出成功')
}

// 批量导出数据
const handleBatchExport = () => {
  ElMessage.success('批量导出数据成功')
}

// 导入
const handleImport = () => {
  ElMessage.info('导入功能')
}

// 导出数据
const handleExportData = () => {
  ElMessage.success('导出成功')
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
    await dialogRef.value?.formRef?.validate()
    ElMessage.success(formData.id ? '修改成功' : '新增成功')
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

<style scoped>
.hospital-list-page {
  padding: 20px;
}
</style>
