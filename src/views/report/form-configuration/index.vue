<template>
  <div class="page-container">
    <div class="header">
      <h2>周月报 / 周月报表单项配置</h2>
      <p class="tip">姓名、日期、手机号等学生基本信息内的字段不需要在这里添加！</p>
    </div>

    <el-tabs v-model="activeTab" class="config-tabs">
      <el-tab-pane label="周报表单配置" name="week">
        <div class="table-wrapper">
          <el-table :data="weekTableData" border stripe>
            <el-table-column prop="name" label="名称" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="请输入名称" />
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="140">
              <template #default="{ row }">
                <el-select v-model="row.type" placeholder="请选择类型">
                  <el-option label="单行输入框" value="input" />
                  <el-option label="多行输入框" value="textarea" />
                  <el-option label="数字输入框" value="number" />
                  <el-option label="图片上传" value="image" />
                  <el-option label="文件上传" value="file" />
                  <el-option label="单选框" value="radio" />
                  <el-option label="复选框" value="checkbox" />
                  <el-option label="下拉选择" value="select" />
                  <el-option label="日期选择" value="date" />
                  <el-option label="地点选择" value="location" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="required" label="是否必填" width="100">
              <template #default="{ row }">
                <el-select v-model="row.required" placeholder="请选择">
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序号" width="90">
              <template #default="{ row }">
                <el-input-number v-model="row.sort" :min="1" :max="999" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column prop="limit" label="最少/最多" width="260">
              <template #default="{ row }">
                <template v-if="row.type === 'textarea'">
                  <el-input-number v-model="row.minLength" :min="0" :max="9999" controls-position="right" size="small" style="width: 80px" />
                  <span> / </span>
                  <el-input-number v-model="row.maxLength" :min="0" :max="9999" controls-position="right" size="small" style="width: 80px" />
                  <span> 字</span>
                </template>
                <template v-else-if="row.type === 'image' || row.type === 'file'">
                  <el-input-number v-model="row.minCount" :min="0" :max="99" controls-position="right" size="small" style="width: 80px" />
                  <span> / </span>
                  <el-input-number v-model="row.maxCount" :min="0" :max="99" controls-position="right" size="small" style="width: 80px" />
                  <span> 张</span>
                </template>
                <template v-else>
                  <span>-</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="填写说明" min-width="180">
              <template #default="{ row }">
                <el-input v-model="row.description" placeholder="请输入填写说明" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row, $index }">
                <el-button type="danger" link @click="handleDeleteWeek(row, $index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="bottom-actions">
          <el-button type="primary" @click="handleAddWeek">添加项</el-button>
          <el-button type="success" @click="handleSaveWeek">保存</el-button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="月报表单配置" name="month">
        <div class="table-wrapper">
          <el-table :data="monthTableData" border stripe>
            <el-table-column prop="name" label="名称" min-width="120">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="请输入名称" />
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="140">
              <template #default="{ row }">
                <el-select v-model="row.type" placeholder="请选择类型">
                  <el-option label="单行输入框" value="input" />
                  <el-option label="多行输入框" value="textarea" />
                  <el-option label="数字输入框" value="number" />
                  <el-option label="图片上传" value="image" />
                  <el-option label="文件上传" value="file" />
                  <el-option label="单选框" value="radio" />
                  <el-option label="复选框" value="checkbox" />
                  <el-option label="下拉选择" value="select" />
                  <el-option label="日期选择" value="date" />
                  <el-option label="地点选择" value="location" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="required" label="是否必填" width="100">
              <template #default="{ row }">
                <el-select v-model="row.required" placeholder="请选择">
                  <el-option label="是" :value="true" />
                  <el-option label="否" :value="false" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序号" width="90">
              <template #default="{ row }">
                <el-input-number v-model="row.sort" :min="1" :max="999" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column prop="limit" label="最少/最多" width="260">
              <template #default="{ row }">
                <template v-if="row.type === 'textarea'">
                  <el-input-number v-model="row.minLength" :min="0" :max="9999" controls-position="right" size="small" style="width: 80px" />
                  <span> / </span>
                  <el-input-number v-model="row.maxLength" :min="0" :max="9999" controls-position="right" size="small" style="width: 80px" />
                  <span> 字</span>
                </template>
                <template v-else-if="row.type === 'image' || row.type === 'file'">
                  <el-input-number v-model="row.minCount" :min="0" :max="99" controls-position="right" size="small" style="width: 80px" />
                  <span> / </span>
                  <el-input-number v-model="row.maxCount" :min="0" :max="99" controls-position="right" size="small" style="width: 80px" />
                  <span> 张</span>
                </template>
                <template v-else>
                  <span>-</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="填写说明" min-width="180">
              <template #default="{ row }">
                <el-input v-model="row.description" placeholder="请输入填写说明" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row, $index }">
                <el-button type="danger" link @click="handleDeleteMonth(row, $index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="bottom-actions">
          <el-button type="primary" @click="handleAddMonth">添加项</el-button>
          <el-button type="success" @click="handleSaveMonth">保存</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('week')

// 周报表单数据
const weekTableData = ref([
  { name: '工作内容', type: 'textarea', required: true, sort: 1, minLength: 50, maxLength: 2000, description: '请详细描述本周工作内容' },
  { name: '工作亮点', type: 'textarea', required: false, sort: 2, minLength: 0, maxLength: 1000, description: '本周工作中的亮点和收获' },
  { name: '遇到问题', type: 'textarea', required: false, sort: 3, minLength: 0, maxLength: 500, description: '工作中遇到的问题' },
  { name: '下周计划', type: 'textarea', required: true, sort: 4, minLength: 20, maxLength: 1000, description: '下周工作计划' },
  { name: '现场照片', type: 'image', required: false, sort: 5, minCount: 0, maxCount: 9, description: '上传工作现场照片' }
])

// 月报表单数据
const monthTableData = ref([
  { name: '月度总结', type: 'textarea', required: true, sort: 1, minLength: 100, maxLength: 5000, description: '本月工作整体总结' },
  { name: '工作成果', type: 'textarea', required: true, sort: 2, minLength: 50, maxLength: 3000, description: '本月完成的主要工作' },
  { name: '不足之处', type: 'textarea', required: false, sort: 3, minLength: 0, maxLength: 1000, description: '需要改进的地方' },
  { name: '下月计划', type: 'textarea', required: true, sort: 4, minLength: 50, maxLength: 2000, description: '下月工作计划' },
  { name: '附件上传', type: 'file', required: false, sort: 5, minCount: 0, maxCount: 5, description: '相关证明材料' }
])

// 添加周报表单项
const handleAddWeek = () => {
  weekTableData.value.push({
    name: '',
    type: 'input',
    required: false,
    sort: weekTableData.value.length + 1,
    minLength: 0,
    maxLength: 0,
    description: ''
  })
}

// 删除周报表单项
const handleDeleteWeek = (row, index) => {
  weekTableData.value.splice(index, 1)
}

// 保存周报表单配置
const handleSaveWeek = () => {
  ElMessage.success('周报表单配置已保存')
}

// 添加月报表单项
const handleAddMonth = () => {
  monthTableData.value.push({
    name: '',
    type: 'input',
    required: false,
    sort: monthTableData.value.length + 1,
    minLength: 0,
    maxLength: 0,
    description: ''
  })
}

// 删除月报表单项
const handleDeleteMonth = (row, index) => {
  monthTableData.value.splice(index, 1)
}

// 保存月报表单配置
const handleSaveMonth = () => {
  ElMessage.success('月报表单配置已保存')
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.tip {
  margin: 0;
  color: #E6A23C;
  font-size: 14px;
}

.config-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.bottom-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
