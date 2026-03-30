<template>
  <div class="app-wrapper">
    <header-bar @update:is-collapse="val => isCollapse = val" class="app-header" />
    <div class="app-body">
      <div class="app-header" :style="{ background: menuBg }">
        <div class="sidebarBox">
          <div class="toggle-sidebar">
            <el-tooltip class="box-item" effect="dark" placement="right">
              <template #content>
                招生计划
              </template>
              <el-icon size="20" color="#fff">
                <SetUp />
              </el-icon>
            </el-tooltip>
          </div>
          <div class="toggle-sidebar">
            <el-tooltip class="box-item" effect="dark" placement="right">
              <template #content>
                新专业申报
              </template>
              <el-icon size="20" color="#fff">
                <Platform />
              </el-icon>
            </el-tooltip>
          </div>
          <div class="toggle-sidebar">
            <el-tooltip class="box-item" effect="dark" placement="right">
              <template #content>
                实习管理
              </template>
              <el-icon size="20" color="#fff">
                <UserFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>
      <sidebar :is-collapse="isCollapse" />
      <div class="main-container" :class="{ 'is-collapse': isCollapse }">
        <app-main />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref ,onMounted} from 'vue'
import Sidebar from './components/Sidebar/index.vue'
import HeaderBar from './components/Header/index.vue'
import AppMain from './components/AppMain.vue'
const themeColor = ref(localStorage.getItem('themeColor') || '#1a5cd6')

// 计算菜单背景
const menuBg = computed(() => {
  return `linear-gradient(180deg, ${themeColor.value} 0%, ${lightenColor(themeColor.value)} 100%)`
})

// 浅色颜色
const lightenColor = (color) => {
  const hex = color.replace('#', '')
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + 30)
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + 30)
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + 30)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
// 监听主题颜色变化
const handleThemeChange = (event) => {
  if (event.detail && event.detail.color) {
    themeColor.value = event.detail.color
  }
}
const isCollapse = ref(false)
onMounted(() => {
  // 监听自定义事件
  window.addEventListener('themeChange', handleThemeChange)
})
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.app-header {
  flex-shrink: 0;
  .sidebarBox{
    padding-top:20px;
    width:40px;
    .toggle-sidebar{
      height:56px;
      display:flex;
    justify-content:center;
    }
  }
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 210px);
  transition: width 0.28s;
}

.main-container.is-collapse {
  width: calc(100% - 64px);
}
</style>
