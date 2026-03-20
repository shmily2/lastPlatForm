<template>
  <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }" :style="{ background: menuBg }">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :unique-opened="true"
      :collapse-transition="true"
      mode="vertical"
      :background-color="themeColor"
      text-color="rgba(255, 255, 255, 0.85)"
      active-text-color="#fff"
      @select="handleSelect"
    >
      <!-- 首页菜单 -->
      <el-menu-item index="/dashboard">
        <el-icon><HomeFilled /></el-icon>
        <template #title>
          <span>首页</span>
        </template>
      </el-menu-item>

      <!-- 动态菜单 -->
      <menu-item
        v-for="menu in menuList"
        :key="menu.id"
        :menu="menu"
      />
    </el-menu>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore } from '@/store/permission'
import { HomeFilled } from '@element-plus/icons-vue'
import MenuItem from '@/components/MenuTree/MenuItem.vue'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

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

const menuList = computed(() => {
  const menus = permissionStore.menuRoutes
  console.log('Sidebar menuList:', menus)
  return menus
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.meta.lightPaht ? route.meta.lightPaht : route.path
})

// 监听 menuList 变化
watch(menuList, (newVal) => {
  console.log('Sidebar menuList 变化:', newVal)
}, { immediate: true, deep: true })

// 监听主题颜色变化
const handleThemeChange = (event) => {
  if (event.detail && event.detail.color) {
    themeColor.value = event.detail.color
  }
}

onMounted(() => {
  // 监听自定义事件
  window.addEventListener('themeChange', handleThemeChange)
})

const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.sidebar-container {
  width: 210px;
  height: 100%;
  background: linear-gradient(180deg, #1a5cd6 0%, #2979ff 100%);
  transition: background 0.3s;
  overflow-y: auto;
}

.sidebar-container.is-collapse {
  width: 64px;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
:deep(.el-sub-menu.is-active >.el-sub-menu__title){
 background-color: rgba(255, 255, 255, 0.2) !important;
}
</style>
