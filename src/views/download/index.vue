<template>
  <div class="page-container">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="false"
      :actions="{}"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
    >
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleDownload(row)">下载</el-button>
      </template>
    </Crud>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Crud from '@/components/Crud/index.vue'

const crudRef = ref(null)

const searchFields = [
  { prop: 'name', label: '文件名', type: 'input', placeholder: '请输入文件名' }
]

const tableColumns = [
  { prop: 'name', label: '文件名', minWidth: 200, align: 'left' },
  { prop: 'type', label: '文件类型', width: 100, align: 'center' },
  { prop: 'size', label: '文件大小', width: 100, align: 'center' },
  { prop: 'createTime', label: '更新时间', minWidth: 160, align: 'center' }
]

const apiConfig = { list: '/api/download/list' }

const handleDownload = (row) => {
  ElMessage.success('开始下载: ' + row.name)
}
</script>

<style scoped>
.page-container { padding: 20px; }
</style>
