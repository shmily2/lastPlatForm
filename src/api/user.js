import request from '@/utils/request'

// 登录
export function login(data) {
  return request({
    url: '/api/login',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
  })
}

// 登出
export function logout() {
  return request({
    url: '/api/logout',
    method: 'post'
  })
}

// 获取菜单列表
export function getMenuList() {
  return request({
    url: '/api/menu/list',
    method: 'get'
  })
}
