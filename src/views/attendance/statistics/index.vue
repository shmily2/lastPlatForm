<template>
  <div class="attendance-statistics-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">学生打卡 / 打卡统计</h2>
    </div>

    <!-- 筛选条件区 -->
    <el-card class="filter-card">
      <div class="filter-content">
        <div class="filter-item">
          <span class="filter-label">组织架构：</span>
          <el-select
            v-model="filters.organization"
            placeholder="请选择组织架构"
            clearable
            style="width: 200px"
          >
            <el-option label="全部" value="" />
            <el-option label="护理系" value="nursing" />
            <el-option label="临床系" value="clinical" />
            <el-option label="康复系" value="rehabilitation" />
          </el-select>
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

        <el-button type="primary" :icon="Search" @click="handleQuery">
          查询
        </el-button>
      </div>
    </el-card>

    <!-- 图表区域 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="chart-title">班级/小组打卡率(%)</span>
          <el-button type="primary" text @click="viewMode = 'table'">
            表格查看
          </el-button>
        </div>
      </template>

      <!-- 图表视图 -->
      <div v-show="viewMode === 'chart'" class="chart-container">
        <div ref="chartRef" class="chart" style="width: 100%; height: 500px"></div>
      </div>

      <!-- 表格视图 -->
      <div v-show="viewMode === 'table'" class="table-container">
        <el-table :data="chartData" border stripe>
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column prop="className" label="班级/小组" min-width="150" />
          <el-table-column prop="rate" label="打卡率(%)" min-width="150">
            <template #default="{ row }">
              <el-progress
                :percentage="row.rate"
                :color="getProgressColor(row.rate)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          <el-table-column prop="total" label="总人数" width="100" align="center" />
          <el-table-column prop="clocked" label="已打卡" width="100" align="center" />
          <el-table-column prop="unclocked" label="未打卡" width="100" align="center" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// 视图模式
const viewMode = ref('chart')

// 筛选条件
const filters = reactive({
  organization: '',
  dateRange: ['2026-03-10', '2026-03-10']
})

// 模拟数据
const chartData = ref([
  { className: '2020级护理1班', rate: 8, total: 45, clocked: 4, unclocked: 41 },
  { className: '临床2021级', rate: 5, total: 50, clocked: 3, unclocked: 47 },
  { className: '康复2021级', rate: 7, total: 40, clocked: 3, unclocked: 37 },
  { className: '康复2022级', rate: 6, total: 42, clocked: 3, unclocked: 39 },
  { className: '护理2021级', rate: 9, total: 48, clocked: 4, unclocked: 44 },
  { className: '护理2022级', rate: 4, total: 46, clocked: 2, unclocked: 44 },
  { className: '护理2023级', rate: 8, total: 50, clocked: 4, unclocked: 46 },
  { className: '护理2024级', rate: 6, total: 44, clocked: 3, unclocked: 41 },
  { className: '护理2025级', rate: 5, total: 47, clocked: 2, unclocked: 45 },
  { className: '护理2026级', rate: 7, total: 45, clocked: 3, unclocked: 42 },
  { className: '护理2027级', rate: 4, total: 48, clocked: 2, unclocked: 46 },
  { className: '护理2028级', rate: 6, total: 43, clocked: 3, unclocked: 40 },
  { className: '护理2029级', rate: 5, total: 46, clocked: 2, unclocked: 44 },
  { className: '护理2030级', rate: 8, total: 49, clocked: 4, unclocked: 45 },
  { className: '护理2031级', rate: 7, total: 44, clocked: 3, unclocked: 41 },
  { className: '护理2032级', rate: 6, total: 47, clocked: 3, unclocked: 44 },
  { className: '护理2033级', rate: 5, total: 45, clocked: 2, unclocked: 43 },
  { className: '护理2034级', rate: 4, total: 48, clocked: 2, unclocked: 46 },
  { className: '护理2035级', rate: 7, total: 46, clocked: 3, unclocked: 43 },
  { className: '护理2036级', rate: 6, total: 50, clocked: 3, unclocked: 47 }
])

// 图表引用
const chartRef = ref()
let chartInstance = null

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.value.map(item => item.className),
      axisLabel: {
        interval: 0,
        rotate: 30,
        fontSize: 11
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '打卡率(%)',
      nameLocation: 'center',
      nameGap: 40,
      min: 0,
      max: 10,
      interval: 1,
      axisLabel: {
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: '#EBEEF5'
        }
      }
    },
    series: [
      {
        name: '打卡率',
        type: 'bar',
        data: chartData.value.map(item => item.rate),
        barWidth: '40%',
        itemStyle: {
          color: '#909399',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#409eff'
          }
        },
        label: {
          show: true,
          position: 'top',
          offset: [-5, -10],
          formatter: '{c}%',
          color: '#606266',
          fontSize: 12,
          fontWeight: 'bold'
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 获取进度条颜色
const getProgressColor = (rate) => {
  if (rate >= 80) return '#67c23a'
  if (rate >= 60) return '#409eff'
  if (rate >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 查询
const handleQuery = () => {
  ElMessage.success('查询成功')
  // 这里可以根据筛选条件重新加载数据
}

// 窗口大小变化处理
const handleResize = () => {
  chartInstance?.resize()
}

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initChart()
  })

  // 窗口大小变化时重新渲染图表
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// 监听视图模式变化
watch(viewMode, (newVal) => {
  if (newVal === 'chart') {
    nextTick(() => {
      initChart()
    })
  }
})

// 监听数据变化
watch(chartData, () => {
  if (viewMode.value === 'chart' && chartInstance) {
    chartInstance.setOption({
      yAxis: {
        data: chartData.value.map(item => item.className)
      },
      series: [
        {
          data: chartData.value.map(item => item.rate)
        }
      ]
    })
  }
}, { deep: true })
</script>

<style scoped>
.attendance-statistics-page {
  padding: 10px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.chart-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  padding: 20px 0;
}

.table-container {
  padding: 10px 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-item {
    width: 100%;
  }

  .filter-item span,
  .filter-item .el-select,
  .filter-item .el-date-picker {
    width: 100% !important;
  }
}
</style>
