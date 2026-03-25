<template>
  <!-- 查看模式：卡片式详情展示 -->
  <div v-if="viewMode" class="view-mode">
    <div v-for="(group, groupIndex) in fields" :key="'view-' + groupIndex" class="info-card">
      <!-- 分组标题：有title就显示，没有就隐藏 -->
      <div v-if="group.title" class="card-header">
        <span class="card-line"></span>
        <span class="card-title">{{ group.title }}</span>
      </div>
      <div class="card-body">
        <el-row :gutter="0">
          <el-col v-for="field in group.fields" :key="field.prop" :xs="24"
            :sm="field.span && field.span <= 12 ? 12 : 24" :md="field.span || 12">
            <div class="info-item">
              <div class="info-label" :style="{ width: labelWidth}">{{ field.label }}</div>
              <div class="info-value">
                <template v-if="field.type === 'upload' && formData[field.prop] && formData[field.prop].length">
                  <el-image v-for="(file, index) in formData[field.prop]" :key="index"
                    :src="file.url || file.response?.url" :preview-src-list="getPreviewList(field.prop)"
                    :initial-index="index" fit="cover"
                    style="width: 80px; height: 80px; margin-right: 8px; border-radius: 4px; cursor: pointer;" />
                </template>
                <template v-else-if="(field.type === 'signature' || field.type === 'image') && formData[field.prop]">
                  <template v-if="Array.isArray(formData[field.prop])">
                    <el-image v-for="(file, index) in formData[field.prop]" :key="index"
                      :src="file.url || file.response?.url || file" fit="cover"
                      style="width: 80px; height: 80px; margin-right: 8px; border-radius: 4px;" />
                  </template>
                  <template v-else>
                    <img :src="formData[field.prop]" style="max-width: 200px; max-height: 100px; border-radius: 4px; border: 1px solid #dcdfe6;"
                      @error="(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = '签名加载失败' }" />
                  </template>
                </template>
                <template v-else-if="field.type === 'select'">
                  {{ getSelectLabel(field, formData[field.prop]) }}
                </template>
                <template v-else-if="field.type === 'rate'">
                  <el-rate v-model="formData[field.prop]" :max="field.max || 5"
                    :texts="['不及格', '及格', '中等', '良好', '优秀']" show-text
                    :disabled="isDisabled" />
                </template>
                <template v-else>
                  {{ (formData[field.prop] === null || formData[field.prop] === undefined || (Array.isArray(formData[field.prop]) && formData[field.prop].length === 0)) ? '-' : formData[field.prop] }}{{ field.suffix || '' }}
                </template>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>

  <!-- 编辑模式 -->
  <el-form v-else ref="formRef" :model="formData" :rules="rules" :label-width="labelWidth"
    :label-position="labelPosition" :disabled="disabled">
    <div v-for="(group, groupIndex) in fields" :key="'edit-' + groupIndex" class="form-group">
      <!-- 分组标题：有title就显示，没有就隐藏 -->
      <div v-if="group.title" class="group-title">
        <span class="group-line"></span>
        <span class="group-text">{{ group.title }}</span>
      </div>
      <el-row :gutter="gutter">
        <el-col v-for="field in group.fields" :key="field.prop" :xs="24" :sm="24" :md="field.span || 12"
          :lg="field.span || 12" :xl="field.span || 8">
          <el-form-item :label="field.label" :prop="field.prop" :required="field.required">
            <slot v-if="field.slot" :name="field.slot" :field="field" :form="formData" />
            <component v-else-if="field.component" :is="field.component" v-model="formData[field.prop]"
              v-bind="field.props" :disabled="field.disabled || disabled" />
            <el-input v-else-if="field.type === 'input'" v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`" :type="field.inputType || 'text'"
              :rows="field.rows" :maxlength="field.maxlength" :show-word-limit="field.showWordLimit"
              :clearable="field.clearable !== false" :disabled="field.disabled || disabled" style="width: 100%">
              <template v-if="field.suffix" #suffix>{{ field.suffix }}</template>
            </el-input>
            <el-input v-else-if="field.type === 'textarea'" v-model="formData[field.prop]" type="textarea"
              :rows="field.rows || 4" :placeholder="field.placeholder || `请输入${field.label}`"
              :maxlength="field.maxlength" :show-word-limit="field.showWordLimit"
              :clearable="field.clearable !== false" :disabled="field.disabled || disabled" style="width: 100%" />
            <!-- 富文本编辑器 -->
            <Editor v-else-if="field.type === 'editor'" v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`" :readonly="field.disabled || disabled"
              style="width: 100%" />
            <!-- 签名板 -->
            <div v-else-if="field.type === 'signature'" class="signature-pad" :id="'signature-container-' + field.prop">
              <canvas :id="'signature-canvas-' + field.prop"
                style="width: 100%; height: 150px; border: 1px solid #dcdfe6; border-radius: 4px; background: #fff;"></canvas>
              <div class="signature-actions" style="margin-top: 8px;">
                <el-button size="small" @click="clearSignature(field.prop)">清除</el-button>
                <el-button size="small" type="primary" @click="saveSignature(field.prop)">确认签名</el-button>
              </div>
            </div>
            <el-select v-else-if="field.type === 'select'" v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" :filterable="field.filterable" :multiple="field.multiple"
              style="width: 100%" @change="field.onChange && field.onChange($event)">
              <el-option v-for="option in (field.options.value || field.options)" :key="option.value"
                :label="option.label" :value="option.value" :disabled="option.disabled" />
            </el-select>
            <el-date-picker v-else-if="field.type === 'date'" v-model="formData[field.prop]" type="date"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" :disabled-date="field.disabledDate" style="width: 100%" />
            <el-date-picker v-else-if="field.type === 'month'" v-model="formData[field.prop]" type="month"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%" />
            <el-date-picker v-else-if="field.type === 'datetime'" v-model="formData[field.prop]" type="datetime"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%" />
            <el-date-picker v-else-if="field.type === 'daterange'" v-model="formData[field.prop]" type="daterange"
              range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
              :clearable="field.clearable !== false" :disabled="field.disabled || disabled" style="width: 100%" />
            <el-time-picker v-else-if="field.type === 'time'" v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`" :clearable="field.clearable !== false"
              :disabled="field.disabled || disabled" style="width: 100%" />
            <el-input-number v-else-if="field.type === 'number'" v-model="formData[field.prop]" :min="field.min"
              :max="field.max" :step="field.step || 1" :precision="field.precision"
              :controls-position="field.controlsPosition" :disabled="field.disabled || disabled"
              style="width: 100%" />
            <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.prop]"
              :disabled="field.disabled || disabled">
              <el-radio v-for="option in field.options" :key="option.value" :label="option.value"
                :disabled="option.disabled">
                {{ option.label }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.prop]"
              :disabled="field.disabled || disabled">
              <el-checkbox v-for="option in field.options" :key="option.value" :label="option.value"
                :disabled="option.disabled">
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>
            <el-switch v-else-if="field.type === 'switch'" v-model="formData[field.prop]"
              :active-text="field.activeText" :inactive-text="field.inactiveText"
              :disabled="field.disabled || disabled" />
            <el-rate v-else-if="field.type === 'rate'" v-model="formData[field.prop]" :max="field.max || 5"
              :texts="['不及格', '及格', '中等', '良好', '优秀']" show-text
              :disabled="field.disabled || disabled" />
            <el-button v-else-if="field.type === 'button'" type="primary"
              :disabled="field.disabled || disabled" @click="field.click">
              {{ field.text || '点击' }}
            </el-button>
            <!-- hideDelete或disabled时用查看模式展示图片 -->
            <div v-if="field.type === 'upload' && (field.hideDelete || field.disabled || disabled) && formData[field.prop] && formData[field.prop].length" class="view-upload-list">
              <el-image v-for="(file, index) in formData[field.prop]" :key="index"
                :src="file.url || file.response?.url" :preview-src-list="getPreviewList(field.prop)"
                :initial-index="index" fit="cover"
                style="width: 80px; height: 80px; margin-right: 8px; border-radius: 4px; cursor: pointer;" />
            </div>
            <!-- 直接图片展示类型 -->
            <div v-if="field.type === 'image' && formData[field.prop]" class="view-upload-list">
              <template v-if="Array.isArray(formData[field.prop])">
                <el-image v-for="(file, index) in formData[field.prop]" :key="index"
                  :src="file.url || file.response?.url || file" :preview-src-list="getPreviewList(field.prop)"
                  :initial-index="index" fit="cover"
                  style="width: 80px; height: 80px; margin-right: 8px; border-radius: 4px; cursor: pointer;" />
              </template>
              <template v-else-if="String(formData[field.prop]).startsWith('data:image')">
                <!-- base64图片使用原生img标签显示 -->
                <img :src="formData[field.prop]"
                  style="max-width: 200px; max-height: 100px; border-radius: 4px; border: 1px solid #dcdfe6;" />
              </template>
              <template v-else>
                <el-image :src="formData[field.prop]"
                  fit="cover"
                  style="max-width: 200px; max-height: 100px; border-radius: 4px;" />
              </template>
            </div>
            <el-upload v-else-if="field.type === 'upload'" v-model:file-list="formData[field.prop]"
              :action="field.action || '#'" :auto-upload="false" :list-type="field.listType || 'text'"
              :accept="field.accept" :limit="field.limit" :disabled="field.disabled || disabled"
              class="upload-full-width"
              :class="[{ 'upload-picture-card': field.listType === 'picture-card' }, { 'upload-full-hide': field.listType === 'picture-card' && formData[field.prop] && formData[field.prop].length >= field.limit }, { 'upload-hidden': field.hideUpload }]"
              style="width: 100%;padding:0 20PX" :on-preview="(file) => handlePictureCardPreview(file, field.prop)" :on-remove="field.hideDelete ? (file, fileList) => { return false } : undefined">
              <div v-if="field.listType === 'picture-card' && !field.hideUpload" class="el-upload__tip">
                <el-icon><Plus /></el-icon>
              </div>
              <el-button v-else-if="!field.hideUpload" type="primary" style="width: 100%">点击上传</el-button>
              <template #tip v-if="field.tip">
                <div class="el-upload__tip">{{ field.tip }}</div>
              </template>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </div>

    <el-form-item v-if="showButtons" class="form-buttons">
      <slot name="buttons">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="showCancel" @click="handleCancel">取消</el-button>
      </slot>
    </el-form-item>
  </el-form>

  <el-image-viewer v-if="showImageViewer" :url-list="previewImageList" :initial-index="currentPreviewIndex"
    @close="showImageViewer = false" />
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { ElImageViewer } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import SignaturePad from 'signature_pad'
import Editor from '@/components/Editor/index.vue'


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

// 查看模式时自动禁用
const isDisabled = computed(() => props.disabled || props.viewMode)

// 判断是否为分组模式（fields数组第一个元素有title属性）
const isGrouped = computed(() => {
  return props.fields.length > 0 && props.fields[0]?.title !== undefined
})

// 签名板相关
const signaturePads = ref({})

// 初始化签名板
const initSignaturePad = (field) => {
  nextTick(() => {
    const canvasId = 'signature-canvas-' + field.prop
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
      // 延迟重试
      setTimeout(() => initSignaturePad(field), 100)
      return
    }

    // 设置画布尺寸
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width || canvas.offsetWidth || 400
    canvas.height = 150

    // 清除旧的签名板实例
    if (signaturePads.value[field.prop]) {
      try {
        signaturePads.value[field.prop].off()
      } catch (e) {}
      delete signaturePads.value[field.prop]
    }

    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)'
    })
    signaturePads.value[field.prop] = signaturePad

    // 如果已有签名数据，加载显示
    if (formData.value[field.prop] && formData.value[field.prop].startsWith('data:')) {
      try {
        signaturePad.fromDataURL(formData.value[field.prop])
      } catch (e) {
        console.warn('加载签名失败:', e)
      }
    }
  })
}

// 监听弹框显示状态，初始化签名板
watch(() => props.modelValue, () => {
  // 延迟初始化，确保 DOM 已渲染
  setTimeout(() => {
    props.fields.forEach(group => {
      group.fields.forEach(field => {
        if (field.type === 'signature') {
          // 每次打开弹框都重新初始化
          initSignaturePad(field)
        }
      })
    })
  }, 300)
}, { immediate: true, deep: true })

const clearSignature = (prop) => {
  if (signaturePads.value[prop]) {
    signaturePads.value[prop].clear()
    formData.value[prop] = ''
  }
}

const saveSignature = (prop) => {
  if (signaturePads.value[prop]) {
    const dataUrl = signaturePads.value[prop].toDataURL()
    formData.value[prop] = dataUrl
  }
}

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
  if (!files) return []
  // 如果是数组
  if (Array.isArray(files)) {
    return files.map(file => file.url || file.response?.url || file)
  }
  // 如果是单个字符串（单个图片URL）
  if (typeof files === 'string' && files.startsWith('data:')) {
    return [files]
  }
  return []
}

// 处理照片墙预览
const showImageViewer = ref(false)
const currentPreviewIndex = ref(0)
const previewImageList = ref([])

const handlePictureCardPreview = (file, prop) => {
  if (!prop) return
  previewImageList.value = getPreviewList(prop)
  currentPreviewIndex.value = formData.value[prop].findIndex(f => f.url === file.url || f.url === file.response?.url || f.response?.url === file.url)
  if (currentPreviewIndex.value < 0) currentPreviewIndex.value = 0
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
const validate = async () => {
  // 先处理 signature 类型字段的校验
  const signatureFields = []
  props.fields.forEach(group => {
    group.fields.forEach(field => {
      if (field.type === 'signature' && field.required) {
        signatureFields.push(field.prop)
      }
    })
  })
  
  // 检查签名是否填写
  for (const prop of signatureFields) {
    if (!formData.value[prop]) {
      return Promise.reject(new Error('请签名后再审批'))
    }
  }
  
  // 继续默认的表单校验
  if (formRef.value) {
    return formRef.value.validate()
  }
  return Promise.resolve()
}

// 重置字段
const resetFields = () => {
  formRef.value?.resetFields()
}

// 清除验证
const clearValidate = (props) => {
  formRef.value?.clearValidate(props)
}

// 清除所有签名
const clearAllSignatures = () => {
  Object.keys(signaturePads.value).forEach(prop => {
    if (signaturePads.value[prop]) {
      signaturePads.value[prop].clear()
    }
  })
}

// 暴露方法
defineExpose({
  validate,
  resetFields,
  clearValidate,
  clearAllSignatures,
  formRef
})
</script>
<style scoped>
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
  align-items: flex-start;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
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
    margin:12px;
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
/* 分数样式 */
:deep(.el-rate) {
  padding: 0 10px;
}
:deep(.el-rate.is-disabled){
  padding: 0;
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

.upload-full-hide>>>.el-upload--picture-card {
  display: none !important;
}

.upload-hidden>>>.el-upload--picture-card {
  display: none !important;
}

.upload-hidden>>>.el-upload__tip {
  display: none !important;
}

/* 上传隐藏样式 */
.upload-hidden .el-upload--picture-card {
  display: none;
}

.upload-hidden .el-upload__tip {
  display: none;
}
/* 签名板样式 */
.signature-pad{
  width:100%;
}
.signature-actions{
  display: flex;
    justify-content: flex-end;
    padding: 10px;
}

/* 移动端表单按钮调整 */
@media (max-width: 768px) {
  .form-buttons :deep(.el-button) {
    width: 100%;
    margin: 5px 0;
  }
}

/* 查看模式上传图片列表 */
.view-upload-list {
  display: flex;
  flex-wrap: wrap;
  padding: 12px 20px;
}

/* 分数禁用时隐藏文字 */
::deep(.el-rate.is-disabled .el-rate__text) {
  display: none;
}
::deep(.el-rate.is-disabled) {
  padding: 0;
}
</style>
