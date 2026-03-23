<template>
  <div class="org-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">组织架构</h2>
    </div>

    <!-- 主体内容 -->
    <el-card class="content-card">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="请输入组织名称进行搜索"
          clearable
          style="width: 300px"
          :prefix-icon="Search"
        />
        <div>
        <el-button type="primary" :icon="Plus" @click="handleAdd(null)">
          新增
        </el-button>
        <el-button type="success" :icon="Upload" @click="importDialogVisible = true">
          导入
        </el-button>
        </div>
      </div>

      <!-- 组织架构树形表格 -->
      <el-table
        :data="filterOrgData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        border
        stripe
        default-expand-all
      >
        <el-table-column prop="label" label="组织名称" min-width="200">
          <template #default="{ row }">
            <span class="org-name">{{ row.label }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="value" label="编码" min-width="150" />
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <!-- 父级节点显示新增子节点按钮 -->
            <el-button
              v-if="row.level < 3"
              type="primary"
              link
              @click="handleAdd(row)"
            >
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
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="上级组织" v-if="formData.parentName">
          <el-input :value="formData.parentName" disabled />
        </el-form-item>
        <el-form-item label="组织名称" prop="label">
          <el-input v-model="formData.label" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="编码" prop="value">
          <el-input v-model="formData.value" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入组织架构"
      width="500px"
      destroy-on-close
    >
      <div class="import-tips">
        <p class="tips-title">导入说明：</p>
        <ul class="tips-list">
          <li>请先下载模板，按模板格式填写后再上传</li>
          <li>支持 .xlsx 格式文件</li>
          <li>导入数据将添加到现有组织架构中</li>
          <li>编码相同的组织将覆盖现有数据</li>
        </ul>
      </div>
      
      <div class="download-template">
        <el-button type="primary" link @click="handleDownloadTemplate">
          <el-icon><Download /></el-icon>
          下载导入模板
        </el-button>
      </div>

      <el-upload
        ref="uploadRef"
        class="import-upload"
        action="#"
        :auto-upload="false"
        :limit="1"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        accept=".xlsx,.xls"
      >
        <el-button type="primary">
          <el-icon><Upload /></el-icon>
          选择文件
        </el-button>
        <template #tip>
          <div class="upload-tip">只能上传 xlsx/xls 文件</div>
        </template>
      </el-upload>

      <div v-if="uploadedFile" class="file-info">
        <el-icon><Document /></el-icon>
        <span class="file-name">{{ uploadedFile.name }}</span>
        <el-button type="danger" link @click="handleRemoveFile">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importing" :disabled="!uploadedFile" @click="handleImport">
          确定导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus, Upload, Download, Document, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索关键字
const keyword = ref('')

// 组织架构数据（带层级）
const orgData = ref([
  {
    id: '艺术系',
    value: 'art',
    label: '艺术系',
    sort: 1,
    status: 1,
    level: 1,
    children: [
      {
        id: '2020级',
        value: '2020',
        label: '2020级',
        sort: 1,
        status: 1,
        level: 2,
        children: [
          { id: '20艺术1班', value: '20art1', label: '20艺术1班', sort: 1, status: 1, level: 3 },
          { id: '20艺术2班', value: '20art2', label: '20艺术2班', sort: 2, status: 1, level: 3 }
        ]
      },
      {
        id: '2021级',
        value: '2021',
        label: '2021级',
        sort: 2,
        status: 1,
        level: 2,
        children: [
          { id: '21艺术1班', value: '21art1', label: '21艺术1班', sort: 1, status: 1, level: 3 }
        ]
      }
    ]
  },
  {
    id: '服务系',
    value: 'service',
    label: '服务系',
    sort: 2,
    status: 1,
    level: 1,
    children: [
      {
        id: '2020级-s',
        value: '2020s',
        label: '2020级',
        sort: 1,
        status: 1,
        level: 2,
        children: [
          { id: '20旅游1班', value: '20ly1', label: '20旅游1班', sort: 1, status: 1, level: 3 },
          { id: '20酒店1班', value: '20jd1', label: '20酒店1班', sort: 2, status: 1, level: 3 }
        ]
      }
    ]
  },
  {
    id: '工程系',
    value: 'engineering',
    label: '工程系',
    sort: 3,
    status: 1,
    level: 1,
    children: [
      {
        id: '2020级-e',
        value: '2020e',
        label: '2020级',
        sort: 1,
        status: 1,
        level: 2,
        children: [
          { id: '20机电1班', value: '20jd1', label: '20机电1班', sort: 1, status: 1, level: 3 },
          { id: '20汽修1班', value: '20qx1', label: '20汽修1班', sort: 2, status: 1, level: 3 }
        ]
      }
    ]
  },
  {
    id: '护理系',
    value: 'nursing',
    label: '护理系',
    sort: 4,
    status: 1,
    level: 1,
    children: [
      {
        id: '2020级-n',
        value: '2020n',
        label: '2020级',
        sort: 1,
        status: 1,
        level: 2,
        children: [
          { id: '20护理1班', value: '20hl1', label: '20护理1班', sort: 1, status: 1, level: 3 },
          { id: '20护理2班', value: '20hl2', label: '20护理2班', sort: 2, status: 1, level: 3 }
        ]
      },
      {
        id: '2021级-n',
        value: '2021n',
        label: '2021级',
        sort: 2,
        status: 1,
        level: 2,
        children: [
          { id: '21护理1班', value: '21hl1', label: '21护理1班', sort: 1, status: 1, level: 3 }
        ]
      }
    ]
  },
  {
    id: '临床系',
    value: 'clinical',
    label: '临床系',
    sort: 5,
    status: 1,
    level: 1,
    children: [
      {
        id: '2020级-c',
        value: '2020c',
        label: '2020级',
        sort: 1,
        status: 1,
        level: 2,
        children: [
          { id: '20临床1班', value: '20lc1', label: '20临床1班', sort: 1, status: 1, level: 3 }
        ]
      }
    ]
  },
  {
    id: '康复系',
    value: 'rehab',
    label: '康复系',
    sort: 6,
    status: 1,
    level: 1,
    children: [
      {
        id: '2020级-r',
        value: '2020r',
        label: '2020级',
        sort: 1,
        status: 1,
        level: 2,
        children: [
          { id: '20康复1班', value: '20kf1', label: '20康复1班', sort: 1, status: 1, level: 3 }
        ]
      }
    ]
  }
])

// 过滤后的数据
const filterOrgData = computed(() => {
  if (!keyword.value) {
    return orgData.value
  }
  return filterTree(orgData.value, keyword.value)
})

// 递归过滤树
const filterTree = (data, keyword) => {
  return data
    .map(item => {
      const match = item.label.includes(keyword)
      const children = item.children ? filterTree(item.children, keyword) : []
      if (match || (children && children.length > 0)) {
        return { ...item, children }
      }
      return null
    })
    .filter(item => item !== null)
}

// 弹框
const dialogVisible = ref(false)
const dialogTitle = ref('新增组织')
const formRef = ref(null)
const formData = reactive({
  id: '',
  parentId: '',
  parentName: '',
  label: '',
  value: '',
  sort: 0,
  status: 1,
  level: 1
})

// 导入相关
const importDialogVisible = ref(false)
const uploadRef = ref(null)
const uploadedFile = ref(null)
const importing = ref(false)

// 文件选择变化
const handleFileChange = (file) => {
  uploadedFile.value = file
}

// 文件数量超出
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 移除已选文件
const handleRemoveFile = () => {
  uploadedFile.value = null
  uploadRef.value?.clearFiles()
}

// 下载模板
const handleDownloadTemplate = () => {
  ElMessage.success('模板下载功能需要后端支持，请手动创建模板')
}

// 执行导入
const handleImport = async () => {
  if (!uploadedFile.value) return
  
  importing.value = true
  
  // 模拟导入延迟
  setTimeout(() => {
    // 解析文件并导入（这里简化处理，实际需要解析Excel）
    const mockImportData = [
      { id: '导入系部1', value: 'import1', label: '导入系部1', sort: 10, status: 1, level: 1, children: [] },
      { id: '导入系部2', value: 'import2', label: '导入系部2', sort: 11, status: 1, level: 1, children: [] }
    ]
    
    // 合并到现有数据
    orgData.value.push(...mockImportData)
    
    importing.value = false
    importDialogVisible.value = false
    uploadedFile.value = null
    uploadRef.value?.clearFiles()
    
    ElMessage.success('导入成功')
  }, 1500)
}

// 表单校验规则
const formRules = {
  label: [
    { required: true, message: '请输入组织名称', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入编码', trigger: 'blur' }
  ]
}

// 新增
const handleAdd = (parent) => {
  dialogTitle.value = parent ? '新增子组织' : '新增组织'
  formData.id = ''
  formData.parentId = parent?.id || ''
  formData.parentName = parent?.label || ''
  formData.label = ''
  formData.value = ''
  formData.sort = parent?.children?.length ? parent.children.length + 1 : 1
  formData.status = 1
  formData.level = parent ? parent.level + 1 : 1
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑组织'
  formData.id = row.id
  formData.parentId = row.parentId || ''
  formData.parentName = row.parentName || ''
  formData.label = row.label
  formData.value = row.value
  formData.sort = row.sort
  formData.status = row.status
  formData.level = row.level
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除组织"${row.label}"吗？${row.children ? '（该组织下有子组织，将被一并删除）' : ''}`,
    '提示',
    { type: 'warning' }
  ).then(() => {
    // 从树中删除节点
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
    deleteNode(orgData.value, row.id)
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
            label: formData.label,
            value: formData.value,
            sort: formData.sort,
            status: formData.status
          })
          return true
        }
        if (item.children) {
          if (updateNode(item.children)) return true
        }
      }
      return false
    }
    updateNode(orgData.value)
  } else {
    // 新增
    const newNode = {
      id: formData.label + '_' + Date.now(),
      label: formData.label,
      value: formData.value,
      sort: formData.sort,
      status: formData.status,
      level: formData.level,
      children: formData.level < 3 ? [] : undefined
    }

    if (formData.parentId) {
      // 添加到父节点下
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
      addToParent(orgData.value)
    } else {
      // 顶级节点
      orgData.value.push(newNode)
    }
  }

  ElMessage.success(dialogTitle.value + '成功')
  dialogVisible.value = false
}

onMounted(() => {
  // 设置父级名称
  const setParentName = (data, parentName = '') => {
    for (const item of data) {
      item.parentName = parentName
      if (item.children) {
        setParentName(item.children, item.label)
      }
    }
  }
  setParentName(orgData.value)
})
</script>

<style scoped>
.org-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
  gap: 10px;
}

.content-card :deep(.el-table) {
  flex: 1;
}

.org-name {
  font-weight: 500;
}

/* 导入弹框样式 */
.import-tips {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.tips-title {
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #303133;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
}

.tips-list li {
  margin-bottom: 5px;
}

.download-template {
  margin-bottom: 20px;
}

.import-upload {
  margin-bottom: 15px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.file-info {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: 4px;
}

.file-info .el-icon {
  color: #409eff;
  margin-right: 8px;
}

.file-name {
  flex: 1;
  color: #303133;
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .toolbar .el-input {
    width: 100% !important;
  }
}
</style>
