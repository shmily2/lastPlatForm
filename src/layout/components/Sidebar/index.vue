<template>
  <div class="sidebar-container" :class="{ 'is-collapse': isCollapse }">
    <div class="logo-container">
      <h1 v-if="!isCollapse">管理平台</h1>
      <h1 v-else>管</h1>
    </div>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :unique-opened="true"
      :collapse-transition="false"
      mode="vertical"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
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
import { computed, watch } from 'vue'
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

const menuList = computed(() => {
  const menus = permissionStore.menuRoutes
  console.log('Sidebar menuList:', menus)
  return menus
})

const activeMenu = computed(() => route.path)

// 监听 menuList 变化
watch(menuList, (newVal) => {
  console.log('Sidebar menuList 变化:', newVal)
}, { immediate: true, deep: true })

const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  transition: width 0.28s;
  overflow-y: auto;
}

.sidebar-container.is-collapse {
  width: 64px;
}

.logo-container {
  height: 50px;
  line-height: 50px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #263445;
  overflow: hidden;
}
</style>
