<template>
  <div class="crud-container">
    <!-- 搜索表单 -->
    <div  v-if="showSearch" class="search-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        :inline="true"
        label-width="auto"
      >
        <el-row :gutter="20">
          <el-col
            v-for="field in searchFields"
            :key="field.prop"
            :xs="24"
            :sm="12"
            :md="field.span || 8"
            :lg="field.span || 6"
            :xl="field.span || 6"
          >
            <el-form-item :prop="field.prop">
              <!-- 输入框 -->
              <el-input
                v-if="field.type === 'input'"
                v-model="searchForm[field.prop]"
                :placeholder="field.placeholder || `请输入${field.label}`"
                clearable
                @keyup.enter="handleSearch"
                style="width: 100%"
              />
              <!-- 选择器 -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="searchForm[field.prop]"
                :placeholder="field.placeholder || `请选择${field.label}`"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            <!-- 组织架构 -->
              <el-tree-select
                v-else-if="field.type === 'organizational'"
                v-model="searchForm[field.prop]"
                :data="orgTree"
                placeholder="请搜索组织架构"
                clearable
                filterable
                check-strictly
                :render-after-expand="false"
                style="width: 100%"
              />
              <!-- 日期类选择器（日期、月、周、范围） -->
              <el-date-picker
                v-else-if="['date', 'month', 'week', 'daterange', 'datetimerange'].includes(field.type)"
                v-model="searchForm[field.prop]"
                :type="field.type"
                :format="field.type === 'week' ? 'YYYY年第w周' : field.format"
                :placeholder="field.placeholder || `请选择${field.label}`"
                :range-separator="field.rangeSeparator || '至'"
                :start-placeholder="field.startPlaceholder || '开始日期'"
                :end-placeholder="field.endPlaceholder || '结束日期'"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <!-- 搜索重置按钮自动适应在同一行 -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch">
                搜索
              </el-button>
              <el-button :icon="Refresh" @click="handleReset">
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 操作按钮 -->
    <el-card class="table-card">
      <div class="table-operations">
          <el-button
          v-if="actions.add"
          type="primary"
          :icon="Plus"
          @click="handleAdd"
        >
          新增
        </el-button>
        <el-button
          v-if="actions.batchDelete"
          type="danger"
          :icon="Delete"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button
          v-if="actions.export"
          type="success"
          :icon="Download"
          @click="handleExport"
        >
          导出
        </el-button>
        <el-button
          v-if="actions.refresh"
          :icon="Refresh"
          @click="handleRefresh"
        >
          刷新
        </el-button>
          <slot name="extra-operations" :selected-rows="selectedRows" />
      </div>

      <!-- 表格 -->
      <BaseTable
        ref="tableRef"
        :table-data="tableData"
        :columns="tableColumns"
        :loading="loading"
        :selection="actions.batchDelete"
        :show-index="showIndex"
        :show-actions="showActions"
        :action-width="actionWidth"
        :action-min-width="actionMinWidth"
        :actions="tableActions"
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        @selection-change="handleSelectionChange"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        <!-- 自定义列插槽 -->
        <template
          v-for="column in tableColumns"
          #[column.slot]="scope"
          :key="column.slot"
        >
          <slot
            :name="column.slot"
            v-bind="scope"
          />
        </template>

        <!-- 自定义操作按钮 -->
        <template #actions="{ row }">
          <slot name="actions" :row="row" />
        </template>
      </BaseTable>
    </el-card>

    <!-- 新增/编辑弹框 -->
    <BaseDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="dialogWidth"
      :show-form="true"
      :form-fields="formFields"
      :form-rules="formRules"
      :form-data="formData"
      :loading="dialogLoading"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    />

    <!-- 查看详情弹框 -->
    <BaseDialog
      v-model="detailVisible"
      title="查看详情"
      :width="detailWidth"
      :show-footer="false"
    >
      <BaseDetail :data="detailData" :items="detailItems" />
    </BaseDialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Download } from '@element-plus/icons-vue'
import BaseTable from '../Table/index.vue'
import BaseDialog from '../Dialog/index.vue'
import BaseDetail from '../Detail/index.vue'
import { getOrgTree } from '@/mock/index'
const props = defineProps({
  // 是否显示搜索
  showSearch: {
    type: Boolean,
    default: true
  },
  // 搜索字段配置
  searchFields: {
    type: Array,
    default: () => []
  },
  // 表格列配置
  tableColumns: {
    type: Array,
    required: true
  },
  // 表格操作按钮配置
  tableActions: {
    type: Object,
    default: () => ({
      view: true,
      edit: true,
      delete: true
    })
  },
  // 是否显示序号
  showIndex: {
    type: Boolean,
    default: true
  },
  // 是否显示操作列
  showActions: {
    type: Boolean,
    default: true
  },
  // 操作列宽度
  actionWidth: {
    type: Number,
    default: undefined
  },
  // 操作列最小宽度
  actionMinWidth: {
    type: Number,
    default: 150
  },
  // 顶部操作按钮配置
  actions: {
    type: Object,
    default: () => ({
      add: true,
      batchDelete: true,
      export: true,
      refresh: true
    })
  },
  // 表单字段配置
  formFields: {
    type: Array,
    default: () => []
  },
  // 表单验证规则
  formRules: {
    type: Object,
    default: () => ({})
  },
  // 详情项配置
  detailItems: {
    type: Array,
    default: () => []
  },
  // 弹框宽度
  dialogWidth: {
    type: String,
    default: '600px'
  },
  // 详情弹框宽度
  detailWidth: {
    type: String,
    default: '800px'
  },
  // API方法
  api: {
    type: Object,
    default: () => ({
      list: null,
      add: null,
      update: null,
      delete: null,
      export: null
    })
  }
})

const emit = defineEmits([
  'add',
  'edit',
  'delete',
  'view',
  'batch-delete',
  'export',
  'search',
  'refresh'
])

// 搜索表单
const searchFormRef = ref()
const searchForm = ref({})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedRows = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 组件是否已挂载
const isMounted = ref(false)

// 弹框
const dialogVisible = ref(false)
const dialogTitle = ref('新增')
const dialogLoading = ref(false)
const dialogMode = ref('add')
const formData = ref({})

// 详情弹框
const detailVisible = ref(false)
const detailData = ref({})

// 初始化搜索表单
const initSearchForm = () => {
  const form = {}
  props.searchFields.forEach(field => {
    form[field.prop] = field.defaultValue !== undefined ? field.defaultValue : ''
  })
  searchForm.value = form
}

// 获取列表数据
const getList = async () => {
  if (!props.api.list) {
    console.warn('api.list 未配置')
    return
  }

  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    }
    const res = await props.api.list(params)
    tableData.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) {
    console.error('获取列表失败:', error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getList()
  emit('search', searchForm.value)
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  getList()
  emit('refresh')
}

// 新增
const handleAdd = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '新增'
  formData.value = {}
  dialogVisible.value = true
  emit('add')
}

// 编辑
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  dialogTitle.value = '编辑'
  formData.value = { ...row }
  dialogVisible.value = true
  emit('edit', row)
}

// 查看
const handleView = (row) => {
  detailData.value = { ...row }
  detailVisible.value = true
  emit('view', row)
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该条数据吗？', '提示', {
      type: 'warning'
    })

    if (props.api.delete) {
      await props.api.delete(row.id)
      ElMessage.success('删除成功')
      getList()
    }
    emit('delete', row)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 条数据吗？`, '提示', {
      type: 'warning'
    })

    const ids = selectedRows.value.map(row => row.id).join(',')

    if (props.api.delete) {
      await props.api.delete(ids)
      ElMessage.success('删除成功')
      selectedRows.value = []
      getList()
    }
    emit('batch-delete', selectedRows.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出
const handleExport = async () => {
  if (props.api.export) {
    try {
      await props.api.export(searchForm.value)
      ElMessage.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败')
    }
  }
  emit('export', searchForm.value)
}

// 弹框确认
const handleDialogConfirm = async (data) => {
  dialogLoading.value = true
  try {
    if (dialogMode.value === 'add') {
      if (props.api.add) {
        await props.api.add(data)
        ElMessage.success('新增成功')
      }
    } else {
      if (props.api.update) {
        await props.api.update(data)
        ElMessage.success('编辑成功')
      }
    }
    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    dialogLoading.value = false
  }
}

// 弹框取消
const handleDialogCancel = () => {
  dialogVisible.value = false
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  getList()
}

// 当前页变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  getList()
}

// 刷新表格
const refresh = () => {
  getList()
}
const orgTree=ref([])
// 初始化
onMounted(async() => {
   try {
    const res = await getOrgTree()
    if (res.code === 200) {
      orgTree.value = res.data
    }
  } catch (e) {
    console.error('加载组织架构失败:', e)
  }
  console.log('Crud 组件挂载，开始初始化')
  initSearchForm()
  isMounted.value = true
  // 延迟加载数据，确保路由完全稳定
  nextTick(() => {
    setTimeout(() => {
      console.log('Crud 开始加载列表数据')
      getList()
    }, 100)
  })
})

// 暴露方法
defineExpose({
  refresh,
  getList,
  searchForm
})
</script>

<style scoped>
.crud-container {
  padding: 10px;
  overflow-x: hidden;
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .crud-container {
    padding: 10px;
  }
}

.search-card {
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
  overflow-x: hidden;
}

.search-card :deep(.el-form-item) {
  width: 100%;
  margin-bottom: 18px;
}

.search-card :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.search-card :deep(.el-input),
.search-card :deep(.el-select),
.search-card :deep(.el-date-editor) {
  width: 100% !important;
}

.search-buttons {
  text-align: right;
  margin-top: 10px;
}

/* 移动端搜索按钮调整 */
@media (max-width: 768px) {
  .search-buttons {
    text-align: center;
  }

  .search-buttons :deep(.el-button) {
    margin: 5px;
  }
}

.table-card {
  margin-bottom: 20px;
  overflow: hidden;
}

.table-operations {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

/* 移动端操作按钮调整 */
@media (max-width: 768px) {
  .table-operations {
    flex-direction: column;
    align-items: stretch;
  }

  .table-operations :deep(.el-button) {
    width: 100%;
    margin: 5px 0;
  }
}

.right-operations {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 移动端右侧操作调整 */
@media (max-width: 768px) {
  .right-operations {
    justify-content: center;
  }

  .right-operations :deep(.el-button) {
    flex: 1;
  }
}
</style>
