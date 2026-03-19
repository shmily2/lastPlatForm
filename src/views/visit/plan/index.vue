<template>
  <div class="visit-plan-page" style="min-height: 500px">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: true, edit: false, delete: true }"
      :actions="{ add: true, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @view="handleView"
      @add="handleAdd"
      @delete="handleDelete"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">详情</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleExportVisit">导出巡访手册</el-button>
      </template>
    </Crud>

    <!-- 详情对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :show-footer="false"
      :show-form="true"
      :form-fields="detailFields"
      :form-data="formData"
      :view-mode="true"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
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
    const pageSize = params.pageSize || 10
    const page = params.page || 1

    const teachers = ['李玲', '王欣睿', '汪静', '杨菁', '张老师', '刘老师', '陈老师']
    const companies = [
      '南京聚网时代传媒科技有限公司',
      '南京尚学教育培训中心',
      '南京金之欧美容美发管理有限公司',
      '南京骁旺健身俱乐部有限公司',
      '江苏华新教育科技有限公司',
      '南京天正信息技术有限公司',
      '南京思创信息技术有限公司'
    ]
    const students = [
      '徐可雨', '杨婉钰', '阮轩', '张静恩', '史欣悦', '王小明', '李华',
      '赵伟', '孙涛', '周杰', '吴斌', '郑强', '王芳', '李敏'
    ]
    const addresses = [
      '江苏省南京市鼓楼区永庆巷',
      '江苏省南京市玄武区龙蟠路',
      '江苏省南京市秦淮区中山南路',
      '江苏省南京市建邺区河西西路',
      '江苏省南京市江宁区天元东路',
      '江苏省南京市浦口区大桥北路',
      '江苏省南京市栖霞区仙林大道'
    ]
    const visitTypes = ['电话巡访', '实地巡访']
    const visitResults = ['优秀', '良好', '一般']

    const data = Array.from({ length: pageSize }, (_, i) => {
      const studentCount = [1, 1, 1, 16, 2, 1, 3][i % 7]
      const studentNames = []
      for (let j = 0; j < Math.min(studentCount, 3); j++) {
        studentNames.push(students[(page * pageSize + i + j) % students.length])
      }
      if (studentCount > 3) {
        studentNames.push(`等${studentCount}人`)
      }

      return {
        id: (page - 1) * pageSize + i + 1,
        teacherName: teachers[i % teachers.length],
        visitTime: `2025-06-${29 - (i % 10)} ${String(22 - (i % 12)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}:00`,
        companyName: companies[i % companies.length],
        studentCount: studentCount,
        studentNames: studentNames.join('、'),
        visitType: visitTypes[i % visitTypes.length],
        visitResult: visitResults[0],
        visitAddress: addresses[i % addresses.length]
      }
    })

    console.log('返回数据:', data.length, '条')
    return Promise.resolve({
      data: {
        list: data,
        total: 120
      }
    })
  },
  delete: (params) => {
    console.log('删除参数:', params)
    return Promise.resolve({ data: { success: true } })
  }
}

// 搜索字段配置
const searchFields = [
  {
    prop: 'visitMonth',
    label: '选择月',
    type: 'month',
    placeholder: '请选择月份',
    span: 6
  },
  {
    prop: 'teacherName',
    label: '教师名称',
    type: 'select',
    placeholder: '请选择教师',
    options: [
      { label: '全部', value: '' },
      { label: '李玲', value: '李玲' },
      { label: '王欣睿', value: '王欣睿' },
      { label: '汪静', value: '汪静' },
      { label: '杨菁', value: '杨菁' },
      { label: '张老师', value: '张老师' },
      { label: '刘老师', value: '刘老师' },
      { label: '陈老师', value: '陈老师' }
    ],
    span: 6
  },
  {
    prop: 'keyword',
    label: '请输入关键字',
    type: 'input',
    placeholder: '请输入关键字',
    span: 6
  },
  {
    prop: 'school',
    label: '学校',
    type: 'select',
    placeholder: '请选择学校',
    options: [
      { label: '全部', value: '' },
      { label: '南京市玄武中等专业学校', value: 'xuanwu' },
      { label: '南京市栖霞中等专业学校', value: 'xintaixia' },
      { label: '南京市秦淮中等专业学校', value: 'qinhuai' }
    ],
    span: 6
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'teacherName', label: '巡访教师', minWidth: 100, align: 'center' },
  { prop: 'visitTime', label: '巡访时间', minWidth: 160, align: 'center' },
  { prop: 'companyName', label: '企业名称', minWidth: 180, align: 'center', showOverflowTooltip: true },
  { prop: 'studentCount', label: '巡访学生数', width: 100, align: 'center' },
  { prop: 'studentNames', label: '学生姓名', minWidth: 150, align: 'center', showOverflowTooltip: true },
  {
    prop: 'visitType',
    label: '巡访类型',
    width: 100,
    align: 'center',
    formatter: (row) => {
      return row.visitType
    }
  },
  {
    prop: 'visitResult',
    label: '巡访情况',
    width: 100,
    align: 'center',
    formatter: (row) => {
      return row.visitResult
    }
  },
  { prop: 'visitAddress', label: '巡访地址', minWidth: 200, align: 'center', showOverflowTooltip: true }
]

// 详情表单字段
const detailFields = [
  {
    title: '巡访信息',
    fields: [
      { prop: 'teacherName', label: '巡访教师', type: 'input', span: 12 },
      { prop: 'visitTime', label: '巡访时间', type: 'input', span: 12 },
      { prop: 'companyName', label: '企业名称', type: 'input', span: 24 },
      { prop: 'studentCount', label: '巡访学生数', type: 'input', span: 12 },
      { prop: 'visitType', label: '巡访类型', type: 'input', span: 12 },
      { prop: 'visitResult', label: '巡访情况', type: 'input', span: 12 },
      { prop: 'visitAddress', label: '巡访地址', type: 'input', span: 24 },
      { prop: 'studentNames', label: '学生姓名', type: 'input', span: 24 }
    ]
  }
]

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('巡访详情')
const dialogRef = ref()

const formData = reactive({
  id: null,
  teacherName: '',
  visitTime: '',
  companyName: '',
  studentCount: 0,
  studentNames: '',
  visitType: '',
  visitResult: '',
  visitAddress: ''
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

// 导出巡访手册
const handleExportVisit = () => {
  ElMessage.success('导出巡访手册成功')
}

// 查看
const handleView = (row) => {
  Object.assign(formData, row)
  dialogTitle.value = '巡访详情'
  dialogVisible.value = true
}

// 新增
const handleAdd = () => {
  ElMessage.info('新增巡访功能开发中')
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条巡访记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
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

// 关闭对话框
const handleDialogClose = () => {
  console.log('对话框关闭')
}
</script>

<style scoped>

</style>
