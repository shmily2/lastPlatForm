<template>
  <div class="template-page" style="min-height: 500px">
    <Crud
      ref="crudRef"
      :search-fields="searchFields"
      :table-columns="tableColumns"
      :show-index="true"
      :show-actions="true"
      :table-actions="{ view: true, edit: true, delete: true }"
      :actions="{ add: true, batchDelete: true, export: true, refresh: true }"
      :page-sizes="[10, 20, 30, 50]"
      :api="apiConfig"
      :show-search="true"
      @search="handleSearch"
      @refresh="handleRefresh"
      @export="handleExport"
      @view="handleView"
      @edit="handleEdit"
      @add="handleAdd"
      @delete="handleDelete"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义操作列 -->
      <template #actions="{ row }">
        <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        <el-button type="info" link @click="handleCopy(row)">复制</el-button>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extra-operations>
        <el-button type="primary" @click="handleAdd">新建模板</el-button>
      </template>
    </Crud>

    <!-- 查看/编辑对话框 -->
    <Dialog
      ref="dialogRef"
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :show-footer="!isView"
      :show-form="false"
      :form-data="formData"
      :view-mode="isView"
      @update:form-data="formData = $event"
      @close="handleDialogClose"
      @confirm="handleSubmit"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <BaseForm
            :gutter="20"
            :model-value="formData"
            @update:model-value="formData = $event"
            :fields="basicFields"
            :rules="formRules"
            label-width="100px"
            :show-buttons="false"
            :view-mode="isView"
            :disabled="isView"
          />
        </el-tab-pane>
        <el-tab-pane label="题目设置" name="questions">
          <div v-if="!isView" class="toolbar">
            <el-button type="primary" size="small" @click="addQuestion('radio')">单选</el-button>
            <el-button type="primary" size="small" @click="addQuestion('checkbox')">多选</el-button>
            <el-button type="primary" size="small" @click="addQuestion('input')">输入</el-button>
            <el-button type="primary" size="small" @click="addQuestion('score')">评分</el-button>
          </div>
          <div class="question-list">
            <div v-for="(q, i) in formData.questions" :key="i" class="question-item">
              <div class="q-header">
                <span class="q-num">{{ i + 1 }}</span>
                <el-tag size="small">{{ q.type === 'radio' ? '单选' : q.type === 'checkbox' ? '多选' : q.type === 'input' ? '输入' : '评分' }}</el-tag>
                <el-input v-if="!isView" v-model="q.title" placeholder="请输入题目" style="flex:1;margin:0 10px;" />
                <span v-else style="flex:1;margin:0 10px;">{{ q.title }}</span>
                <el-button v-if="!isView" type="danger" link @click="removeQuestion(i)">删除</el-button>
              </div>
              <div class="q-body">
                <template v-if="q.type === 'radio' || q.type === 'checkbox'">
                  <div v-for="(opt, j) in q.options" :key="j" class="opt-row">
                    <el-checkbox v-if="q.type === 'checkbox'" disabled />
                    <el-radio v-else disabled />
                    <el-input v-if="!isView" v-model="opt.label" placeholder="选项内容" style="flex:1;margin:0 10px;" />
                    <span v-else style="flex:1;margin:0 10px;">{{ opt.label }}</span>
                    <el-button v-if="!isView" type="danger" link @click="q.options.splice(j,1)">删除</el-button>
                  </div>
                  <el-button v-if="!isView" type="primary" link @click="q.options.push({label:''})">+添加选项</el-button>
                </template>
                <template v-else-if="q.type === 'score'">
                  <el-rate v-model="q.maxScore" :disabled="isView" :max="10" />
                  <span style="margin-left:10px;">最高{{ q.maxScore || 5 }}分</span>
                </template>
              </div>
            </div>
            <el-empty v-if="!formData.questions || formData.questions.length === 0" description="暂无题目" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Crud from '@/components/Crud/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import BaseForm from '@/components/Form/index.vue'

const apiConfig = {
  list: () => Promise.resolve({
    data: {
      list: [
        { id: 1, name: '实习满意度调查问卷', type: '满意度', questionCount: 15, createTime: '2025-12-01 10:00:00', useCount: 5 },
        { id: 2, name: '企业评价问卷', type: '评价', questionCount: 20, createTime: '2025-11-20 14:30:00', useCount: 3 },
        { id: 3, name: '实习周报模板', type: '周报', questionCount: 8, createTime: '2025-11-15 09:20:00', useCount: 12 },
        { id: 4, name: '实习月报模板', type: '月报', questionCount: 10, createTime: '2025-11-10 11:00:00', useCount: 8 }
      ],
      total: 4
    }
  })
}

const searchFields = [
  { prop: 'name', label: '模板名称', type: 'input', placeholder: '请输入模板名称', span: 6 },
  { prop: 'type', label: '模板类型', type: 'select', placeholder: '请选择', span: 4,
    options: [{label:'全部',value:''},{label:'满意度',value:'满意度'},{label:'评价',value:'评价'},{label:'周报',value:'周报'},{label:'月报',value:'月报'}] }
]

const tableColumns = [
  { prop: 'name', label: '模板名称', minWidth: 200, align: 'center' },
  { prop: 'type', label: '模板类型', width: 100, align: 'center' },
  { prop: 'questionCount', label: '题目数量', width: 100, align: 'center' },
  { prop: 'createTime', label: '创建时间', minWidth: 160, align: 'center' },
  { prop: 'useCount', label: '使用次数', width: 100, align: 'center' }
]

const basicFields = [
  { prop: 'name', label: '模板名称', type: 'input', span: 24, required: true },
  { prop: 'type', label: '模板类型', type: 'select', span: 12, required: true,
    options: [{label:'满意度',value:'满意度'},{label:'评价',value:'评价'},{label:'周报',value:'周报'},{label:'月报',value:'月报'}] },
  { prop: 'description', label: '模板描述', type: 'textarea', span: 24, rows: 3 }
]

const formRules = { name: [{required:true,message:'请输入模板名称',trigger:'blur'}], type: [{required:true,message:'请选择模板类型',trigger:'change'}] }

const dialogVisible = ref(false), dialogTitle = ref('模板详情'), isView = ref(false), dialogRef = ref(), activeTab = ref('basic')
const formData = reactive({ id: null, name: '', type: '', description: '', questions: [] })
const crudRef = ref()

const addQuestion = (type) => {
  const q = { type, title: '', options: type === 'radio' || type === 'checkbox' ? [{label:'选项1'},{label:'选项2'}] : type === 'score' ? {maxScore:5} : [] }
  formData.questions.push(q)
}
const removeQuestion = (i) => formData.questions.splice(i, 1)

const handleSearch = (p) => console.log('搜索', p)
const handleRefresh = () => crudRef.value?.refresh()
const handleExport = () => ElMessage.success('导出成功')
const handleAdd = () => { dialogTitle.value = '新建模板'; isView.value = false; Object.assign(formData,{id:null,name:'',type:'',description:'',questions:[]}); activeTab.value='basic'; dialogVisible.value = true }
const handleView = (row) => { dialogTitle.value = '查看模板'; isView.value = true; Object.assign(formData,{...row}); activeTab.value='basic'; dialogVisible.value = true }
const handleEdit = (row) => { dialogTitle.value = '编辑模板'; isView.value = false; Object.assign(formData,{...row}); activeTab.value='basic'; dialogVisible.value = true }
const handleCopy = (row) => { ElMessage.success('复制成功'); crudRef.value?.refresh() }
const handleDelete = (row) => { ElMessageBox.confirm(`删除"${row.name}"?`,'确认',{type:'warning'}).then(()=>{ElMessage.success('删除成功'); crudRef.value?.refresh()}).catch(()=>{}) }
const handleSizeChange = (s) => {}, handleCurrentChange = (p) => {}
const handleSubmit = async () => { try{await dialogRef.value?.formRef?.validate();ElMessage.success(formData.id?'修改成功':'创建成功');dialogVisible.value=false;crudRef.value?.refresh()}catch(e){} }
const handleDialogClose = () => dialogRef.value?.formRef?.clearValidate()
</script>

<style scoped>
.toolbar { margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 4px; }
.question-list { margin-top: 15px; }
.question-item { margin-bottom: 15px; padding: 15px; border: 1px solid #e4e7ed; border-radius: 4px; }
.q-header { display: flex; align-items: center; margin-bottom: 10px; }
.q-num { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #409eff; color: #fff; border-radius: 50%; margin-right: 10px; font-size: 12px; }
.q-body { padding-left: 40px; }
.opt-row { display: flex; align-items: center; margin-bottom: 8px; }
</style>
