<template>
  <Crud
    ref="crudRef"
    :search-fields="searchFields"
    :table-columns="tableColumns"
    :table-actions="tableActions"
    :form-fields="formFields"
    :form-rules="formRules"
    :detail-items="detailItems"
    :api="api"
    @add="handleAdd"
    @edit="handleEdit"
    @delete="handleDelete"
    @batch-delete="handleBatchDelete"
  />
</template>

<script setup>
import { ref, h } from 'vue'
import Crud from '@/components/Crud/index.vue'

// 搜索字段
const searchFields = [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' }
    ]
  }
]

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'username', label: '用户名', width: 150 },
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'role', label: '角色', width: 120 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    tag: true,
    tagText: (val) => val === '1' ? '启用' : '禁用'
  },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 表格操作按钮配置
const tableActions = {
  view: false,
  edit: true,
  delete: true
}

// 表单字段
const formFields = [
  {
    title: '基本信息',
    fields: [
      {
        prop: 'username',
        label: '用户名',
        type: 'input',
        required: true,
        span: 12
      },
      {
        prop: 'name',
        label: '姓名',
        type: 'input',
        required: true,
        span: 12
      },
      {
        prop: 'password',
        label: '密码',
        type: 'input',
        inputType: 'password',
        required: true,
        span: 12
      },
      {
        prop: 'role',
        label: '角色',
        type: 'select',
        required: true,
        span: 12,
        options: [
          { label: '管理员', value: 'admin' },
          { label: '普通用户', value: 'user' }
        ]
      },
      {
        prop: 'status',
        label: '状态',
        type: 'radio',
        required: true,
        span: 12,
        options: [
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' }
        ]
      },
      {
        prop: 'remark',
        label: '备注',
        type: 'textarea',
        span: 24,
        rows: 3
      }
    ]
  }
]

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 详情项配置
const detailItems = [
  { prop: 'id', label: 'ID' },
  { prop: 'username', label: '用户名' },
  { prop: 'name', label: '姓名' },
  { prop: 'role', label: '角色' },
  { prop: 'status', label: '状态', tag: true, tagText: (val) => val === '1' ? '启用' : '禁用' },
  { prop: 'remark', label: '备注' },
  { prop: 'createTime', label: '创建时间' }
]

// API 方法（模拟）
const api = {
  list: async (params) => {
    // 模拟 API 调用
    return {
      data: {
        list: [
          {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin',
            status: '1',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: 2,
            username: 'user',
            name: '普通用户',
            role: 'user',
            status: '1',
            createTime: '2024-01-02 10:00:00'
          }
        ],
        total: 2
      }
    }
  },
  add: async (data) => {
    console.log('新增用户:', data)
    return { code: 200, message: '新增成功' }
  },
  update: async (data) => {
    console.log('编辑用户:', data)
    return { code: 200, message: '编辑成功' }
  },
  delete: async (id) => {
    console.log('删除用户:', id)
    return { code: 200, message: '删除成功' }
  }
}

const crudRef = ref()

const handleAdd = () => {
  console.log('新增用户')
}

const handleEdit = (row) => {
  console.log('编辑用户:', row)
}

const handleDelete = (row) => {
  console.log('删除用户:', row)
}

const handleBatchDelete = (rows) => {
  console.log('批量删除用户:', rows)
}
</script>
