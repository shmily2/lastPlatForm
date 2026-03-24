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
        <el-button type="primary" link>编辑</el-button>
        <el-button type="danger" link>删除</el-button>
      </template>
    </Crud>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Crud from '@/components/Crud/index.vue'

const crudRef = ref(null)
const searchFields = [
  { prop: 'keyword', label: '关键词', type: 'input', placeholder: '请输入关键词' }
]
const tableColumns = [
  { prop: 'studentId', label: '学号', width: 120, align: 'center' },
  { prop: 'name', label: '姓名', width: 100, align: 'center' },
  { prop: 'className', label: '班级', width: 120, align: 'center' },
  { prop: 'phone', label: '电话', width: 120, align: 'center' },
  { prop: 'createTime', label: '创建时间', minWidth: 160, align: 'center' }
]
const apiConfig = { list: '/api/record/student/list' }
const handleAdd = () => {}
</script>
