<template>
  <div class="editor-container">
    <Toolbar
      class="editor-toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="editor-content"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  mode: {
    type: String,
    default: 'default'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = shallowRef()
const valueHtml = ref(props.modelValue)

const toolbarConfig = {}
const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      // 自定义图片上传配置
      fieldName: 'file',
      server: '/api/upload',
      // 其他配置...
    }
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== valueHtml.value) {
    valueHtml.value = newVal
  }
})

// 编辑器创建完成
const handleCreated = (editor) => {
  editorRef.value = editor
  if (props.readonly) {
    editor.disable()
  }
}

// 内容变化
const handleChange = (editor) => {
  const html = editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

// 暴露给父组件的方法
defineExpose({
  getEditor: () => editorRef.value,
  getHtml: () => editorRef.value?.getHtml(),
  setHtml: (html) => {
    valueHtml.value = html
  },
  clear: () => {
    valueHtml.value = ''
  }
})
</script>

<style scoped>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  border-bottom: 1px solid #ccc;
}
.editor-content{
  min-height: 300px;
  overflow-y: auto;
}
</style>
