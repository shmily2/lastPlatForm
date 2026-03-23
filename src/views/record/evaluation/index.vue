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
    >
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">新增</el-button>
      </template>
      <template #actions="{ row }">
        <el-button type="primary" link>查看</el-button>
        <el-button type="success" link>审核</el-button>
      </template>
    </Crud>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Crud from '@/components/Crud/index.vue'

const crudRef = ref(null)
const searchFields = [
  { prop: 'studentName', label: '学生姓名', type: 'input', placeholder: '请输入学生姓名' }
]
const tableColumns = [
  { prop: 'studentId', label: '学号', width: 120, align: 'center' },
  { prop: 'studentName', label: '学生姓名', width: 100, align: 'center' },
  { prop: 'className', label: '班级', width: 120, align: 'center' },
  { prop: 'companyName', label: '实习单位', minWidth: 150, align: 'center' },
  { prop: 'submitTime', label: '提交时间', minWidth: 160, align: 'center' },
  { prop: 'status', label: '状态', width: 100, align: 'center', tag: true }
]
const apiConfig = { list: '/api/record/evaluation/list' }
const handleAdd = () => {}
</script>
<style scoped>.page-container{padding:20px}</style>
