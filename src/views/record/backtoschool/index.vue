<template>
  <div class="page-container">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="false"
      :table-actions="{}"
      :actions="{}"
      :page-sizes="[10, 20, 50, 100]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Crud from '@/components/Crud/index.vue'

const crudRef = ref(null)

// 模拟数据
const mockData = [
  {
    id: 1,
    studentName: '张三',
    className: '20艺术1班',
    returnTime: '2026-03-15 00:00:00',
    creator: '王老师',
    createTime: '2026-03-15 10:30:00'
  },
  {
    id: 2,
    studentName: '李小红',
    className: '20艺术1班',
    returnTime: '2026-03-15 00:00:00',
    creator: '王老师',
    createTime: '2026-03-15 10:35:00'
  },
  {
    id: 3,
    studentName: '王五',
    className: '20会计2班',
    returnTime: '2026-03-16 00:00:00',
    creator: '李老师',
    createTime: '2026-03-16 09:20:00'
  },
  {
    id: 4,
    studentName: '赵六',
    className: '20会计2班',
    returnTime: '2026-03-16 00:00:00',
    creator: '李老师',
    createTime: '2026-03-16 09:25:00'
  },
  {
    id: 5,
    studentName: '孙七',
    className: '20计算机3班',
    returnTime: '2026-03-17 00:00:00',
    creator: '张老师',
    createTime: '2026-03-17 11:10:00'
  }
]

// 搜索字段
const searchFields = [
  {
    prop: 'organization',
    label: '组织架构',
    type: 'organizational',
    span: 4
  },
  {
    prop: 'studentName',
    label: '学生姓名',
    type: 'input',
    span: 4,
    placeholder: '请输入学生姓名'
  },
  {
    prop: 'returnTime',
    label: '返校时间',
    type: 'date',
    span: 4,
    placeholder: '请选择返校时间'
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'studentName', label: '学生姓名', width: 120, align: 'center' },
  { prop: 'className', label: '班级', width: 150, align: 'center' },
  { prop: 'returnTime', label: '返校时间', minWidth: 180, align: 'center' },
  { prop: 'creator', label: '创建人', width: 120, align: 'center' },
  { prop: 'createTime', label: '创建时间', minWidth: 180, align: 'center' }
]

// API配置 - 使用模拟数据
const apiConfig = {
  list: (params) => {
    let result = [...mockData]
    // 搜索过滤
    if (params.className) {
      result = result.filter(item => item.className === params.className)
    }
    if (params.studentName) {
      result = result.filter(item => item.studentName.includes(params.studentName))
    }
    if (params.returnTime) {
      result = result.filter(item => item.returnTime.startsWith(params.returnTime))
    }
    // 分页
    const pageNum = params.pageNum || 1
    const pageSize = params.pageSize || 10
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    return {
      code: 200,
      data: {
        list: result.slice(start, end),
        total: result.length
      }
    }
  }
}

// 搜索
const handleSearch = (params) => {
  console.log('搜索参数:', params)
}

// 刷新
const handleRefresh = () => {
  console.log('刷新列表')
  crudRef.value?.refresh()
}
</script>
