// Mock API 拦截
import { users, menus } from './index'

// 模拟API响应
export function mockApi(app) {
  // 登录
  app.config.globalProperties.$mockLogin = (data) => {
    const user = users.find(u => u.username === data.username && u.password === data.password)
    if (user) {
      return {
        code: 200,
        message: '登录成功',
        data: {
          token: `token-${user.id}-${Date.now()}`
        }
      }
    }
    return {
      code: 401,
      message: '用户名或密码错误'
    }
  }

  // 获取用户信息
  app.config.globalProperties.$mockGetUserInfo = (token) => {
    const userId = token.split('-')[1]
    const user = users.find(u => u.id === parseInt(userId))
    if (user) {
      return {
        code: 200,
        message: '成功',
        data: {
          name: user.name,
          avatar: user.avatar,
          roles: user.roles,
          permissions: user.permissions
        }
      }
    }
    return {
      code: 401,
      message: '无效的token'
    }
  }

  // 获取菜单列表
  app.config.globalProperties.$mockGetMenuList = () => {
    return {
      code: 200,
      message: '成功',
      data: menus
    }
  }
}
