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
  { prop: 'title', label: '标题', type: 'input', placeholder: '请输入标题' }
]
const tableColumns = [
  { prop: 'title', label: '标题', minWidth: 200, align: 'left' },
  { prop: 'author', label: '作者', width: 100, align: 'center' },
  { prop: 'createTime', label: '创建时间', minWidth: 160, align: 'center' }
]
const apiConfig = { list: '/api/record/case/list' }
const handleAdd = () => {}
</script>
<style scoped>.page-container{padding:20px}</style>
