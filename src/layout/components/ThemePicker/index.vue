<template>
  <el-color-picker v-model="themeColor" @change="handleColorChange" @clear="handleColorClear" />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  defaultColor: {
    type: String,
    default: '#1a5cd6'
  }
})

const emit = defineEmits(['change'])

const themeColor = ref(localStorage.getItem('themeColor') || props.defaultColor)

// 设置 Element Plus 主题色
const setElementPlusTheme = (color) => {
  const lightColor = lightenColor(color, 0.3)
  const darkColor = darkenColor(color, 0.2)
  document.documentElement.style.setProperty('--el-color-primary', color)
  document.documentElement.style.setProperty('--el-color-primary-light-3', lightColor)
  document.documentElement.style.setProperty('--el-color-primary-dark-2', darkColor)
}

// 浅色处理
const lightenColor = (color, ratio) => {
  const hex = color.replace('#', '')
  const r = Math.min(255, Math.round(parseInt(hex.substring(0, 2), 16) + (255 - parseInt(hex.substring(0, 2), 16)) * ratio))
  const g = Math.min(255, Math.round(parseInt(hex.substring(2, 4), 16) + (255 - parseInt(hex.substring(2, 4), 16)) * ratio))
  const b = Math.min(255, Math.round(parseInt(hex.substring(4, 6), 16) + (255 - parseInt(hex.substring(4, 6), 16)) * ratio))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 深色处理
const darkenColor = (color, ratio) => {
  const hex = color.replace('#', '')
  const r = Math.round(parseInt(hex.substring(0, 2), 16) * (1 - ratio))
  const g = Math.round(parseInt(hex.substring(2, 4), 16) * (1 - ratio))
  const b = Math.round(parseInt(hex.substring(4, 6), 16) * (1 - ratio))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 颜色变化处理
const handleColorChange = (color) => {
  if (color) {
    localStorage.setItem('themeColor', color)
    setElementPlusTheme(color)
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { color } }))
    emit('change', color)
  }
}

// 清除颜色时恢复默认色
const handleColorClear = () => {
  themeColor.value = props.defaultColor
  localStorage.setItem('themeColor', props.defaultColor)
  setElementPlusTheme(props.defaultColor)
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { color: props.defaultColor } }))
  emit('change', props.defaultColor)
}

onMounted(() => {
  const saved = localStorage.getItem('themeColor') || props.defaultColor
  themeColor.value = saved
  setElementPlusTheme(saved)
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { color: saved } }))
})
</script>
