<template>
  <div class="role-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">角色管理</h2>
    </div>

    <!-- 主体内容 -->
    <el-card class="content-card">
      <!-- 顶部操作栏 -->
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增
        </el-button>
      </div>

      <!-- 角色列表表格 -->
      <el-table
        :data="roleList"
        border
        stripe
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色代码" min-width="120" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              修改
            </el-button>
            <el-button type="primary" link size="small" @click="handleMenuConfig(row)">
              菜单配置
            </el-button>
            <el-button type="primary" link size="small" @click="handleModuleConfig(row)">
              模块配置
            </el-button>
            <el-button type="primary" link size="small" @click="handleDownloadFields(row)">
              可下载字段
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
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色代码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 菜单配置弹框 -->
    <el-dialog
      v-model="menuDialogVisible"
      title="菜单配置"
      width="500px"
      destroy-on-close
    >
      <el-tree
        ref="menuTreeRef"
        :data="menuTreeData"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :props="{ label: 'title', children: 'children' }"
      />
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMenuConfig">确定</el-button>
      </template>
    </el-dialog>

    <!-- 数据配置弹框 -->
    <el-dialog
      v-model="dataDialogVisible"
      title="数据配置"
      width="500px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="数据范围">
          <el-radio-group v-model="dataScope">
            <el-radio :value="1">全部数据</el-radio>
            <el-radio :value="2">本部门数据</el-radio>
            <el-radio :value="3">本部门及以下数据</el-radio>
            <el-radio :value="4">仅本人数据</el-radio>
            <el-radio :value="5">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择部门" v-if="dataScope === 5">
          <el-tree
            :data="deptTreeData"
            show-checkbox
            node-key="id"
            :default-expand-all="true"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDataScope">确定</el-button>
      </template>
    </el-dialog>

    <!-- 分配用户弹框 -->
    <el-dialog
      v-model="userDialogVisible"
      title="分配用户"
      width="700px"
      destroy-on-close
    >
      <div class="transfer-container">
        <el-transfer
          v-model="selectedUsers"
          :data="userList"
          :titles="['未分配用户', '已分配用户']"
          :props="{ key: 'id', label: 'name' }"
          filterable
          :filter-method="filterUser"
          filter-placeholder="请输入用户名"
        />
      </div>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAssignUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 模块配置弹框 -->
    <el-dialog
      v-model="moduleDialogVisible"
      title="模块配置"
      width="500px"
      destroy-on-close
    >
      <el-checkbox-group v-model="selectedModules">
        <el-checkbox value="internship">实习管理</el-checkbox>
        <el-checkbox value="leave">请假管理</el-checkbox>
        <el-checkbox value="sign">打卡管理</el-checkbox>
        <el-checkbox value="report">报告管理</el-checkbox>
        <el-checkbox value="visit">巡访管理</el-checkbox>
        <el-checkbox value="statistics">数据分析</el-checkbox>
        <el-checkbox value="setting">系统设置</el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="moduleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveModuleConfig">确定</el-button>
      </template>
    </el-dialog>

    <!-- 可下载字段弹框 -->
    <el-dialog
      v-model="downloadDialogVisible"
      title="可下载字段"
      width="600px"
      destroy-on-close
    >
      <el-table
        :data="downloadFields"
        border
        stripe
        size="small"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="name" label="字段名称" />
        <el-table-column prop="category" label="所属模块" />
      </el-table>
      <template #footer>
        <el-button @click="downloadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDownloadFields">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 加载状态
const loading = ref(false)

// 角色列表数据
const roleList = ref([
  { id: 1, name: '校长', code: 'xz', sort: 1, remark: '系统最高权限' },
  { id: 2, name: '分管校长', code: 'fgxz', sort: 2, remark: '分管各系部' },
  { id: 3, name: '实习管理员', code: 'oaadmin', sort: 3, remark: '管理实习相关事务' },
  { id: 4, name: '系主任', code: 'xzr', sort: 4, remark: '管理本系部' },
  { id: 5, name: '系部实习干事', code: 'xbsxgs', sort: 5, remark: '系部实习事务' },
  { id: 6, name: '班主任', code: 'bzr', sort: 6, remark: '管理本班级' },
  { id: 7, name: '指导老师', code: 'zdls', sort: 7, remark: '指导学生实习' },
  { id: 8, name: '系统管理员', code: 'sysadmin', sort: 8, remark: '系统维护' },
  { id: 9, name: '巡访审核', code: 'xfss', sort: 9, remark: '巡访审核权限' }
])

// 弹框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const formRef = ref(null)
const formData = reactive({
  id: '',
  name: '',
  code: '',
  sort: 0,
  remark: ''
})

// 表单校验规则
const formRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' }
  ]
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  formData.id = ''
  formData.name = ''
  formData.code = ''
  formData.sort = roleList.value.length + 1
  formData.remark = ''
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑角色'
  formData.id = row.id
  formData.name = row.name
  formData.code = row.code
  formData.sort = row.sort
  formData.remark = row.remark
  dialogVisible.value = true
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      roleList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (formData.id) {
    // 编辑
    const index = roleList.value.findIndex(item => item.id === formData.id)
    if (index > -1) {
      roleList.value[index] = { ...formData }
    }
  } else {
    // 新增
    roleList.value.push({
      ...formData,
      id: Date.now()
    })
  }

  ElMessage.success(dialogTitle.value + '成功')
  dialogVisible.value = false
}

// 菜单配置相关
const menuDialogVisible = ref(false)
const menuTreeRef = ref(null)
const currentRole = ref(null)

// 菜单树数据
const menuTreeData = ref([
  {
    id: 1,
    title: '实习系统',
    children: [
      { id: 11, title: '首页' },
      { id: 12, title: '实习申请', children: [{ id: 121, title: '实习审批' }] },
      { id: 13, title: '学生请假', children: [{ id: 131, title: '学生请假' }] },
      { id: 14, title: '打卡管理', children: [{ id: 141, title: '打卡详情' }, { id: 142, title: '打卡统计' }] },
      { id: 15, title: '实习报告', children: [{ id: 151, title: '周报' }, { id: 152, title: '月报' }] }
    ]
  },
  {
    id: 2,
    title: '基础设置',
    children: [
      { id: 21, title: '组织架构' },
      { id: 22, title: '信息采集' },
      { id: 23, title: '菜单管理' },
      { id: 24, title: '角色管理' }
    ]
  }
])

// 打开菜单配置
const handleMenuConfig = (row) => {
  currentRole.value = row
  menuDialogVisible.value = true
}

// 保存菜单配置
const handleSaveMenuConfig = () => {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys()
  console.log('角色:', currentRole.value.name, '选中菜单:', checkedKeys)
  ElMessage.success('菜单配置保存成功')
  menuDialogVisible.value = false
}

// 数据配置相关
const dataDialogVisible = ref(false)
const dataScope = ref(1)

// 部门树数据
const deptTreeData = ref([
  { id: 1, label: '艺术系', children: [{ id: 11, label: '2020级' }, { id: 12, label: '2021级' }] },
  { id: 2, label: '服务系', children: [{ id: 21, label: '2020级' }] },
  { id: 3, label: '工程系', children: [{ id: 31, label: '2020级' }] },
  { id: 4, label: '护理系', children: [{ id: 41, label: '2020级' }, { id: 42, label: '2021级' }] }
])

// 打开数据配置
const handleDataScope = (row) => {
  currentRole.value = row
  dataDialogVisible.value = true
}

// 保存数据配置
const handleSaveDataScope = () => {
  ElMessage.success('数据配置保存成功')
  dataDialogVisible.value = false
}

// 分配用户相关
const userDialogVisible = ref(false)
const selectedUsers = ref([])

// 用户列表
const userList = ref([
  { id: 1, name: '张三', dept: '艺术系' },
  { id: 2, name: '李四', dept: '服务系' },
  { id: 3, name: '王五', dept: '工程系' },
  { id: 4, name: '赵六', dept: '护理系' },
  { id: 5, name: '钱七', dept: '临床系' },
  { id: 6, name: '孙八', dept: '康复系' }
])

// 打开分配用户
const handleAssignUser = (row) => {
  currentRole.value = row
  selectedUsers.value = []
  userDialogVisible.value = true
}

// 用户筛选
const filterUser = (query, item) => {
  return item.name.includes(query)
}

// 保存分配用户
const handleSaveAssignUser = () => {
  ElMessage.success(`已为角色"${currentRole.value.name}"分配 ${selectedUsers.value.length} 个用户`)
  userDialogVisible.value = false
}

// 模块配置相关
const moduleDialogVisible = ref(false)
const selectedModules = ref([])

// 打开模块配置
const handleModuleConfig = (row) => {
  currentRole.value = row
  selectedModules.value = ['internship', 'leave', 'sign', 'report', 'visit', 'statistics', 'setting']
  moduleDialogVisible.value = true
}

// 保存模块配置
const handleSaveModuleConfig = () => {
  ElMessage.success(`模块配置保存成功，已为角色"${currentRole.value.name}"配置 ${selectedModules.value.length} 个模块`)
  moduleDialogVisible.value = false
}

// 可下载字段相关
const downloadDialogVisible = ref(false)
const selectedFields = ref([])

// 可下载字段列表
const downloadFields = ref([
  { name: '学号', category: '基本信息' },
  { name: '姓名', category: '基本信息' },
  { name: '性别', category: '基本信息' },
  { name: '身份证号', category: '基本信息' },
  { name: '手机号码', category: '基本信息' },
  { name: '实习单位', category: '实习信息' },
  { name: '实习岗位', category: '实习信息' },
  { name: '实习开始时间', category: '实习信息' },
  { name: '实习结束时间', category: '实习信息' },
  { name: '指导老师', category: '实习信息' },
  { name: '打卡次数', category: '打卡信息' },
  { name: '请假次数', category: '请假信息' },
  { name: '周报提交', category: '报告信息' },
  { name: '月报提交', category: '报告信息' }
])

// 打开可下载字段
const handleDownloadFields = (row) => {
  currentRole.value = row
  selectedFields.value = []
  downloadDialogVisible.value = true
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedFields.value = selection
}

// 保存可下载字段
const handleSaveDownloadFields = () => {
  ElMessage.success(`可下载字段保存成功，已为角色"${currentRole.value.name}"配置 ${selectedFields.value.length} 个字段`)
  downloadDialogVisible.value = false
}

onMounted(() => {
  loading.value = false
})
</script>

<style scoped>
.role-page {
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

.transfer-container {
  display: flex;
  justify-content: center;
}

.transfer-container :deep(.el-transfer) {
  width: 100%;
}

.transfer-container :deep(.el-transfer-panel) {
  width: 280px;
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .transfer-container :deep(.el-transfer-panel) {
    width: 100%;
  }
}
</style>
