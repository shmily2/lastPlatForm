<template>
  <div class="menu-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">菜单管理</h2>
    </div>

    <!-- 主体内容 -->
    <el-card class="content-card">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd(null)">
          新增
        </el-button>
      </div>

      <!-- 菜单树形表格 -->
      <el-table
        :data="filterMenuData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        stripe
        default-expand-all
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="title" label="名称" min-width="200">
          <template #default="{ row }">
            <span class="menu-icon">
              <el-icon v-if="row.icon">
                <component :is="getIcon(row.icon)" />
              </el-icon>
            </span>
            <span class="menu-name">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'directory' ? 'primary' : 'success'" size="small">
              {{ row.type === 'directory' ? '目录' : '页面' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="150" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleAdd(row)">
              新增
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="上级菜单" v-if="formData.parentTitle">
          <el-input :value="formData.parentTitle" disabled />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio value="directory">目录</el-radio>
            <el-radio value="page">页面</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-select v-model="formData.icon" placeholder="请选择图标" clearable>
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <span style="display: flex; align-items: center; gap: 8px">
                <el-icon><component :is="icon.value" /></el-icon>
                <span>{{ icon.label }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="formData.path" placeholder="请输入路由路径，如 /home" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="formData.type === 'page'">
          <el-input v-model="formData.component" placeholder="请输入组件路径，如 home/index" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="hidden">
          <el-radio-group v-model="formData.hidden">
            <el-radio :value="false">显示</el-radio>
            <el-radio :value="true">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled, List, Document, Calendar, FirstAidKit,
  Setting, TrendCharts, DataAnalysis, User, UserFilled,
  Menu, Tickets, Goods, OfficeBuilding, Location,
  Star, CircleCheck, Warning, InfoFilled
} from '@element-plus/icons-vue'

// 图标选项
const iconOptions = [
  { label: '首页', value: 'HomeFilled' },
  { label: '列表', value: 'List' },
  { label: '文档', value: 'Document' },
  { label: '日历', value: 'Calendar' },
  { label: '医疗', value: 'FirstAidKit' },
  { label: '设置', value: 'Setting' },
  { label: '趋势', value: 'TrendCharts' },
  { label: '分析', value: 'DataAnalysis' },
  { label: '用户', value: 'User' },
  { label: '用户填充', value: 'UserFilled' },
  { label: '菜单', value: 'Menu' },
  { label: '票据', value: 'Tickets' },
  { label: '商品', value: 'Goods' },
  { label: '建筑', value: 'OfficeBuilding' },
  { label: '位置', value: 'Location' },
  { label: '星星', value: 'Star' },
  { label: '勾选', value: 'CircleCheck' },
  { label: '警告', value: 'Warning' },
  { label: '信息', value: 'InfoFilled' }
]

// 图标映射
const iconMap = {
  HomeFilled, List, Document, Calendar, FirstAidKit,
  Setting, TrendCharts, DataAnalysis, User, UserFilled,
  Menu, Tickets, Goods, OfficeBuilding, Location,
  Star, CircleCheck, Warning, InfoFilled
}

// 获取图标组件
const getIcon = (iconName) => {
  return iconMap[iconName] || null
}

// 菜单数据
const menuData = ref([
  {
    id: 1,
    title: '实习系统',
    type: 'directory',
    path: '/internship',
    icon: 'FirstAidKit',
    sort: 1,
    hidden: false,
    children: [
      {
        id: 11,
        title: '首页',
        type: 'page',
        path: '/home',
        icon: 'HomeFilled',
        sort: 1,
        hidden: false
      },
      {
        id: 12,
        title: '实习申请',
        type: 'directory',
        path: '/apply',
        icon: 'Document',
        sort: 0,
        hidden: false,
        children: [
          {
            id: 121,
            title: '实习审批',
            type: 'page',
            path: '/shixisp',
            icon: 'CircleCheck',
            sort: 1,
            hidden: false
          }
        ]
      },
      {
        id: 13,
        title: '学生请假',
        type: 'directory',
        path: '/leave',
        icon: 'Calendar',
        sort: 1,
        hidden: false,
        children: [
          {
            id: 131,
            title: '学生请假',
            type: 'page',
            path: '/stuleave',
            icon: 'Calendar',
            sort: 1,
            hidden: false
          }
        ]
      },
      {
        id: 14,
        title: '打卡管理',
        type: 'directory',
        path: '/sign',
        icon: 'Location',
        sort: 2,
        hidden: false,
        children: [
          {
            id: 141,
            title: '打卡详情',
            type: 'page',
            path: '/stu_sign',
            icon: 'Location',
            sort: 1,
            hidden: false
          },
          {
            id: 142,
            title: '打卡统计',
            type: 'page',
            path: '/data dk',
            icon: 'DataAnalysis',
            sort: 2,
            hidden: false
          },
          {
            id: 143,
            title: '打卡日配置',
            type: 'page',
            path: '/workday',
            icon: 'Setting',
            sort: 4,
            hidden: false
          }
        ]
      },
      {
        id: 15,
        title: '实习报告',
        type: 'directory',
        path: '/report',
        icon: 'Document',
        sort: 1,
        hidden: false,
        children: [
          {
            id: 151,
            title: '周报',
            type: 'page',
            path: '/reportWeek',
            icon: 'Document',
            sort: 2,
            hidden: false
          },
          {
            id: 152,
            title: '月报',
            type: 'page',
            path: '/reportMonth',
            icon: 'Document',
            sort: 3,
            hidden: false
          },
          {
            id: 153,
            title: '周月报表单配置',
            type: 'page',
            path: '/reportForm',
            icon: 'Setting',
            sort: 4,
            hidden: false
          }
        ]
      },
      {
        id: 16,
        title: '巡访记录',
        type: 'directory',
        path: '/visit',
        icon: 'Location',
        sort: 1,
        hidden: false,
        children: [
          {
            id: 161,
            title: '巡访列表',
            type: 'page',
            path: '/xflist',
            icon: 'List',
            sort: 2,
            hidden: false
          },
          {
            id: 162,
            title: '巡访审批',
            type: 'page',
            path: '/xfsp',
            icon: 'CircleCheck',
            sort: 1,
            hidden: false
          },
          {
            id: 163,
            title: '审批配置',
            type: 'page',
            path: '/xfconfig',
            icon: 'Setting',
            sort: 5,
            hidden: false
          }
        ]
      },
      {
        id: 17,
        title: '数据分析',
        type: 'directory',
        path: '/analysis',
        icon: 'TrendCharts',
        sort: 1,
        hidden: false
      }
    ]
  }
])

// 过滤后的数据
const filterMenuData = computed(() => {
  return menuData.value
})

// 弹框
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const formRef = ref(null)
const formData = reactive({
  id: '',
  parentId: '',
  parentTitle: '',
  title: '',
  type: 'page',
  icon: '',
  path: '',
  component: '',
  sort: 0,
  hidden: false
})

// 表单校验规则
const formRules = {
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ]
}

// 新增
const handleAdd = (parent) => {
  dialogTitle.value = parent ? '新增子菜单' : '新增菜单'
  formData.id = ''
  formData.parentId = parent?.id || ''
  formData.parentTitle = parent?.title || ''
  formData.title = ''
  formData.type = 'page'
  formData.icon = ''
  formData.path = ''
  formData.component = ''
  formData.sort = parent?.children?.length ? parent.children.length + 1 : 1
  formData.hidden = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑菜单'
  formData.id = row.id
  formData.parentId = row.parentId || ''
  formData.parentTitle = row.parentTitle || ''
  formData.title = row.title
  formData.type = row.type
  formData.icon = row.icon
  formData.path = row.path
  formData.component = row.component || ''
  formData.sort = row.sort
  formData.hidden = row.hidden
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除菜单"${row.title}"吗？${row.children ? '（该菜单下有子菜单，将被一并删除）' : ''}`,
    '提示',
    { type: 'warning' }
  ).then(() => {
    const deleteNode = (data, id) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
          data.splice(i, 1)
          return true
        }
        if (data[i].children) {
          if (deleteNode(data[i].children, id)) {
            return true
          }
        }
      }
      return false
    }
    deleteNode(menuData.value, row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (formData.id) {
    // 编辑
    const updateNode = (data) => {
      for (const item of data) {
        if (item.id === formData.id) {
          Object.assign(item, {
            title: formData.title,
            type: formData.type,
            icon: formData.icon,
            path: formData.path,
            component: formData.component,
            sort: formData.sort,
            hidden: formData.hidden
          })
          return true
        }
        if (item.children) {
          if (updateNode(item.children)) return true
        }
      }
      return false
    }
    updateNode(menuData.value)
  } else {
    // 新增
    const newNode = {
      id: Date.now(),
      title: formData.title,
      type: formData.type,
      icon: formData.icon,
      path: formData.path,
      component: formData.component,
      sort: formData.sort,
      hidden: formData.hidden,
      children: formData.type === 'directory' ? [] : undefined
    }

    if (formData.parentId) {
      const addToParent = (data) => {
        for (const item of data) {
          if (item.id === formData.parentId) {
            if (!item.children) item.children = []
            item.children.push(newNode)
            return true
          }
          if (item.children) {
            if (addToParent(item.children)) return true
          }
        }
        return false
      }
      addToParent(menuData.value)
    } else {
      menuData.value.push(newNode)
    }
  }

  ElMessage.success(dialogTitle.value + '成功')
  dialogVisible.value = false
}

onMounted(() => {
  // 设置父级名称
  const setParentName = (data, parentName = '') => {
    for (const item of data) {
      item.parentTitle = parentName
      if (item.children) {
        setParentName(item.children, item.title)
      }
    }
  }
  setParentName(menuData.value)
})
</script>

<style scoped>
.menu-page {
  padding: 10px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.content-card {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
}

.content-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  margin-bottom: 15px;
  flex-shrink: 0;
}

.content-card :deep(.el-table) {
  flex: 1;
}

.menu-icon {
  display: inline-flex;
  align-items: center;
  margin-right: 5px;
  color: #909399;
}

.menu-name {
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
</style>
