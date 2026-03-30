<template>
  <div class="navbar" :style="{ background: headerBg }">
    <!-- 左侧：Logo 与校名 -->
    <div class="left">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 64 64" width="32" height="32">
            <circle cx="32" cy="32" r="30" fill="#52c41a" />
            <text x="32" y="40" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">N</text>
          </svg>
        </div>
        <div class="logo-text">
          <div><span class="school-name">产教融合智慧培养平台</span></div>
          <span class="school-name-en">Industry-education integration and smart training platform</span>
        </div>
      </div>
    </div>

    <!-- 中间：系统切换 + 菜单缩放 -->
    <div class="center">
      <div class="menu-fold" @click="toggleCollapse">
        <el-icon :size="18">
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
      </div>
      <div class="system-tabs">
        <div class="tab-item active" @click="handleTabClick('intern')">
          实习系统
        </div>
      </div>
    </div>

    <!-- 右侧：功能区 -->
    <div class="right">
      <div class="header-actions">
        <ThemePicker />
        <el-popover placement="bottom" :width="260" trigger="click">
          <template #reference>
             <el-image :src="qrcodeUrl"></el-image>
          </template>
          <template #default>
            <el-image :src="codePng"></el-image>
          </template>
        </el-popover>
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <span class="username">您好，{{ userStore.name }}</span>
            <el-icon>
              <ArrowDown />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="home">首页</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import qrcodeUrl from '@/assets/qrcode.png'
import codePng from '@/assets/code.png'
import { ArrowDown, Fold, Expand } from '@element-plus/icons-vue'
import ThemePicker from '../ThemePicker/index.vue'

const emit = defineEmits('update:isCollapse')

const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const themeColor = ref(localStorage.getItem('themeColor') || '#1a5cd6')

// 计算头部背景
const headerBg = computed(() => {
  return `linear-gradient(135deg, ${themeColor.value} 0%, ${lightenColor(themeColor.value)} 100%)`
})

// 浅色颜色
const lightenColor = (color) => {
  const hex = color.replace('#', '')
  const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + 30)
  const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + 30)
  const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + 30)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const handleThemeChange = (e) => {
  themeColor.value = e.detail.color
}

onMounted(() => {
  window.addEventListener('themeChange', handleThemeChange)
})

onUnmounted(() => {
  window.removeEventListener('themeChange', handleThemeChange)
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
  emit('update:isCollapse', isCollapse.value)
}

const handleCommand = (command) => {
  switch (command) {
    case 'home':
      router.push('/')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: background 0.3s;
}

.left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  width: 350px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.school-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}

.school-name-en {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
}

.center {
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
}

.menu-fold {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.3s;
}

.menu-fold:hover {
  background: rgba(255, 255, 255, 0.15);
}

.system-tabs {
  display: flex;
  gap: 8px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.tab-item {
  padding: 8px 20px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.tab-item.active {
  color: #fff;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 3px;
  background: #ff6b00;
  border-radius: 2px;
}

.right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  width: 260px;
  justify-content: flex-end;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #fff;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.3s;
}

.action-icon:hover {
  background: rgba(255, 255, 255, 0.15);
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

.el-dropdown-link:hover {
  background: rgba(255, 255, 255, 0.15);
}

.username {
  font-size: 14px;
  color: #fff;
}
</style>
