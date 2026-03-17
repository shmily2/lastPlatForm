import { defineStore } from 'pinia'
import { login, logout, getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  }),

  getters: {
    // 检查是否有某个操作权限
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },
    // 检查是否有某个角色
    hasRole: (state) => (role) => {
      return state.roles.includes(role)
    }
  },

  actions: {
    // 登录
    async login(userInfo) {
      const { username, password } = userInfo
      const data = await login({ username, password })
      this.token = data.token
      sessionStorage.setItem('token', data.token)
    },

    // 获取用户信息
    async getUserInfo() {
      // Mock数据：从localStorage获取存储的用户信息
      const token = sessionStorage.getItem('token')
      if (!token) {
        throw new Error('未登录')
      }

      // 模拟从后端获取用户信息（这里使用mock数据）
      const { users } = await import('@/mock/index')
      const userId = token.split('-')[1]
      const user = users.find(u => u.id === parseInt(userId))

      if (!user) {
        throw new Error('用户不存在')
      }

      this.name = user.name
      this.avatar = user.avatar
      this.roles = user.roles || []
      this.permissions = user.permissions || []

      return {
        name: user.name,
        avatar: user.avatar,
        roles: user.roles,
        permissions: user.permissions
      }
    },

    // 登出
    async logout() {
      this.token = ''
      this.name = ''
      this.avatar = ''
      this.roles = []
      this.permissions = []
      sessionStorage.removeItem('token')
    },

    // 重置状态
    resetState() {
      this.token = ''
      this.name = ''
      this.avatar = ''
      this.roles = []
      this.permissions = []
    }
  }
})
