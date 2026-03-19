<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :fullscreen="fullscreen"
    :top="top"
    :modal="modal"
    :modal-class="modalClass"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    :before-close="handleBeforeClose"
    :destroy-on-close="destroyOnClose"
    class="custom-dialog"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!-- 自定义插槽内容 -->
    <slot>
      <!-- 默认显示表单 -->
      <BaseForm
        v-show="showForm"
        ref="formRef"
        :gutter="0"
        :model-value="formData"
        @update:model-value="handleFormDataUpdate"
        :fields="formFields"
        :rules="formRules"
        :label-width="formLabelWidth"
        :show-buttons="false"
        :view-mode="viewMode"
        :disabled="disabled"
      />
    </slot>

    <!-- 底部按钮 -->
    <template #footer v-if="showFooter">
      <slot name="footer">
        <el-button @click="handleCancel">
          {{ cancelText }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import BaseForm from '../Form/index.vue'

const props = defineProps({
  // 是否显示对话框
  modelValue: {
    type: Boolean,
    default: false
  },
  // 对话框标题
  title: {
    type: String,
    default: '提示'
  },
  // 对话框宽度
  width: {
    type: String,
    default: '50%'
  },
  // 是否全屏
  fullscreen: {
    type: Boolean,
    default: false
  },
  // 对话框距离顶部的距离
  top: {
    type: String,
    default: '15vh'
  },
  // 是否需要遮罩层
  modal: {
    type: Boolean,
    default: true
  },
  // 自定义类名
  modalClass: {
    type: String,
    default: ''
  },
  // 是否可以通过点击 modal 关闭 Dialog
  closeOnClickModal: {
    type: Boolean,
    default: false
  },
  // 是否可以通过按下 ESC 关闭 Dialog
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  // 是否显示关闭按钮
  showClose: {
    type: Boolean,
    default: true
  },
  // 关闭时的回调函数
  beforeClose: {
    type: Function,
    default: null
  },
  // 关闭时是否销毁组件
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: true
  },
  // 确认按钮文字
  confirmText: {
    type: String,
    default: '确定'
  },
  // 取消按钮文字
  cancelText: {
    type: String,
    default: '取消'
  },
  // 确认按钮加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否显示表单
  showForm: {
    type: Boolean,
    default: false
  },
  // 表单字段
  formFields: {
    type: Array,
    default: () => []
  },
  // 表单验证规则
  formRules: {
    type: Object,
    default: () => ({})
  },
  // 表单标签宽度
  formLabelWidth: {
    type: String,
    default: '120px'
  },
  // 表单数据
  formData: {
    type: Object,
    default: () => ({})
  },
  // 查看模式
  viewMode: {
    type: Boolean,
    default: false
  },
  // 是否禁用表单
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel',
  'open',
  'opened',
  'close',
  'closed',
  'update:formData'
])

// 表单引用 - 由模板中的 BaseForm ref 自动赋值
const formRef = ref(null)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 表单数据
const internalFormData = ref({})

watch(
  () => props.formData,
  (val) => {
    internalFormData.value = { ...val }
  },
  { immediate: true, deep: true }
)

// 处理表单数据更新
const handleFormDataUpdate = (val) => {
  internalFormData.value = val
  emit('update:formData', val)
}

// 关闭前回调
const handleBeforeClose = (done) => {
  if (props.beforeClose) {
    props.beforeClose(done)
  } else {
    done()
  }
}

// 打开动画开始时的回调
const handleOpen = () => {
  // 重置弹框滚动位置
  nextTick(() => {
    const dialogBody = document.querySelector('.custom-dialog .el-dialog__body')
    if (dialogBody) {
      dialogBody.scrollTop = 0
    }
  })
  emit('open')
}

// 打开动画结束时的回调
const handleOpened = () => {
  emit('opened')
}

// 关闭动画开始时的回调
const handleClose = () => {
  emit('close')
}

// 关闭动画结束时的回调
const handleClosed = () => {
  emit('closed')
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 确认
const handleConfirm = async () => {
  // 如果显示表单，先验证
  if (props.showForm && formRef.value) {
    try {
      await formRef.value.validate()
      emit('confirm', internalFormData.value)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  } else {
    emit('confirm')
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 验证表单
const validate = () => {
  return formRef.value?.validate()
}

// 暴露方法
defineExpose({
  resetForm,
  validate,
  formRef
})
</script>
<style>
.custom-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: visible;
  box-sizing: border-box;
  padding:20px;
}

.custom-dialog .el-dialog {
  margin: 0 auto !important;
}

.custom-dialog {
  overflow: visible;
}
</style>


