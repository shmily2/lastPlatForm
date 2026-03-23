<template>
  <div class="page-container">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
    >
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </template>

      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>
    </Crud>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'

const crudRef = ref(null)

const searchFields = [
  { prop: 'studentName', label: '学生姓名', type: 'input', placeholder: '请输入学生姓名' }
]

const tableColumns = [
  { prop: 'studentId', label: '学号', width: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', width: 100, align: 'center' },
  { prop: 'className', label: '班级', width: 120, align: 'center' },
  { prop: 'checkTime', label: '抽查时间', minWidth: 160, align: 'center' },
  { prop: 'checker', label: '抽查人', width: 100, align: 'center' },
  { prop: 'status', label: '抽查状态', width: 100, align: 'center', tag: true }
]

const apiConfig = {
  list: '/api/record/check/list'
}

const handleSearch = (params) => console.log('搜索:', params)
const handleRefresh = () => crudRef.value?.refresh()
const handleAdd = () => ElMessage.info('新增功能')
const handleEdit = (row) => ElMessage.info('编辑: ' + row.studentName)
const handleDelete = (row) => {
  ElMessageBox.confirm('确定删除？', '提示', { type: 'warning' })
    .then(() => { ElMessage.success('删除成功'); crudRef.value?.refresh() })
    .catch(() => {})
}
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
