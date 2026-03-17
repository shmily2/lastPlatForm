<template>
  <div class="navbar">
    <div class="left">
      <hamburger :is-active="isCollapse" @toggle-click="toggleSideBar" />
      <breadcrumb />
    </div>
    <div class="right">
      <el-dropdown @command="handleCommand">
        <span class="el-dropdown-link">
          <el-avatar :size="32" :src="userStore.avatar" />
          <span class="username">{{ userStore.name }}</span>
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
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import Hamburger from './Hamburger.vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'

const emit = defineEmits('update:isCollapse')

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)

const toggleSideBar = () => {
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
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #333;
}
</style>
