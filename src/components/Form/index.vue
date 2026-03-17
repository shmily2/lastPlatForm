<template>
  <!-- 查看模式：卡片式详情展示 -->
  <div v-if="viewMode" class="view-mode">
    <!-- 分组模式 -->
    <template v-if="isGrouped">
      <div v-for="(group, groupIndex) in groupedFields" :key="groupIndex" class="info-card">
        <div class="card-header">
          <span class="card-line"></span>
          <span class="card-title">{{ group.title }}</span>
        </div>
        <div class="card-body">
          <el-row :gutter="0">
            <el-col v-for="field in group.fields" :key="field.prop" :xs="24"
              :sm="field.span && field.span <= 12 ? 12 : 24" :md="field.span || 12">
              <div class="info-item">
                <div class="info-label">{{ field.label }}</div>
                <div class="info-value">
                  <template v-if="field.type === 'upload' && formData[field.prop] && formData[field.prop].length">
                    <el-image v-for="(file, index) in formData[field.prop]" :key="index"
                      :src="file.url || file.response?.url" :preview-src-list="getPreviewList(field.prop)"
                      :initial-index="index" fit="cover"
                      style="width: 80px; height: 80px; margin-right: 8px; border-radius: 4px; cursor: pointer;" />
                  </template>
                  <template v-else-if="field.type === 'select'">
                    {{ getSelectLabel(field, formData[field.prop]) }}
                  </template>
                  <template v-else>
                    {{ formData[field.prop] || '-' }}
                  </template>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>

    <!-- 非分组模式 -->
    <template v-else>
      <div class="info-card">
        <div class="card-body">
          <el-row :gutter="gutter">
            <el-col v-for="field in fields" :key="field.prop" :xs="24" :sm="field.span && field.span <= 12 ? 12 : 24"
              :md="field.span || 12">
              <div class="info-item">
                <div class="info-label">{{ field.label }}</div>
                <div class="info-value">
                  <template v-if="field.type === 'upload' && formData[field.prop] && formData[field.prop].length">
                    <el-image v-for="(file, index) in formData[field.prop]" :key="index"
                      :src="file.url || file.response?.url" :preview-src-list="getPreviewList(field.prop)"
                      :initial-index="index" fit="cover"
                      style="width: 80px; height: 80px; margin-right: 8px; border-radius: 4px; cursor: pointer;" />
                  </template>
                  <template v-else-if="field.type === 'select'">
                    {{ getSelectLabel(field, formData[field.prop]) }}
                  </template>
                  <template v-else>
                    {{ formData[field.prop] || '-' }}
                  </template>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>
  </div>

  <!-- 编辑模式 -->
  <el-form v-else ref="formRef" :model="formData" :rules="rules" :label-width="labelWidth"
    :label-position="labelPosition" :disabled="disabled">
    <template v-if="isGrouped">
      <!-- 分组模式 -->
      <div v-for="(group, groupIndex) in groupedFields" :key="groupIndex" class="form-group">
        <!-- 分组标题 -->
        <div v-if="group.title" class="group-title">
          <span class="group-line"></span>
          <span class="group-text">{{ group.title }}</span>
        </div>
        <!-- 分组内容 -->
        <el-row :gutter="gutter">
          <el-col v-for="field in group.fields" :key="field.prop" :xs="24" :sm="24" :md="field.span || 12"
            :lg="field.span || 12" :xl="field.span || 8">
            <el-form-item :label="field.label" :prop="field.prop" :required="field.required">
              <!-- 自定义插槽 -->
              <slot v-if="field.slot" :name="field.slot" :field="field" :form="formData" />
              <!-- 输入框 -->
              <el-input v-else-if="field.type === 'input'" v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请输入${field.label}`" :type="field.inputType || 'text'"
                :rows="field.rows" :maxlength="field.maxlength" :show-word-limit="field.showWordLimit"
                :clearable="field.clearable !== false" :disabled="field.disabled || disabled" style="width: 100%" />
              <!-- 文本域 -->
              <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.prop]" type="textarea"
                :rows="field.rows || 4" :placeholder="field.placeholder || `请输入${field.label}`"
                :maxlength="field.maxlength" :show-word-limit="field.showWordLimit"
                :clearable="field.clearable !== false" :disabled="field.disabled || disabled" style="width: 100%" />
              <!-- 选择器 -->
              <el-select v-else-if="field.type === 'select'" v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
                :disabled="field.disabled || disabled" :filterable="field.filterable" :multiple="field.multiple"
                style="width: 100%" @change="field.onChange && field.onChange($event)">
                <el-option v-for="option in (field.options.value || field.options)" :key="option.value"
                  :label="option.label" :value="option.value" :disabled="option.disabled" />
              </el-select>
              <!-- 日期选择器 -->
              <el-date-picker v-else-if="field.type === 'date'" v-model="formData[field.prop]" type="date"
                :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
                :disabled="field.disabled || disabled" :disabled-date="field.disabledDate" style="width: 100%" />
              <!-- 月份选择器 -->
              <el-date-picker v-else-if="field.type === 'month'" v-model="formData[field.prop]" type="month"
                :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
                :disabled="field.disabled || disabled" style="width: 100%" />
              <!-- 日期时间选择器 -->
              <el-date-picker v-else-if="field.type === 'datetime'" v-model="formData[field.prop]" type="datetime"
                :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
                :disabled="field.disabled || disabled" style="width: 100%" />
              <!-- 日期范围选择器 -->
              <el-date-picker v-else-if="field.type === 'daterange'" v-model="formData[field.prop]" type="daterange"
                range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                :clearable="field.clearable !== false" :disabled="field.disabled || disabled" style="width: 100%" />
              <!-- 时间选择器 -->
              <el-time-picker v-else-if="field.type === 'time'" v-model="formData[field.prop]"
                :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
                :disabled="field.disabled || disabled" style="width: 100%" />
              <!-- 数字输入框 -->
              <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.prop]" :min="field.min"
                :max="field.max" :step="field.step || 1" :precision="field.precision"
                :controls-position="field.controlsPosition" :disabled="field.disabled || disabled"
                style="width: 100%" />
              <!-- 单选框 -->
              <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]"
                :disabled="field.disabled || disabled">
                <el-radio v-for="option in field.options" :key="option.value" :label="option.value"
                  :disabled="option.disabled">
                  {{ option.label }}
                </el-radio>
              </el-radio-group>
              <!-- 复选框 -->
              <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.prop]"
                :disabled="field.disabled || disabled">
                <el-checkbox v-for="option in field.options" :key="option.value" :label="option.value"
                  :disabled="option.disabled">
                  {{ option.label }}
                </el-checkbox>
              </el-checkbox-group>
              <!-- 开关 -->
              <el-switch v-else-if="field.type === 'switch'" v-model="formData[field.prop]"
                :active-text="field.activeText" :inactive-text="field.inactiveText"
                :disabled="field.disabled || disabled" />
              <!-- 上传 -->
              <el-upload v-else-if="field.type === 'upload'" v-model:file-list="formData[field.prop]"
                :action="field.action || '#'" :auto-upload="false" :list-type="field.listType || 'text'"
                :accept="field.accept" :limit="field.limit" :disabled="field.disabled || disabled"
                class="upload-full-width"
                :class="[{ 'upload-picture-card': field.listType === 'picture-card' }, { 'upload-full-hide': field.listType === 'picture-card' && formData[field.prop] && formData[field.prop].length >= field.limit }]"
                style="width: 100%;padding:0 20PX" :on-preview="(file) => handlePictureCardPreview(file, field.prop)">
                <!-- picture-card 模式显示 + 按钮 -->
                <div v-if="field.listType === 'picture-card'" class="el-upload__tip">
                  <el-icon>
                    <Plus />
                  </el-icon>
                </div>
                <el-button v-else type="primary" style="width: 100%">点击上传</el-button>
                <template #tip v-if="field.tip">
                  <div class="el-upload__tip">{{ field.tip }}</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </template>

    <template v-else>
      <!-- 非分组模式 -->
      <el-row :gutter="gutter">
        <el-col v-for="field in fields" :key="field.prop" :xs="24" :sm="24" :md="field.span || 12"
          :lg="field.span || 12" :xl="field.span || 8">
          <el-form-item :label="field.label" :prop="field.prop" :required="field.required">
            <!-- 输入框 -->
            <el-input v-if="field.type === 'input'" v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`" :type="field.inputType || 'text'"
              :rows="field.rows" :maxlength="field.maxlength" :show-word-limit="field.showWordLimit"
              :clearable="field.clearable !== false" :disabled="field.disabled || disabled" style="width: 100%" />
            <!-- 文本域 -->
            <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.prop]" type="textarea"
              :rows="field.rows || 4" :placeholder="field.placeholder || `请输入${field.label}`"
              :maxlength="field.maxlength" :show-word-limit="field.showWordLimit" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%" />
            <!-- 选择器 -->
            <el-select v-else-if="field.type === 'select'" v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" :filterable="field.filterable" :multiple="field.multiple"
              style="width: 100%">
              <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value"
                :disabled="option.disabled" />
            </el-select>
            <!-- 日期选择器 -->
            <el-date-picker v-else-if="field.type === 'date'" v-model="formData[field.prop]" type="date"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" :disabled-date="field.disabledDate" style="width: 100%" />
            <!-- 月份选择器 -->
            <el-date-picker v-else-if="field.type === 'month'" v-model="formData[field.prop]" type="month"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%" />
            <!-- 日期时间选择器 -->
            <el-date-picker v-else-if="field.type === 'datetime'" v-model="formData[field.prop]" type="datetime"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%;" />
            <!-- 日期范围选择器 -->
            <el-date-picker v-else-if="field.type === 'daterange'" v-model="formData[field.prop]" type="daterange"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%" />
            <!-- 时间选择器 -->
            <el-time-picker v-else-if="field.type === 'time'" v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%" />
            <!-- 数字输入框 -->
            <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.prop]" :min="field.min"
              :max="field.max" :step="field.step || 1" :precision="field.precision"
              :controls-position="field.controlsPosition" :disabled="field.disabled || disabled" style="width: 100%" />
            <!-- 单选框 -->
            <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]"
              :disabled="field.disabled || disabled">
              <el-radio v-for="option in field.options" :key="option.value" :label="option.value"
                :disabled="option.disabled">
                {{ option.label }}
              </el-radio>
            </el-radio-group>
            <!-- 复选框 -->
            <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.prop]"
              :disabled="field.disabled || disabled">
              <el-checkbox v-for="option in field.options" :key="option.value" :label="option.value"
                :disabled="option.disabled">
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>
            <!-- 开关 -->
            <el-switch v-else-if="field.type === 'switch'" v-model="formData[field.prop]"
              :active-text="field.activeText" :inactive-text="field.inactiveText"
              :disabled="field.disabled || disabled" />
            <!-- 上传 -->
            <el-upload v-else-if="field.type === 'upload'" v-model:file-list="formData[field.prop]"
              :action="field.action || '#'" :auto-upload="false" :list-type="field.listType || 'text'"
              :accept="field.accept" :limit="field.limit" :disabled="field.disabled || disabled"
              class="upload-full-width"
              :class="[{ 'upload-picture-card': field.listType === 'picture-card' }, { 'upload-full-hide': field.listType === 'picture-card' && formData[field.prop] && formData[field.prop].length >= field.limit }]"
              style="width: 100%;padding:0 20px" :on-preview="(file) => handlePictureCardPreview(file, field.prop)">
              <!-- picture-card 模式显示 + 按钮 -->
              <div v-if="field.listType === 'picture-card'" class="el-upload__tip">
                <el-icon>
                  <Plus />
                </el-icon>
              </div>
              <el-button v-else type="primary" style="width: 100%">点击上传</el-button>
              <template #tip v-if="field.tip">
                <div class="el-upload__tip">{{ field.tip }}</div>
              </template>
            </el-upload>
            <!-- 自定义插槽 -->
            <slot v-else-if="field.slot" :name="field.slot" :field="field" :form="formData" />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 表单操作按钮 -->
    <el-form-item v-if="showButtons" class="form-buttons">
      <slot name="buttons">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="showCancel" @click="handleCancel">取消</el-button>
      </slot>
    </el-form-item>
  </el-form>

  <!-- 图片预览器 -->
  <el-image-viewer v-if="showImageViewer" :url-list="previewImageList" :initial-index="currentPreviewIndex"
    @close="showImageViewer = false" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElImageViewer } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  // 表单数据
  modelValue: {
    type: Object,
    default: () => ({})
  },
  // 表单字段配置
  fields: {
    type: Array,
    required: true
  },
  // 验证规则
  rules: {
    type: Object,
    default: () => ({})
  },
  // 标签宽度
  labelWidth: {
    type: String,
    default: '120px'
  },
  // 标签位置
  labelPosition: {
    type: String,
    default: 'left'
  },
  // 栅格间距
  gutter: {
    type: Number,
    default: 10
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示按钮
  showButtons: {
    type: Boolean,
    default: true
  },
  // 是否显示取消按钮
  showCancel: {
    type: Boolean,
    default: true
  },
  // 查看模式
  viewMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit', 'reset', 'cancel'])

const formRef = ref()

// 表单数据
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 判断是否为分组模式（fields 数组中包含 title 字段）
const isGrouped = computed(() => {
  return props.fields.length > 0 && props.fields[0]?.title !== undefined
})

// 分组后的字段
const groupedFields = computed(() => {
  if (!isGrouped.value) return []
  return props.fields
})

// 获取选择器的显示文本
const getSelectLabel = (field, value) => {
  if (!value) return '-'
  const options = field.options.value || field.options
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

// 获取图片预览列表（支持左右滑动连续预览）
const getPreviewList = (prop) => {
  const files = formData.value[prop]
  if (!files || !files.length) return []
  return files.map(file => file.url || file.response?.url)
}

// 处理照片墙预览
const showImageViewer = ref(false)
const currentPreviewIndex = ref(0)
const previewImageList = ref([])

const handlePictureCardPreview = (file, prop) => {
  console.log('handlePictureCardPreview called', file, prop)
  if (!prop) {
    console.error('prop is undefined')
    return
  }
  previewImageList.value = getPreviewList(prop)
  currentPreviewIndex.value = formData.value[prop].findIndex(f => f.url === file.url || f.url === file.response?.url || f.response?.url === file.url)
  if (currentPreviewIndex.value < 0) currentPreviewIndex.value = 0
  console.log('previewImageList:', previewImageList.value, 'currentPreviewIndex:', currentPreviewIndex.value)
  showImageViewer.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('submit', formData.value)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
}

// 取消
const handleCancel = () => {
  emit('cancel')
}

// 验证表单
const validate = () => {
  return formRef.value?.validate()
}

// 重置字段
const resetFields = () => {
  formRef.value?.resetFields()
}

// 清除验证
const clearValidate = (props) => {
  formRef.value?.clearValidate(props)
}

// 暴露方法
defineExpose({
  validate,
  resetFields,
  clearValidate,
  formRef
})
</script>

<style scoped>
/* 查看模式 - 卡片式布局 */
.view-mode {
  padding: 16px;
}

.info-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.info-card:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.card-line {
  width: 4px;
  height: 16px;
  background: #409eff;
  border-radius: 2px;
  margin-right: 10px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.card-body {
  padding: 4px 0;
}

.info-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 42px;
  display: flex;
  align-items: center;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 130px;
  min-width: 130px;
  padding-right: 16px;
  color: #909399;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.info-value {
  flex: 1;
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-all;
}

.form-buttons {
  margin-top: 20px;
  text-align: center;
}

/* 表单标签背景色 */
:deep(.el-form-item__label) {
  background: #f5f7fa;
  padding: 0 6px;
  white-space: normal;
  word-break: break-all;
  line-height: 1;
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 6px;
  font-weight: 500;
  height: 100%;
}

/* 所有label添加*号对齐 */
:deep(.el-form-item__label)::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

/* 隐藏不需要*号的label的::before */
:deep(.el-form-item:not(.is-required) .el-form-item__label)::before {
  opacity: 0;
}

/* 表单项边框 */
:deep(.el-form-item) {
  border: 1px solid #dcdfe6;
  margin: -1px;
  height: 100%;
}

:deep(.el-form-item__content) {
  height: 100%;
  display: flex;
  align-items: center;
  line-height: 1;

  .el-input {
    height: 100%;
  }

  .el-upload {
    margin-top: 12px;
    margin-left: 12px;
  }
}

/* 输入框超出换行 */
:deep(.el-input__inner) {
  white-space: normal;
  word-break: break-all;
}

:deep(.el-input-number) {
  height: 100%;
}


/* 验证错误时显示红色边框 */
::deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c !important;
}

/* 单选按钮组样式 */
:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
  padding: 0 12px;
}

/* 分组标题样式 */
.form-group {
  margin-bottom: 20px;
}

.group-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-left: 8px;
}

.group-line {
  width: 4px;
  height: 18px;
  background: #409eff;
  margin-right: 8px;
  border-radius: 2px;
}

.group-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 上传图片展示上下距离 */
:deep(.el-upload) {
  height: 80px;
  width: 80px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  margin: 12px 6px;
  height: 80px;
  width: 80px;
}
.upload-full-hide >>> .el-upload--picture-card {
  display: none !important;
}
/* 移动端表单按钮调整 */
@media (max-width: 768px) {
  .form-buttons :deep(.el-button) {
    width: 100%;
    margin: 5px 0;
  }
}
</style>
