<template>
  <div class="dashboard">
    <!-- 顶部导航栏 -->
    <div class="module-nav">
      <div
        v-for="module in modules"
        :key="module.key"
        class="nav-item"
        :class="{ active: activeModule === module.key }"
        @click="activeModule = module.key"
      >
        <el-icon class="nav-icon">
          <component :is="module.icon" />
        </el-icon>
        <span>{{ module.name }}</span>
      </div>
    </div>

    <!-- 核心内容区 -->
    <div class="content-area">
      <el-row :gutter="20">
        <!-- 左侧区域 -->
        <el-col :xs="24" :md="16">
          <!-- 实习概况 -->
          <el-card class="card-item">
            <template #header>
              <div class="card-header">
                <span class="card-title">实习概况</span>
                <el-button type="primary" text>更多</el-button>
              </div>
            </template>
            <div class="overview-charts">
              <div
                v-for="stat in overviewStats"
                :key="stat.key"
                class="chart-item"
              >
                <div class="chart-ring">
                  <svg class="progress-ring" viewBox="0 0 100 100">
                    <circle
                      class="progress-ring__circle-bg"
                      cx="50"
                      cy="50"
                      r="40"
                    />
                    <circle
                      class="progress-ring__circle"
                      :class="{ 'has-progress': stat.value > 0 }"
                      cx="50"
                      cy="50"
                      r="40"
                      :style="{
                        'stroke-dasharray': `${circumference} ${circumference}`,
                        'stroke-dashoffset': circumference - (stat.value / 100) * circumference
                      }"
                    />
                  </svg>
                  <div class="chart-value">{{ stat.value }}%</div>
                </div>
                <div class="chart-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>

          <!-- 通知公告 & 待办事项 -->
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="14">
              <el-card class="card-item">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">通知公告</span>
                    <el-button type="primary" text>更多</el-button>
                  </div>
                </template>
                <div class="notice-list">
                  <div
                    v-for="notice in notices"
                    :key="notice.id"
                    class="notice-item"
                  >
                    <div class="notice-title">{{ notice.title }}</div>
                    <div class="notice-time">{{ notice.time }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="10">
              <el-card class="card-item">
                <template #header>
                  <div class="card-header">
                    <span class="card-title">待办事项</span>
                  </div>
                </template>
                <div class="todo-content">
                  <div class="todo-item">
                    <el-icon class="todo-icon" color="#f56c6c">
                      <Warning />
                    </el-icon>
                    <span>本周有1位学生未提交周报</span>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-col>

        <!-- 右侧区域 -->
        <el-col :xs="24" :md="8">
          <!-- 教师考核 -->
          <el-card class="card-item">
            <template #header>
              <div class="card-header">
                <span class="card-title">教师考核</span>
              </div>
            </template>
            <div class="empty-content">
              <el-empty description="暂无数据" :image-size="80" />
            </div>
          </el-card>

          <!-- 优秀实习生 -->
          <el-card class="card-item" style="margin-top: 20px">
            <template #header>
              <div class="card-header">
                <span class="card-title">优秀实习生</span>
              </div>
            </template>
            <div class="empty-content">
              <el-empty description="暂未展示" :image-size="80" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 底部预警模块 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :span="24">
          <el-card class="card-item">
            <template #header>
              <div class="card-header">
                <span class="card-title">预警</span>
              </div>
            </template>
            <div class="warning-content">
              <div class="warning-filters">
                <el-select v-model="warningType" placeholder="全部" style="width: 150px">
                  <el-option label="全部" value="" />
                  <el-option label="周报未提交" value="week" />
                  <el-option label="月报未提交" value="month" />
                  <el-option label="打卡异常" value="clock" />
                </el-select>
                <el-select v-model="warningTarget" placeholder="请选择" style="width: 150px; margin-left: 10px">
                  <el-option label="全部" value="" />
                  <el-option label="学生" value="student" />
                  <el-option label="教师" value="teacher" />
                </el-select>
              </div>
              <el-button type="primary" class="warning-export">导出明细信息</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 右下角悬浮按钮 -->
    <div class="floating-btn">
      <el-icon :size="24">
        <Menu />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  Reading,
  Document,
  Calendar,
  Stopwatch,
  Briefcase,
  List,
  Sunny,
  Menu,
  Warning
} from '@element-plus/icons-vue'

// 模块导航
const modules = [
  { key: 'patrol', name: '巡访', icon: Reading },
  { key: 'weekly', name: '周报', icon: Document },
  { key: 'monthly', name: '月报', icon: Document },
  { key: 'clock', name: '打卡', icon: Stopwatch },
  { key: 'internship', name: '实习', icon: Briefcase },
  { key: '91job', name: '91JOB', icon: List },
  { key: '24365', name: '24365', icon: Sunny }
]

const activeModule = ref('internship')

// 环形进度图数据
const circumference = 2 * Math.PI * 40
const overviewStats = [
  { key: 'clock', label: '打卡率', value: 0 },
  { key: 'internship', label: '实习率', value: 50 },
  { key: 'monthAudit', label: '本月月报审核率', value: 0 },
  { key: 'monthRectify', label: '本月月报整改率', value: 0 },
  { key: 'weekAudit', label: '上周周报审核率', value: 0 },
  { key: 'weekRectify', label: '上周周报整改率', value: 0 }
]

// 通知公告数据
const notices = [
  {
    id: 1,
    title: '2026江苏无锡市第五人民医院编外人员招聘1人公告',
    time: '2026-03-06'
  },
  {
    id: 2,
    title: '2026江苏南通大学附属医院招聘2人公告',
    time: '2026-03-05'
  },
  {
    id: 3,
    title: '关于2026年春季实习安排的通知',
    time: '2026-03-04'
  },
  {
    id: 4,
    title: '实习月报提交截止时间提醒',
    time: '2026-03-03'
  }
]

// 预警筛选
const warningType = ref('')
const warningTarget = ref('')
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

/* 顶部导航栏 */
.module-nav {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  padding: 0;
  margin-bottom: 25px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px 10px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eaec;
  height: 100px;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #66b1ff);
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.15);
  border-color: #409eff;
}

.nav-item:hover::before {
  opacity: 1;
}

.nav-item.active {
  background: linear-gradient(135deg, #409eff 0%, #53a8ff 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
}

.nav-item.active::before {
  opacity: 0;
}

.nav-icon {
  font-size: 28px;
  transition: transform 0.3s;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-item.active .nav-icon {
  transform: scale(1.15);
}

/* 内容区域 */
.content-area {
  margin-bottom: 20px;
}

/* 卡片样式 */
.card-item {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

/* 实习概况 - 环形图 */
.overview-charts {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-ring {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring__circle-bg {
  fill: none;
  stroke: #e4e7ed;
  stroke-width: 8;
}

.progress-ring__circle {
  fill: none;
  stroke: #e4e7ed;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-ring__circle.has-progress {
  stroke: #409eff;
}

.chart-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.chart-label {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
  text-align: center;
  max-width: 120px;
  line-height: 1.4;
}

/* 通知公告 */
.notice-list {
  max-height: 300px;
  overflow-y: auto;
}

.notice-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

/* 待办事项 */
.todo-content {
  padding: 10px 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #fef0f0;
  border-radius: 6px;
  font-size: 14px;
  color: #f56c6c;
}

.todo-icon {
  font-size: 20px;
  flex-shrink: 0;
}

/* 空内容 */
.empty-content {
  padding: 30px 0;
}

/* 预警模块 */
.warning-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.warning-filters {
  display: flex;
  align-items: center;
}

.warning-export {
  margin-left: auto;
}

/* 悬浮按钮 */
.floating-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 50px;
  height: 50px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s;
  z-index: 1000;
}

.floating-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
}

/* 响应式 */
@media (max-width: 1200px) {
  .module-nav {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .module-nav {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .nav-item {
    height: 90px;
    padding: 15px 8px;
    font-size: 13px;
  }

  .nav-icon {
    font-size: 24px;
  }

  .overview-charts {
    justify-content: flex-start;
  }

  .warning-content {
    flex-direction: column;
    gap: 15px;
  }

  .warning-export {
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .module-nav {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
