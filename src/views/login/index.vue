<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧插画区 -->
      <div class="login-illustration">
        <div class="school-info">
          <div class="school-logo">
            <svg viewBox="0 0 64 64" width="48" height="48">
              <circle cx="32" cy="32" r="30" fill="#52c41a"/>
              <path d="M20 20h24v4H20zM20 28h24v4H20zM20 36h24v4H20z" fill="#fff"/>
              <circle cx="44" cy="44" r="12" fill="#1890ff"/>
              <path d="M40 44h8M44 40v8" stroke="#fff" stroke-width="2"/>
            </svg>
          </div>
          <div class="school-name">南京市中职高职学校</div>
          <div class="school-name-en">Nanjing secondary vocational and higher vocational schools</div>
        </div>
        <div class="illustration">
          <svg viewBox="0 0 400 300" width="100%" height="100%">
            <!-- 背景装饰 -->
            <rect x="20" y="20" width="60" height="60" rx="8" fill="#e6f7ff" opacity="0.6"/>
            <circle cx="350" cy="50" r="30" fill="#e6f7ff" opacity="0.6"/>
            <rect x="320" y="200" width="50" height="50" rx="8" fill="#e6f7ff" opacity="0.6"/>
            <!-- 云朵 -->
            <path d="M50 80 Q65 60 80 80 Q95 60 110 80 Q125 80 125 95 Q125 110 110 110 L50 110 Q35 110 35 95 Q35 80 50 80" fill="#fff" opacity="0.8"/>
            <path d="M280 60 Q295 40 310 60 Q325 40 340 60 Q355 60 355 75 Q355 90 340 90 L280 90 Q265 90 265 75 Q265 60 280 60" fill="#fff" opacity="0.8"/>
            <!-- 电脑 -->
            <rect x="120" y="120" width="140" height="100" rx="8" fill="#1890ff"/>
            <rect x="125" y="125" width="130" height="85" rx="4" fill="#e6f7ff"/>
            <rect x="160" y="220" width="60" height="20" rx="4" fill="#1890ff"/>
            <rect x="140" y="240" width="100" height="12" rx="4" fill="#40a9ff"/>
            <!-- 书籍 -->
            <rect x="280" y="160" width="80" height="60" rx="4" fill="#52c41a" transform="rotate(-10 320 190)"/>
            <rect x="285" y="165" width="70" height="50" rx="2" fill="#fff" transform="rotate(-10 320 190)"/>
            <!-- 男孩子 -->
            <circle cx="80" cy="180" r="25" fill="#ffecd2"/>
            <circle cx="80" cy="175" r="28" fill="#1890ff"/>
            <ellipse cx="80" cy="220" rx="20" ry="30" fill="#1890ff"/>
            <!-- 女孩子 -->
            <circle cx="320" cy="170" r="22" fill="#ffecd2"/>
            <circle cx="320" cy="165" r="25" fill="#ff85c0"/>
            <ellipse cx="320" cy="205" rx="18" ry="28" fill="#ff85c0"/>
            <!-- 几何图形装饰 -->
            <circle cx="30" cy="250" r="15" fill="none" stroke="#1890ff" stroke-width="2"/>
            <rect x="360" y="140" width="20" height="20" fill="none" stroke="#52c41a" stroke-width="2" transform="rotate(45 370 150)"/>
          </svg>
        </div>
      </div>

      <!-- 右侧登录表单区 -->
      <div class="login-form">
        <!-- 登录方式切换 -->
        <div class="login-tabs">
          <div
            class="tab-item"
            :class="{ active: loginType === 'sms' }"
            @click="loginType = 'sms'"
          >
            手机验证码登录
          </div>
          <div
            class="tab-item"
            :class="{ active: loginType === 'password' }"
            @click="loginType = 'password'"
          >
            账号密码登录
          </div>
        </div>

        <!-- 手机验证码登录表单 -->
        <el-form
          v-if="loginType === 'sms'"
          ref="smsFormRef"
          :model="smsForm"
          :rules="smsRules"
          class="form-content"
        >
          <el-form-item prop="phone">
            <el-input v-model="smsForm.phone" placeholder="请输入手机号" size="large">
              <template #prefix>
                <el-icon><Cellphone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="smsCode">
            <el-input v-model="smsForm.smsCode" placeholder="请输入短信验证码" size="large">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
            <el-button
              class="send-code-btn"
              :disabled="smsCountdown > 0"
              @click="sendSmsCode"
            >
              {{ smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码' }}
            </el-button>
          </el-form-item>

          <el-form-item prop="captcha">
            <el-input v-model="smsForm.captcha" placeholder="请输入验证码" size="large">
              <template #prefix>
                <el-icon><CircleCheck /></el-icon>
              </template>
            </el-input>
            <div class="captcha-img" @click="refreshCaptcha">
              {{ captchaText }}
            </div>
          </el-form-item>

          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-button"
            @click="handleSmsLogin"
          >
            登录
          </el-button>
        </el-form>

        <!-- 账号密码登录表单 -->
        <el-form
          v-else
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          class="form-content"
        >
          <el-form-item prop="username">
            <el-input v-model="passwordForm.username" placeholder="请输入用户名" size="large">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="passwordForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="captcha">
            <el-input v-model="passwordForm.captcha" placeholder="请输入验证码" size="large">
              <template #prefix>
                <el-icon><CircleCheck /></el-icon>
              </template>
            </el-input>
            <div class="captcha-img" @click="refreshCaptcha">
              {{ captchaText }}
            </div>
          </el-form-item>

          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-button"
            @click="handlePasswordLogin"
          >
            登录
          </el-button>
        </el-form>

        <!-- 第三方登录 -->
        <div class="third-party-login">
          <div class="third-party-title">微信扫码登录</div>
          <div class="qrcode">
            <svg viewBox="0 0 100 100" width="120" height="120">
              <rect width="100" height="100" fill="#fff" stroke="#ccc"/>
              <!-- 模拟二维码图案 -->
              <rect x="10" y="10" width="25" height="25" fill="#000"/>
              <rect x="15" y="15" width="15" height="15" fill="#fff"/>
              <rect x="18" y="18" width="9" height="9" fill="#000"/>

              <rect x="65" y="10" width="25" height="25" fill="#000"/>
              <rect x="70" y="15" width="15" height="15" fill="#fff"/>
              <rect x="73" y="18" width="9" height="9" fill="#000"/>

              <rect x="10" y="65" width="25" height="25" fill="#000"/>
              <rect x="15" y="70" width="15" height="15" fill="#fff"/>
              <rect x="18" y="73" width="9" height="9" fill="#000"/>

              <!-- 中间区域随机块 -->
              <rect x="40" y="10" width="5" height="5" fill="#000"/>
              <rect x="50" y="10" width="5" height="5" fill="#000"/>
              <rect x="40" y="20" width="5" height="5" fill="#000"/>
              <rect x="55" y="20" width="5" height="5" fill="#000"/>

              <rect x="10" y="40" width="5" height="5" fill="#000"/>
              <rect x="20" y="45" width="5" height="5" fill="#000"/>
              <rect x="40" y="40" width="20" height="20" fill="#000"/>
              <rect x="45" y="45" width="10" height="10" fill="#fff"/>

              <rect x="65" y="40" width="5" height="5" fill="#000"/>
              <rect x="80" y="45" width="5" height="5" fill="#000"/>

              <rect x="40" y="65" width="5" height="5" fill="#000"/>
              <rect x="55" y="70" width="5" height="5" fill="#000"/>
              <rect x="45" y="80" width="5" height="5" fill="#000"/>
              <rect x="65" y="80" width="5" height="5" fill="#000"/>

              <!-- 微信图标 -->
              <circle cx="50" cy="60" r="12" fill="#07c160"/>
              <path d="M42 58 Q42 54 46 54 Q50 50 54 54 Q58 58 54 62 Q50 66 46 62 Q42 58 42 58" fill="#fff"/>
              <circle cx="48" cy="58" r="2" fill="#07c160"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { usePermissionStore } from '@/store/permission'
import { ElMessage } from 'element-plus'
import { users } from '@/mock'
import { Cellphone, Message, CircleCheck, User, Lock } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const loading = ref(false)
const loginType = ref('sms')
const smsCountdown = ref(0)
const captchaText = ref('')

// 手机验证码表单
const smsFormRef = ref(null)
const smsForm = reactive({
  phone: '',
  smsCode: '',
  captcha: ''
})

const smsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  smsCode: [
    { required: true, message: '请输入短信验证码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value.toLowerCase() !== captchaText.value.toLowerCase()) {
        callback(new Error('验证码错误'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 账号密码表单
const passwordFormRef = ref(null)
const passwordForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

const passwordRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value.toLowerCase() !== captchaText.value.toLowerCase()) {
        callback(new Error('验证码错误'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 生成随机验证码
const generateCaptcha = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  captchaText.value = result
}

const refreshCaptcha = () => {
  generateCaptcha()
}

// 发送短信验证码
const sendSmsCode = () => {
  if (!smsForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(smsForm.phone)) {
    ElMessage.warning('手机号格式不正确')
    return
  }
  smsCountdown.value = 60
  const timer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  ElMessage.success('验证码已发送')
}

// 手机验证码登录
const handleSmsLogin = async () => {
  const valid = await smsFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // 模拟登录
    ElMessage.success('登录成功')
    await loginSuccess()
  } catch (error) {
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}

// 账号密码登录
const handlePasswordLogin = async () => {
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const user = users.find(u => u.username === passwordForm.username && u.password === passwordForm.password)

    if (user) {
      const token = `token-${user.id}-${Date.now()}`
      sessionStorage.setItem('token', token)

      userStore.token = token
      userStore.name = user.name
      userStore.roles = user.roles
      userStore.permissions = user.permissions

      await permissionStore.generateRoutes(user.roles, user.permissions)

      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/'
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

const loginSuccess = async () => {
  const user = users.find(u => u.username === 'admin')
  const token = `token-${user.id}-${Date.now()}`
  sessionStorage.setItem('token', token)

  userStore.token = token
  userStore.name = user.name
  userStore.roles = user.roles
  userStore.permissions = user.permissions

  await permissionStore.generateRoutes(user.roles, user.permissions)

  const redirect = route.query.redirect || '/'
  router.push(redirect)
}

onMounted(() => {
  generateCaptcha()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1a5cd6 0%, #2979ff 50%, #4dabf7 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-container {
  display: flex;
  width: 900px;
  max-width: 100%;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* 左侧插画区 */
.login-illustration {
  flex: 1;
  background: linear-gradient(135deg, #1a5cd6 0%, #2979ff 100%);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-illustration::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.school-info {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.school-logo {
  margin-bottom: 16px;
}

.school-name {
  font-size: 22px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
}

.school-name-en {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  max-height: 300px;
}

/* 右侧登录表单 */
.login-form {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.login-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding-bottom: 12px;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-item:hover {
  color: #2979ff;
}

.tab-item.active {
  color: #2979ff;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #2979ff;
}

.form-content {
  flex: 1;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #1a5cd6 0%, #2979ff 100%);
  border: none;
  margin-top: 10px;
}

.login-button:hover {
  background: linear-gradient(135deg, #1540a8 0%, #2066cc 100%);
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #2979ff inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2979ff inset;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

.send-code-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  background: transparent;
  border: 1px solid #2979ff;
  color: #2979ff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.send-code-btn:hover:not(:disabled) {
  background: #e6f0ff;
}

.send-code-btn:disabled {
  color: #999;
  border-color: #ddd;
}

.captcha-img {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: 'Georgia', serif;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 4px;
  color: #333;
  cursor: pointer;
  user-select: none;
}

/* 第三方登录 */
.third-party-login {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
}

.third-party-title {
  font-size: 14px;
  color: #2979ff;
  margin-bottom: 12px;
}

.qrcode {
  display: inline-block;
  padding: 10px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }

  .login-illustration {
    padding: 30px 20px;
    max-height: 200px;
  }

  .school-name {
    font-size: 18px;
  }

  .login-form {
    padding: 30px 20px;
  }

  .login-tabs {
    gap: 16px;
  }

  .tab-item {
    font-size: 14px;
  }
}
</style>
