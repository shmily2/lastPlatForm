<template>
  <Crud
    ref="crudRef"
    :table-columns="tableColumns"
    :table-actions="tableActions"
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
  { prop: 'title', label: '菜单名称', width: 150 },
  { prop: 'icon', label: '图标', width: 120 },
  { prop: 'path', label: '路径', width: 200 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    tag: true,
    tagText: (val) => val === '1' ? '启用' : '禁用'
  },
  { prop: 'createTime', label: '创建时间', width: 180 }
]

// 搜索字段配置
const searchFields = [
  {
    prop: 'title',
    label: '菜单名称',
    type: 'input',
    placeholder: '请输入菜单名称'
  },
  {
    prop: 'path',
    label: '路径',
    type: 'input',
    placeholder: '请输入路径'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: '1' },
      { label: '禁用', value: '0' }
    ]
  }
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
    title: '菜单信息',
    fields: [
      {
        prop: 'title',
        label: '菜单名称',
        type: 'input',
        required: true,
        span: 12
      },
      {
        prop: 'icon',
        label: '图标',
        type: 'input',
        span: 12
      },
      {
        prop: 'path',
        label: '路径',
        type: 'input',
        required: true,
        span: 12
      },
      {
        prop: 'component',
        label: '组件',
        type: 'input',
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
        prop: 'hidden',
        label: '是否隐藏',
        type: 'radio',
        span: 12,
        options: [
          { label: '显示', value: false },
          { label: '隐藏', value: true }
        ]
      },
      {
        prop: 'sort',
        label: '排序',
        type: 'number',
        span: 12
      },
      {
        prop: 'parentId',
        label: '父菜单',
        type: 'select',
        span: 12,
        options: [
          { label: '系统管理', value: 1 },
          { label: '业务管理', value: 2 }
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
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路径', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 详情项配置
const detailItems = [
  { prop: 'id', label: 'ID' },
  { prop: 'title', label: '菜单名称' },
  { prop: 'icon', label: '图标' },
  { prop: 'path', label: '路径' },
  { prop: 'component', label: '组件' },
  { prop: 'status', label: '状态', tag: true, tagText: (val) => val === '1' ? '启用' : '禁用' },
  { prop: 'hidden', label: '是否显示', tag: true, tagText: (val) => (val === true || val === '1') ? '隐藏' : '显示' },
  { prop: 'sort', label: '排序' },
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
            id: 11,
            title: '用户管理',
            icon: 'User',
            path: '/system/user',
            component: 'system/user/index',
            status: '1',
            hidden: false,
            sort: 1,
            createTime: '2024-01-01 10:00:00'
          },
          {
            id: 12,
            title: '角色管理',
            icon: 'UserFilled',
            path: '/system/role',
            component: 'system/role/index',
            status: '1',
            hidden: false,
            sort: 2,
            createTime: '2024-01-01 10:00:00'
          }
        ],
        total: 2
      }
    }
  },
  add: async (data) => {
    console.log('新增菜单:', data)
    return { code: 200, message: '新增成功' }
  },
  update: async (data) => {
    console.log('编辑菜单:', data)
    return { code: 200, message: '编辑成功' }
  },
  delete: async (id) => {
    console.log('删除菜单:', id)
    return { code: 200, message: '删除成功' }
  }
}

const crudRef = ref()
</script>
