<template>
  <div class="attendance-record-page" style="min-height: 500px">
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
      :table-actions="{ view: true, edit: false, delete: false }"
      :actions="{ add: false, batchDelete: false, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @view="handleView"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义打卡状态列 -->
      <template #clockStatus="{ row }">
        <el-tag :type="getStatusType(row.clockStatus)">
          {{ row.clockStatus }}
        </el-tag>
      </template>

      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
      </template>
    </Crud>

    <!-- 详情对话框 -->
    <Dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1000px"
      :show-footer="true"
      @open="handleDialogOpen"
    >
      <div class="detail-container">
        <!-- 筛选区：月份选择器 -->
        <div class="detail-filter">
          <el-form inline>
            <el-form-item label="月份">
              <el-date-picker
                v-model="detailMonth"
                type="month"
                format="YYYY年MM月"
                value-format="YYYY-MM"
                placeholder="选择月份"
                clearable
                @change="handleDetailMonthChange"
              />
            </el-form-item>
          </el-form>
        </div>
        <!-- 表格区 -->
        <div class="detail-table-wrapper">
          <BaseTable
            :key="detailTableKey"
            :table-data="detailTableData"
            :columns="detailTableColumns"
            :show-index="true"
            :show-actions="false"
            :show-pagination="false"
          >
            <template #clockImage="{ row }">
              <el-image
                v-if="row.clockImage"
                :src="row.clockImage"
                :preview-src-list="[row.clockImage]"
                fit="cover"
                style="width: 50px; height: 50px; border-radius: 4px;"
              />
              <span v-else>-</span>
            </template>
          </BaseTable>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import BaseTable from '@/components/Table/index.vue'

// 周次选择
const dateValue = ref('')

// Crud 组件引用
const crudRef = ref()
const errorMessage = ref('')

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('打卡详情')
const dialogRef = ref(null)
const formData = ref({})

// 详情弹框筛选和表格数据
const detailMonth = ref('')
const detailTableData = ref([])
const detailTableKey = ref(0)
const detailTableColumns = [
  { prop: 'studentName', label: '姓名', minWidth: 100, align: 'center' },
  { prop: 'className', label: '所在班级', minWidth: 120, align: 'center' },
  { prop: 'department', label: '系部', minWidth: 150, align: 'center' },
  { prop: 'clockTime', label: '打卡时间', minWidth: 160, align: 'center' },
  { prop: 'clockType', label: '打卡类型', minWidth: 100, align: 'center' },
  { prop: 'companyName', label: '实习企业', minWidth: 150, align: 'center' },
  { prop: 'companyAddress', label: '企业地址', minWidth: 150, align: 'center' },
  { prop: 'detailAddress', label: '详细地址', minWidth: 200, align: 'center' },
  { prop: 'clockImage', label: '打卡图片', slot: 'clockImage', width: 100, align: 'center' }
]

// 获取当月格式化的字符串
const getCurrentMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// 初始化详情月份为当月
const initDetailMonth = () => {
  detailMonth.value = getCurrentMonth()
}

// 处理月份变化
const handleDetailMonthChange = (month) => {
  if (!month) {
    // 清空时恢复默认月份
    detailMonth.value = getCurrentMonth()
  }
  console.log('选择月份:', detailMonth.value)
  // TODO: 根据月份重新加载表格数据
}

// 弹框打开时重置表格滚动位置
const handleDialogOpen = () => {
  detailTableKey.value++
}

// 监听 crudRef 变化
watch(crudRef, (newVal) => {
  console.log('crudRef 变化:', !!newVal)
}, { immediate: true })

// Mock API 配置
const apiConfig = {
  list: (params) => {
    console.log('apiConfig.list 被调用，参数:', params)
    const pageSize = params.pageSize || 10
    const page = params.page || 1
    const statuses = ['已打卡', '未打卡', '迟到', '早退']
    const companies = [
      '中国铁路上海局集团有限公司',
      '泰康仙林鼓楼医院有限公司',
      '东南大学附属中大医院',
      '南京鼓楼医院',
      '苏宁易购集团股份有限公司'
    ]
    const addresses = [
      '浙江省绍兴市诸暨市陶朱街道越都路28号',
      '江苏省南京市栖霞区仙林大道100号',
      '江苏省南京市鼓楼区中山路321号',
      '江苏省南京市江宁区东南大学路2号',
      '江苏省南京市玄武区中山路1号'
    ]
    const classes = ['21城职酒店', '22护理1班', '22康复1班', '23临床1班', '21旅游管理']
    const departments = ['旅游管理系钟阜路区 2026届', '护理系钟阜路区 2026届', '康复系钟阜路区 2026届']

    const data = Array.from({ length: pageSize }, (_, i) => {
      const index = (page - 1) * pageSize + i
      const status = statuses[index % statuses.length]
      return {
        id: index + 1,
        studentNo: '21513' + String(100 + index).padStart(3, '0'),
        studentName: ['李宇飞', '王建国', '张明', '赵丽', '陈刚', '刘洋', '杨帆', '周涛', '吴磊', '郑强'][index % 10],
        className: classes[index % classes.length],
        department: departments[index % departments.length],
        companyName: companies[index % companies.length],
        companyAddress: addresses[index % addresses.length],
        clockAddress: status === '未打卡' ? '-' : addresses[index % addresses.length],
        clockTime: status === '未打卡' ? '-' : '2026-03-1' + (index % 9 + 1) + ' 08:' + String(index % 60).padStart(2, '0') + ':00',
        clockStatus: status
      }
    })

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
    type: 'organizational',
    span: 4
  },
  {
    prop: 'keyword',
    label: '关键字',
    type: 'input',
    placeholder: '请输入关键字',
    span:  4
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '全部', value: 'all' },
      { label: '已打卡', value: 'clocked' },
      { label: '未打卡', value: 'unclocked' },
      { label: '迟到', value: 'late' },
      { label: '早退', value: 'early' }
    ],
    span:  4
  },
  {
    prop: 'date',
    label: '请选择日期',
    type: 'date',
    span:  4
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentNo', label: '学号', minWidth: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', minWidth: 100, align: 'center' },
  { prop: 'className', label: '所在班级', minWidth: 120, align: 'center' },
  { prop: 'department', label: '系部', minWidth: 180, align: 'center' },
  { prop: 'companyName', label: '实习企业', minWidth: 200, align: 'center' },
  { prop: 'companyAddress', label: '企业地址', minWidth: 250, align: 'center' },
  { prop: 'clockAddress', label: '打卡地址', minWidth: 250, align: 'center' },
  { prop: 'clockTime', label: '打卡时间', minWidth: 160, align: 'center' },
  { prop: 'clockStatus', label: '打卡状态', minWidth: 100, align: 'center' }
]

// 详情表单字段配置
const detailFields = [
  {
    title: '基本信息',
    fields: [
      { prop: 'studentNo', label: '学号', type: 'input', span: 12 },
      { prop: 'studentName', label: '学生姓名', type: 'input', span: 12 },
      { prop: 'className', label: '所在班级', type: 'input', span: 12 },
      { prop: 'department', label: '系部', type: 'input', span: 12 }
    ]
  },
  {
    title: '实习信息',
    fields: [
      { prop: 'companyName', label: '实习企业', type: 'input', span: 24 },
      { prop: 'companyAddress', label: '企业地址', type: 'input', span: 24 }
    ]
  },
  {
    title: '打卡信息',
    fields: [
      { prop: 'clockAddress', label: '打卡地址', type: 'input', span: 24 },
      { prop: 'clockTime', label: '打卡时间', type: 'input', span: 12 },
      { prop: 'clockStatus', label: '打卡状态', type: 'input', span: 12 }
    ]
  }
]

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    '已打卡': 'success',
    '未打卡': 'danger',
    '迟到': 'warning',
    '早退': 'warning'
  }
  return typeMap[status] || 'info'
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

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 查看详情
const handleView = (row) => {
  formData.value = { ...row }
  dialogTitle.value = `${row.studentName} - 打卡详情`
  // 初始化月份为当月
  initDetailMonth()
  // 加载详情数据（模拟30条）
  const clockTypes = ['上班打卡', '下班打卡']
  const clockAddresses = ['北京市朝阳区科技园区A座', '上海市浦东新区张江高科B栋', '广州市天河区珠江新城C座']
  const companies = ['字节跳动', '阿里巴巴', '腾讯科技', '百度', '京东集团']
  const dataList = []
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    const hour = Math.floor(Math.random() * 3) + 8
    const minute = Math.floor(Math.random() * 60).toString().padStart(2, '0')
    const second = Math.floor(Math.random() * 60).toString().padStart(2, '0')
    dataList.push({
      studentName: row.studentName,
      className: row.className,
      department: row.department,
      clockTime: `${dateStr} ${hour}:${minute}:${second}`,
      clockType: clockTypes[i % 2],
      companyName: companies[i % 5],
      companyAddress: clockAddresses[i % 3],
      detailAddress: clockAddresses[i % 3] + (i + 1) + '01室',
      clockImage: ''
    })
  }
  detailTableData.value = dataList
  dialogVisible.value = true
}

// 分页大小变化
const handleSizeChange = (size) => {
  console.log('每页条数变化:', size)
}

// 当前页变化
const handleCurrentChange = (page) => {
  console.log('当前页变化:', page)
}
</script>

<style scoped>
.attendance-record-page {
  padding: 10px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.date-section {
  margin-bottom: 10px;
}

.date-label {
  color: #f56c6c;
  font-weight: 600;
  margin-right: 8px;
}

/* 详情内容 */
.detail-content {
  padding: 10px;
}

/* 详情弹框筛选区 */
.detail-filter {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  flex-shrink: 0;
}

/* 详情容器 */
.detail-container {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
}

/* 详情表格区域 */
.detail-table-wrapper {
  flex: 1;
  overflow: auto;
  margin-top: 15px;
}

/* 表格行交替背景色 - 浅蓝/白 */
.attendance-record-page :deep(.el-table .el-table__row--striped td) {
  background: #ecf5ff !important;
}

.attendance-record-page :deep(.el-table .el-table__row:hover > td) {
  background: #d9ecff !important;
}
</style>
