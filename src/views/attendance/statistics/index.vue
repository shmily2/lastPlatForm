<template>
  <div class="statistics-page">
    <!-- 顶部筛选区 -->
    <el-card class="filter-card">
      <div class="filter-content">
        <div class="filter-items">
          <div class="filter-item">
            <span class="filter-label">组织架构：</span>
            <OrgSelector
              v-model="filters.organization"
              placeholder="请选择组织架构"
              style="width: 260px"
            />
          </div>
          <div class="filter-item">
            <span class="filter-label">打卡日期：</span>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              clearable
              style="width: 300px"
            />
          </div>
          <el-button type="primary" :icon="Refresh" @click="handleQuery">
            更新
          </el-button>
        </div>
        <div class="filter-actions">
          <el-button v-if="viewMode === 'chart'" type="primary" text @click="viewMode = 'table'">
            表格查看
          </el-button>
          <el-button v-else type="primary" text @click="viewMode = 'chart'">
            图表查看
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据可视化区域 -->
    <el-card v-if="viewMode === 'chart'" class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="chart-title">班级/小组打卡率(%)</span>
        </div>
      </template>
      <div ref="chartRef" class="chart-container" />
    </el-card>

    <!-- 表格视图 -->
    <el-card v-else class="table-card">
      <template #header>
        <div class="card-header">
          <span class="chart-title">班级/小组打卡率(%)</span>
        </div>
      </template>
      <el-table :data="tableData" border stripe>
        <el-table-column prop="className" label="班级/小组" min-width="180" />
        <el-table-column prop="total" label="总人数" min-width="100" align="center" />
        <el-table-column prop="checked" label="打卡人数" min-width="100" align="center" />
        <el-table-column prop="rate" label="打卡率(%)" min-width="120" align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.rate" :color="getProgressColor(row.rate)" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import OrgSelector from '@/components/OrgSelector/index.vue'

// 筛选条件
const filters = reactive({
  organization: '',
  dateRange: ['2026-03-18', '2026-03-18']
})

// 视图模式
const viewMode = ref('chart')

// 图表引用
const chartRef = ref(null)
let chartInstance = null

// 表格数据
const tableData = ref([
  { className: '20护理1班', total: 45, checked: 42, rate: 93 },
  { className: '20护理2班', total: 43, checked: 38, rate: 88 },
  { className: '20临床1班', total: 50, checked: 45, rate: 90 },
  { className: '20临床2班', total: 48, checked: 40, rate: 83 },
  { className: '20康复1班', total: 35, checked: 32, rate: 91 },
  { className: '21护理1班', total: 42, checked: 39, rate: 93 },
  { className: '21护理2班', total: 40, checked: 35, rate: 88 },
  { className: '21艺术1班', total: 38, checked: 30, rate: 79 }
])

// 进度条颜色
const getProgressColor = (rate) => {
  if (rate >= 90) return '#67C23A'
  if (rate >= 80) return '#409EFF'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return
  
  const xData = tableData.value.map(item => item.className)
  const yData = tableData.value.map(item => item.rate)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '打卡率(%)',
      min: 0,
      max: 100,
      interval: 10,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '打卡率',
        type: 'bar',
        data: yData,
        itemStyle: {
          color: '#409EFF'
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        },
        barMaxWidth: 50
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 查询
const handleQuery = () => {
  console.log('查询条件:', filters)
  if (viewMode.value === 'chart') {
    nextTick(() => {
      updateChart()
    })
  }
}

// 监听窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
.statistics-page {
  padding: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-items {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  white-space: nowrap;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
}
</style>
