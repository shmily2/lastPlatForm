<template>
  <div class="analysis-page">
    <!-- 左侧导航 -->
    <div class="left-sidebar">
      <!-- 考评数据卡片 -->
      <el-card class="menu-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">考评数据</span>
          </div>
        </template>
        <div class="menu-list">
          <div
            v-for="item in evaluationMenus"
            :key="item.path"
            class="menu-item"
            :class="{ active: currentPath === item.path }"
            @click="handleMenuClick(item)"
          >
            {{ item.title }}
          </div>
        </div>
      </el-card>
      <!-- 实习数据卡片 -->
      <el-card class="menu-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="card-title">实习数据</span>
          </div>
        </template>
        <div class="menu-list">
          <div
            v-for="item in internshipMenus"
            :key="item.path"
            class="menu-item"
            :class="{ active: currentPath === item.path }"
            @click="handleMenuClick(item)"
          >
            {{ item.title }}
          </div>
        </div>
      </el-card>
    </div>

    <!-- 右侧主内容区 -->
    <div class="right-content">
      <!-- 顶部筛选区 -->
      <el-card class="filter-card">
        <div class="filter-content">
          <div class="filter-items">
            <div class="filter-item">
              <span class="filter-label">组织架构：</span>
              <el-tree-select
                v-model="filters.organization"
                :data="orgTree"
                placeholder="请搜索组织架构"
                clearable
                filterable
                check-strictly
                :render-after-expand="false"
                style="width: 260px"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">{{ dateFilterLabel }}：</span>
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
          <div class="filter-actions">
            <el-button type="primary" @click="handleExport">
              导出
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 数据可视化区域 -->
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span class="chart-title">{{ currentTitle }}</span>
            <el-button v-if="viewMode === 'chart'" type="primary" text @click="viewMode = 'table'">
              表格查看
            </el-button>
            <el-button v-else type="primary" text @click="viewMode = 'chart'">
              图表查看
            </el-button>
          </div>
        </template>

        <!-- 图表视图 -->
        <div v-show="viewMode === 'chart'" class="chart-container">
          <div ref="chartRef" class="chart" style="width: 100%; height: 100%"></div>
        </div>

        <!-- 表格视图 -->
        <div v-show="viewMode === 'table'" class="table-container">
          <el-table :data="chartData" border stripe height="100%">
            <el-table-column type="index" label="序号" width="80" align="center" />
            <el-table-column prop="className" label="班级/小组" min-width="180" />
            <el-table-column prop="rate" label="打卡率(%)" min-width="180">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.rate"
                  :color="getProgressColor(row.rate)"
                  :stroke-width="10"
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useRouter, useRoute } from 'vue-router'
import { getOrgTree } from '@/mock/index'

const router = useRouter()
const route = useRoute()

// 左侧菜单数据
const evaluationMenus = [
  { title: '打卡统计', path: '/analysis/attendance' },
  { title: '实习统计', path: '/analysis/internship' },
  { title: '周报统计', path: '/analysis/weekly' },
  { title: '月报统计', path: '/analysis/monthly' },
  { title: '巡访统计', path: '/analysis/visit' },
  { title: '单位考评统计', path: '/analysis/company-eval' }
]

const internshipMenus = [
  { title: '实习情况统计', path: '/analysis/internship-status' },
  { title: '地区分布', path: '/analysis/region' },
  { title: '薪资范围', path: '/analysis/salary' },
  { title: '对口率', path: '/analysis/matching' },
  { title: '保险购买', path: '/analysis/insurance' }
]

// 当前选中的菜单路径
const currentPath = ref(route.path || '/analysis/internship')
const currentTitle = ref('班级/小组打卡率(%)')

// 动态日期筛选标签
const dateFilterLabel = computed(() => {
  const path = currentPath.value
  if (path.includes('region') || path.includes('salary')) return '统计时间'
  if (path.includes('weekly')) return '周报周期'
  if (path.includes('monthly')) return '月报周期'
  if (path.includes('visit')) return '巡访日期'
  if (path.includes('insurance')) return '保险购买日期'
  return '打卡日期'
})

// 组织架构树形数据
const orgTree = ref([])


// 菜单点击处理
const handleMenuClick = (menu) => {
  currentPath.value = menu.path
  loadMenuData(menu.path)
}

// 根据菜单加载对应数据
const loadMenuData = (path) => {
  switch (path) {
    case '/analysis/attendance':
      currentTitle.value = '班级/小组打卡率(%)'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 50, total: 45, clocked: 22, unclocked: 23 },
        { className: '21级会计1班（五年制）', rate: 31, total: 38, clocked: 12, unclocked: 26 },
        { className: '23级中餐烹饪3班', rate: 17, total: 42, clocked: 7, unclocked: 35 },
        { className: '22级计算机应用1班', rate: 13, total: 50, clocked: 6, unclocked: 44 },
        { className: '21级电子商务1班', rate: 28, total: 36, clocked: 10, unclocked: 26 },
        { className: '23级幼儿教育1班', rate: 45, total: 40, clocked: 18, unclocked: 22 },
        { className: '22级机电一体化1班', rate: 22, total: 48, clocked: 10, unclocked: 38 },
        { className: '21级汽车维修1班', rate: 35, total: 32, clocked: 11, unclocked: 21 },
        { className: '23级护理1班', rate: 55, total: 44, clocked: 24, unclocked: 20 },
        { className: '22级会计2班', rate: 18, total: 46, clocked: 8, unclocked: 38 }
      ]
      break
    case '/analysis/internship':
      currentTitle.value = '实习人数统计'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 92, total: 45, clocked: 41, unclocked: 4 },
        { className: '21级会计1班（五年制）', rate: 85, total: 38, clocked: 32, unclocked: 6 },
        { className: '23级中餐烹饪3班', rate: 78, total: 42, clocked: 32, unclocked: 10 },
        { className: '22级计算机应用1班', rate: 88, total: 50, clocked: 44, unclocked: 6 },
        { className: '21级电子商务1班', rate: 95, total: 36, clocked: 34, unclocked: 2 },
        { className: '23级幼儿教育1班', rate: 90, total: 40, clocked: 36, unclocked: 4 },
        { className: '22级机电一体化1班', rate: 82, total: 48, clocked: 39, unclocked: 9 },
        { className: '21级汽车维修1班', rate: 87, total: 32, clocked: 27, unclocked: 5 },
        { className: '23级护理1班', rate: 91, total: 44, clocked: 40, unclocked: 4 },
        { className: '22级会计2班', rate: 80, total: 46, clocked: 36, unclocked: 10 }
      ]
      break
    case '/analysis/weekly':
      currentTitle.value = '周报提交率(%)'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 75, total: 45, clocked: 33, unclocked: 12 },
        { className: '21级会计1班（五年制）', rate: 68, total: 38, clocked: 25, unclocked: 13 },
        { className: '23级中餐烹饪3班', rate: 82, total: 42, clocked: 34, unclocked: 8 },
        { className: '22级计算机应用1班', rate: 55, total: 50, clocked: 27, unclocked: 23 },
        { className: '21级电子商务1班', rate: 90, total: 36, clocked: 32, unclocked: 4 },
        { className: '23级幼儿教育1班', rate: 78, total: 40, clocked: 31, unclocked: 9 },
        { className: '22级机电一体化1班', rate: 65, total: 48, clocked: 31, unclocked: 17 },
        { className: '21级汽车维修1班', rate: 72, total: 32, clocked: 23, unclocked: 9 },
        { className: '23级护理1班', rate: 85, total: 44, clocked: 37, unclocked: 7 },
        { className: '22级会计2班', rate: 60, total: 46, clocked: 27, unclocked: 19 }
      ]
      break
    case '/analysis/monthly':
      currentTitle.value = '月报提交率(%)'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 88, total: 45, clocked: 39, unclocked: 6 },
        { className: '21级会计1班（五年制）', rate: 76, total: 38, clocked: 28, unclocked: 10 },
        { className: '23级中餐烹饪3班', rate: 65, total: 42, clocked: 27, unclocked: 15 },
        { className: '22级计算机应用1班', rate: 82, total: 50, clocked: 41, unclocked: 9 },
        { className: '21级电子商务1班', rate: 95, total: 36, clocked: 34, unclocked: 2 },
        { className: '23级幼儿教育1班', rate: 80, total: 40, clocked: 32, unclocked: 8 },
        { className: '22级机电一体化1班', rate: 70, total: 48, clocked: 33, unclocked: 15 },
        { className: '21级汽车维修1班', rate: 78, total: 32, clocked: 24, unclocked: 8 },
        { className: '23级护理1班', rate: 90, total: 44, clocked: 39, unclocked: 5 },
        { className: '22级会计2班', rate: 72, total: 46, clocked: 33, unclocked: 13 }
      ]
      break
    case '/analysis/visit':
      currentTitle.value = '巡访完成率(%)'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 60, total: 45, clocked: 27, unclocked: 18 },
        { className: '21级会计1班（五年制）', rate: 45, total: 38, clocked: 17, unclocked: 21 },
        { className: '23级中餐烹饪3班', rate: 35, total: 42, clocked: 14, unclocked: 28 },
        { className: '22级计算机应用1班', rate: 50, total: 50, clocked: 25, unclocked: 25 },
        { className: '21级电子商务1班', rate: 55, total: 36, clocked: 19, unclocked: 17 },
        { className: '23级幼儿教育1班', rate: 42, total: 40, clocked: 16, unclocked: 24 },
        { className: '22级机电一体化1班', rate: 38, total: 48, clocked: 18, unclocked: 30 },
        { className: '21级汽车维修1班', rate: 48, total: 32, clocked: 15, unclocked: 17 },
        { className: '23级护理1班', rate: 65, total: 44, clocked: 28, unclocked: 16 },
        { className: '22级会计2班', rate: 40, total: 46, clocked: 18, unclocked: 28 }
      ]
      break
    case '/analysis/company-eval':
      currentTitle.value = '单位考评优秀率(%)'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 35, total: 45, clocked: 15, unclocked: 30 },
        { className: '21级会计1班（五年制）', rate: 28, total: 38, clocked: 10, unclocked: 28 },
        { className: '23级中餐烹饪3班', rate: 42, total: 42, clocked: 17, unclocked: 25 },
        { className: '22级计算机应用1班', rate: 30, total: 50, clocked: 15, unclocked: 35 },
        { className: '21级电子商务1班', rate: 38, total: 36, clocked: 13, unclocked: 23 },
        { className: '23级幼儿教育1班', rate: 45, total: 40, clocked: 18, unclocked: 22 },
        { className: '22级机电一体化1班', rate: 32, total: 48, clocked: 15, unclocked: 33 },
        { className: '21级汽车维修1班', rate: 40, total: 32, clocked: 12, unclocked: 20 },
        { className: '23级护理1班', rate: 48, total: 44, clocked: 21, unclocked: 23 },
        { className: '22级会计2班', rate: 25, total: 46, clocked: 11, unclocked: 35 }
      ]
      break
    case '/analysis/internship-status':
      currentTitle.value = '实习情况统计'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 95, total: 45, clocked: 42, unclocked: 3 },
        { className: '21级会计1班（五年制）', rate: 88, total: 38, clocked: 33, unclocked: 5 },
        { className: '23级中餐烹饪3班', rate: 82, total: 42, clocked: 34, unclocked: 8 },
        { className: '22级计算机应用1班', rate: 90, total: 50, clocked: 45, unclocked: 5 },
        { className: '21级电子商务1班', rate: 98, total: 36, clocked: 35, unclocked: 1 },
        { className: '23级幼儿教育1班', rate: 92, total: 40, clocked: 36, unclocked: 4 },
        { className: '22级机电一体化1班', rate: 85, total: 48, clocked: 40, unclocked: 8 },
        { className: '21级汽车维修1班', rate: 88, total: 32, clocked: 28, unclocked: 4 },
        { className: '23级护理1班', rate: 94, total: 44, clocked: 41, unclocked: 3 },
        { className: '22级会计2班', rate: 82, total: 46, clocked: 37, unclocked: 9 }
      ]
      break
    case '/analysis/region':
      currentTitle.value = '地区分布统计'
      chartData.value = [
        { className: '广州市', rate: 35, total: 180, clocked: 63, unclocked: 117 },
        { className: '深圳市', rate: 25, total: 150, clocked: 37, unclocked: 113 },
        { className: '东莞市', rate: 15, total: 120, clocked: 18, unclocked: 102 },
        { className: '佛山市', rate: 12, total: 100, clocked: 12, unclocked: 88 },
        { className: '中山市', rate: 8, total: 80, clocked: 6, unclocked: 74 },
        { className: '珠海市', rate: 5, total: 60, clocked: 3, unclocked: 57 }
      ]
      break
    case '/analysis/salary':
      currentTitle.value = '薪资范围分布'
      chartData.value = [
        { className: '3000以下', rate: 10, total: 50, clocked: 5, unclocked: 45 },
        { className: '3000-5000', rate: 25, total: 125, clocked: 31, unclocked: 94 },
        { className: '5000-8000', rate: 35, total: 175, clocked: 61, unclocked: 114 },
        { className: '8000-10000', rate: 20, total: 100, clocked: 20, unclocked: 80 },
        { className: '10000以上', rate: 10, total: 50, clocked: 5, unclocked: 45 }
      ]
      break
    case '/analysis/matching':
      currentTitle.value = '对口率统计(%)'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 78, total: 45, clocked: 35, unclocked: 10 },
        { className: '21级会计1班（五年制）', rate: 65, total: 38, clocked: 24, unclocked: 14 },
        { className: '23级中餐烹饪3班', rate: 72, total: 42, clocked: 30, unclocked: 12 },
        { className: '22级计算机应用1班', rate: 68, total: 50, clocked: 34, unclocked: 16 },
        { className: '21级电子商务1班', rate: 55, total: 36, clocked: 19, unclocked: 17 },
        { className: '23级幼儿教育1班', rate: 82, total: 40, clocked: 32, unclocked: 8 },
        { className: '22级机电一体化1班', rate: 70, total: 48, clocked: 33, unclocked: 15 },
        { className: '21级汽车维修1班', rate: 75, total: 32, clocked: 24, unclocked: 8 },
        { className: '23级护理1班', rate: 80, total: 44, clocked: 35, unclocked: 9 },
        { className: '22级会计2班', rate: 62, total: 46, clocked: 28, unclocked: 18 }
      ]
      break
    case '/analysis/insurance':
      currentTitle.value = '保险购买率(%)'
      chartData.value = [
        { className: '21级护理2班（大专）', rate: 92, total: 45, clocked: 41, unclocked: 4 },
        { className: '21级会计1班（五年制）', rate: 85, total: 38, clocked: 32, unclocked: 6 },
        { className: '23级中餐烹饪3班', rate: 78, total: 42, clocked: 32, unclocked: 10 },
        { className: '22级计算机应用1班', rate: 88, total: 50, clocked: 44, unclocked: 6 },
        { className: '21级电子商务1班', rate: 95, total: 36, clocked: 34, unclocked: 2 },
        { className: '23级幼儿教育1班', rate: 90, total: 40, clocked: 36, unclocked: 4 },
        { className: '22级机电一体化1班', rate: 82, total: 48, clocked: 39, unclocked: 9 },
        { className: '21级汽车维修1班', rate: 87, total: 32, clocked: 27, unclocked: 5 },
        { className: '23级护理1班', rate: 91, total: 44, clocked: 40, unclocked: 4 },
        { className: '22级会计2班', rate: 80, total: 46, clocked: 36, unclocked: 10 }
      ]
      break
  }
  // 更新图表
  nextTick(() => {
    initChart()
  })
}

// 视图模式
const viewMode = ref('chart')
// 筛选条件
const filters = reactive({
  organization: null,
  dateRange: ['2025-11-10', '2025-11-16']
})

// 模拟数据 - 打卡率
const chartData = ref([
  { className: '21级护理2班（大专）', rate: 50, total: 45, clocked: 22, unclocked: 23 },
  { className: '21级会计1班（五年制）', rate: 31, total: 38, clocked: 12, unclocked: 26 },
  { className: '23级中餐烹饪3班', rate: 17, total: 42, clocked: 7, unclocked: 35 },
  { className: '22级计算机应用1班', rate: 13, total: 50, clocked: 6, unclocked: 44 },
  { className: '21级电子商务1班', rate: 28, total: 36, clocked: 10, unclocked: 26 },
  { className: '23级幼儿教育1班', rate: 45, total: 40, clocked: 18, unclocked: 22 },
  { className: '22级机电一体化1班', rate: 22, total: 48, clocked: 10, unclocked: 38 },
  { className: '21级汽车维修1班', rate: 35, total: 32, clocked: 11, unclocked: 21 },
  { className: '23级护理1班', rate: 55, total: 44, clocked: 24, unclocked: 20 },
  { className: '22级会计2班', rate: 18, total: 46, clocked: 8, unclocked: 38 }
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
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.value.map(item => item.className),
      axisLabel: {
        interval: 0,
        rotate: 20,
        fontSize: 11,
        color: '#606266'
      },
      axisLine: {
        lineStyle: {
          color: '#DCDFE6'
        }
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: currentTitle.value.includes('率') || currentTitle.value.includes('分布') ? currentTitle.value : '数值(%)',
      nameLocation: 'center',
      nameGap: 35,
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}%',
        color: '#606266'
      },
      nameTextStyle: {
        color: '#606266',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#EBEEF5'
        }
      }
    },
    series: [
      {
        name: currentTitle.value,
        type: 'bar',
        data: chartData.value.map(item => item.rate),
        barWidth: '50%',
        itemStyle: {
          color: '#409eff',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#66b1ff'
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#409eff',
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
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 窗口大小变化处理
const handleResize = () => {
  chartInstance?.resize()
}

// 组件挂载后初始化图表
onMounted(async() => {
  try {
    const res = await getOrgTree()
    if (res.code === 200) {
      orgTree.value = res.data
    }
  } catch (e) {
    console.error('加载组织架构失败:', e)
  }
  loadMenuData(currentPath.value)
  nextTick(() => {
    initChart()
  })
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
      setTimeout(() => {
        chartInstance?.resize()
      }, 100)
    })
  }
})

// 监听数据变化
watch(chartData, () => {
  if (viewMode.value === 'chart' && chartInstance) {
    chartInstance.setOption({
      xAxis: {
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
.analysis-page {
  display: flex;
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

/* 左侧导航样式 */
.left-sidebar {
  width: 200px;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-card {
  width: 100%;
}

.menu-card :deep(.el-card__header) {
  padding: 12px 15px;
  background: #f5f7fa;
}

.menu-card :deep(.el-card__body) {
  padding: 0;
}

.menu-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-card .card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.menu-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.menu-item.active {
  background: #409eff;
  color: #fff;
  border-left-color: #409eff;
}

/* 右侧内容区样式 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  min-width: 0;
  overflow: hidden;
}

.filter-card {
  margin-bottom: 10px;
  flex-shrink: 0;
}

.filter-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.chart-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chart-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  flex: 1;
  padding: 20px 0;
  min-height: 0;
}

.chart-container .chart {
  width: 100%;
  min-height: 300px;
  height: 100%;
}

.table-container {
  flex: 1;
  padding: 10px 0;
  overflow: auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .analysis-page {
    flex-direction: column;
  }

  .left-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .menu-list {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 0 10px;
  }

  .menu-item {
    padding: 8px 12px;
    border-left: none;
    border-radius: 4px;
  }

  .menu-item.active {
    border-left: none;
  }

  .filter-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-items {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
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
