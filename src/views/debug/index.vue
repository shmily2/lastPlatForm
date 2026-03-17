<template>
  <div style="padding: 20px;">
    <h2>调试信息</h2>
    <el-divider />
    <h3>用户信息</h3>
    <pre>{{ userInfo }}</pre>

    <el-divider />
    <h3>菜单数据</h3>
    <pre>{{ menuRoutes }}</pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { usePermissionStore } from '@/store/permission'

const userStore = useUserStore()
const permissionStore = usePermissionStore()

const userInfo = computed(() => ({
  name: userStore.name,
  roles: userStore.roles,
  permissions: userStore.permissions
}))

const menuRoutes = computed(() => permissionStore.menuRoutes)
</script>
