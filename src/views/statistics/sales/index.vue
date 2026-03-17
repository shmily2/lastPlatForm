<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>销售统计</span>
      </div>
    </template>

    <div class="stats-container">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-cards">
        <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">总销售额</div>
              <div class="stat-value">¥{{ stats.totalSales }}</div>
              <div class="stat-trend positive">↑ 12.5%</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">订单数量</div>
              <div class="stat-value">{{ stats.orderCount }}</div>
              <div class="stat-trend positive">↑ 8.3%</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">客户数量</div>
              <div class="stat-value">{{ stats.customerCount }}</div>
              <div class="stat-trend negative">↓ 3.2%</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-label">平均客单价</div>
              <div class="stat-value">¥{{ stats.avgPrice }}</div>
              <div class="stat-trend positive">↑ 5.1%</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts">
        <el-col :xs="24" :md="16" :lg="16" :xl="16">
          <el-card>
            <template #header>
              <div>销售趋势</div>
            </template>
            <div class="chart-placeholder">
              <el-empty description="图表区域 - 可以集成 ECharts" />
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8" :lg="8" :xl="8">
          <el-card>
            <template #header>
              <div>分类占比</div>
            </template>
            <div class="chart-placeholder">
              <el-empty description="图表区域 - 可以集成 ECharts" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 详细数据 -->
      <el-row :gutter="20" class="detail-data">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div>销售明细</div>
            </template>
            <Crud
              :search-fields="searchFields"
              :table-columns="tableColumns"
              :api="api"
              :show-actions="false"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import Crud from '@/components/Crud/index.vue'

// 统计数据
const stats = ref({
  totalSales: '1,234,567.89',
  orderCount: '12,345',
  customerCount: '6,789',
  avgPrice: '100.00'
})

// 搜索字段
const searchFields = [
  {
    prop: 'productName',
    label: '商品名称',
    type: 'input',
    placeholder: '请输入商品名称'
  },
  {
    prop: 'dateRange',
    label: '日期范围',
    type: 'daterange'
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'productName', label: '商品名称', width: 150 },
  {
    prop: 'sales',
    label: '销售额',
    width: 120,
    formatter: (val) => `¥${val}`
  },
  { prop: 'quantity', label: '销量', width: 100 },
  { prop: 'category', label: '分类', width: 120 },
  { prop: 'date', label: '日期', width: 180 }
]

// API 方法（模拟）
const api = {
  list: async (params) => {
    return {
      data: {
        list: [
          {
            productName: '商品A',
            sales: '99.00',
            quantity: 10,
            category: '电子产品',
            date: '2024-01-01'
          },
          {
            productName: '商品B',
            sales: '199.00',
            quantity: 5,
            category: '服装',
            date: '2024-01-02'
          }
        ],
        total: 2
      }
    }
  }
}
</script>

<style scoped>
.card-header {
  font-size: 16px;
  font-weight: bold;
}

.stats-container {
  padding: 20px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .stats-container {
    padding: 10px;
  }
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

/* 移动端字体调整 */
@media (max-width: 768px) {
  .stat-value {
    font-size: 20px;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.stat-trend {
  font-size: 14px;
}

.stat-trend.positive {
  color: #67c23a;
}

.stat-trend.negative {
  color: #f56c6c;
}

.charts {
  margin-bottom: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 移动端图表高度调整 */
@media (max-width: 768px) {
  .chart-placeholder {
    height: 200px;
  }
}

.detail-data {
  margin-bottom: 20px;
}
</style>
