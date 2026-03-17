<template>
  <div class="login-container">
    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
      <div class="title-container">
        <h3 class="title">管理平台登录</h3>
      </div>

      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="用户名" size="large">
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large" show-password>
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-button :loading="loading" type="primary" size="large" class="login-button" @click="handleLogin">
        登录
      </el-button>

      <div class="tips">
        <span>测试账号:</span>
        <span>admin / 123456 (管理员)</span>
        <span>user / 123456 (普通用户)</span>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { usePermissionStore } from '@/store/permission'
import { ElMessage } from 'element-plus'
import { users } from '@/mock'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    // 模拟登录请求
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password)

    if (user) {
      const token = `token-${user.id}-${Date.now()}`
      sessionStorage.setItem('token', token)

      // 设置用户信息
      userStore.token = token
      userStore.name = user.name
      userStore.roles = user.roles
      userStore.permissions = user.permissions

      console.log('登录成功，开始生成路由')
      console.log('用户信息:', { name: user.name, roles: user.roles, permissions: user.permissions })

      // 生成路由和菜单
      await permissionStore.generateRoutes(user.roles, user.permissions)

      ElMessage.success('登录成功')

      const redirect = route.query.redirect || '/'
      console.log('跳转到:', redirect)
      router.push(redirect)
    } else {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100%;
  width: 100%;
  background-color: #2d3a4b;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form {
  width: 420px;
  padding: 40px 35px 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title-container {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 26px;
  color: #333;
  margin: 0 auto 40px;
  font-weight: bold;
}

.login-button {
  width: 100%;
  margin-bottom: 30px;
}

.tips {
  font-size: 14px;
  color: #fff;
  text-align: center;
}

.tips span {
  margin: 0 10px;
}
</style>
