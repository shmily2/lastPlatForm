<template>
  <Crud
    ref="crudRef"
    :table-columns="tableColumns"
    :search-fields="searchFields"
    :form-fields="formFields"
    :form-rules="formRules"
    :detail-items="detailItems"
    :api="api"
  />
</template>

<script setup>
import { ref } from 'vue'
import Crud from '@/components/Crud/index.vue'

// 表格列配置
const tableColumns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'roleName', label: '角色名称', width: 150 },
  { prop: 'roleKey', label: '角色标识', width: 150 },
  { prop: 'remark', label: '备注' },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  {
    prop: 'roleName',
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称'
  },
  {
    prop: 'roleKey',
    label: '角色标识',
    type: 'input',
    placeholder: '请输入角色标识'
  }
]

// 表单字段
const formFields = [
  {
    title: '角色信息',
    fields: [
      {
        prop: 'roleName',
        label: '角色名称',
        type: 'input',
        required: true,
        span: 12
      },
      {
        prop: 'roleKey',
        label: '角色标识',
        type: 'input',
        required: true,
        span: 12
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
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  roleKey: [
    { required: true, message: '请输入角色标识', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 详情项配置
const detailItems = [
  { prop: 'id', label: 'ID' },
  { prop: 'roleName', label: '角色名称' },
  { prop: 'roleKey', label: '角色标识' },
  { prop: 'status', label: '状态', tag: true, tagText: (val) => val === '1' ? '启用' : '禁用' },
  { prop: 'remark', label: '备注' },
  { prop: 'createTime', label: '创建时间' }
]

// API 方法（模拟）
const api = {
  list: async (params) => {
    return {
      data: {
        list: [
          {
            id: 1,
            roleName: '管理员',
            roleKey: 'admin',
            remark: '拥有所有权限',
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: 2,
            roleName: '普通用户',
            roleKey: 'user',
            remark: '普通用户权限',
            createTime: '2024-01-02 10:00:00'
          }
        ],
        total: 2
      }
    }
  },
  add: async (data) => {
    console.log('新增角色:', data)
    return { code: 200, message: '新增成功' }
  },
  update: async (data) => {
    console.log('编辑角色:', data)
    return { code: 200, message: '编辑成功' }
  },
  delete: async (id) => {
    console.log('删除角色:', id)
    return { code: 200, message: '删除成功' }
  }
}

const crudRef = ref()
</script>
