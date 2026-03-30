<template>
  <div class="page-container" style="min-height: 500px">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: true, edit: true, delete: true }"
      :actions="{ add: false, batchDelete: false, export: false, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleView(row)">查看</el-button>
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
      </template>

      <!-- 自定义状态列 -->
      <template #column-status="{ row }">
        <el-tag :type="row.status === '已发布' ? 'success' : 'info'">
          {{ row.status }}
        </el-tag>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">添加问卷</el-button>
      </template>
    </Crud>

    <!-- 对话框 - 使用默认slot传递表单 -->
    <Dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @confirm="handleSubmit"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="适用对象" prop="target">
          <el-select v-model="formData.target" placeholder="请选择适用对象">
            <el-option label="全部学生" value="全部学生" />
            <el-option label="实习生" value="实习生" />
            <el-option label="教师" value="教师" />
            <el-option label="企业" value="企业" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="未发布">未发布</el-radio>
            <el-radio label="已发布">已发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'

const router = useRouter()

// 模拟数据
const mockData = [
  { id: 1, title: '实习满意度调查问卷', creator: '管理员', target: '实习生', createTime: '2024-01-15 10:30:00', participantCount: 150, status: '已发布' },
  { id: 2, title: '企业指导教师评价问卷', creator: '管理员', target: '企业', createTime: '2024-01-10 14:20:00', participantCount: 80, status: '已发布' },
  { id: 3, title: '实习过程反馈问卷', creator: '管理员', target: '实习生', createTime: '2024-01-08 09:15:00', participantCount: 120, status: '已发布' },
  { id: 4, title: '校园招聘满意度调查', creator: '管理员', target: '全部学生', createTime: '2024-01-05 16:45:00', participantCount: 200, status: '已发布' },
  { id: 5, title: '教师教学质量评价问卷', creator: '管理员', target: '教师', createTime: '2024-01-03 11:00:00', participantCount: 50, status: '未发布' },
  { id: 6, title: '实习安全知识测试问卷', creator: '管理员', target: '实习生', createTime: '2024-01-01 08:30:00', participantCount: 180, status: '已发布' },
  { id: 7, title: '就业意愿调查问卷', creator: '管理员', target: '全部学生', createTime: '2023-12-28 13:20:00', participantCount: 250, status: '已发布' },
  { id: 8, title: '校企合作满意度问卷', creator: '管理员', target: '企业', createTime: '2023-12-25 10:00:00', participantCount: 60, status: '已发布' }
]

// 搜索字段
const searchFields = [
  {
    prop: 'title',
    label: '标题',
    type: 'input',
    placeholder: '请输入标题'
  }
]

// 表格列
const tableColumns = [
  { prop: 'id', label: '编号', width: 80, align: 'center' },
  { prop: 'title', label: '标题', minWidth: 200 },
  { prop: 'creator', label: '创建人', width: 100, align: 'center' },
  { prop: 'target', label: '适用对象', width: 120, align: 'center' },
  { prop: 'createTime', label: '创建时间', width: 160, align: 'center' },
  { prop: 'participantCount', label: '参与人数', width: 100, align: 'center' },
  { prop: 'status', label: '状态', width: 80, align: 'center' },
]

// API配置
const apiConfig = {
  list: (params) => {
    let result = [...mockData]
    if (params.title) {
      result = result.filter(item => item.title.includes(params.title))
    }
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

const crudRef = ref(null)

// 事件处理
const handleSearch = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleRefresh = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleSizeChange = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

const handleCurrentChange = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加问卷')
const formRef = ref(null)
const formData = reactive({
  title: '',
  target: '',
  status: '未发布',
  remark: ''
})

// 表单校验
const formRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  target: [{ required: true, message: '请选择适用对象', trigger: 'change' }]
}

// 新增 - 跳转到编辑页面
const handleAdd = () => {
  router.push('/questionnaire/template/edit')
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑问卷'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 查看
const handleView = (row) => {
  dialogTitle.value = '查看问卷'
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

// 删除
const handleDelete = () => {
  if (crudRef.value) {
    crudRef.value.refresh()
  }
}

// 提交
const handleSubmit = () => {
  dialogVisible.value = false
}
</script>

