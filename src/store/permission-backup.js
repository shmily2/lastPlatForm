// 备用方案：预定义的路由映射（不需要动态导入）

import { defineStore } from 'pinia'
import { constantRoutes } from '@/router/constantRoutes'

// 预定义的组件导入
const components = {
  // 系统管理
  systemUser: () => import('../views/system/user/index.vue'),
  systemRole: () => import('../views/system/role/index.vue'),
  systemMenu: () => import('../views/system/menu/index.vue'),
  // 业务管理
  businessOrder: () => import('../views/business/order/index.vue'),
  businessProduct: () => import('../views/business/product/index.vue'),
  // 数据统计
  statisticsSales: () => import('../views/statistics/sales/index.vue')
}

// 路径到组件的映射
const routeComponentMap = {
  'system/user/index': components.systemUser,
  'system/role/index': components.systemRole,
  'system/menu/index': components.systemMenu,
  'business/order/index': components.businessOrder,
  'business/product/index': components.businessProduct,
  'statistics/sales/index': components.statisticsSales
}

// 权限处理
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  }
  return true
}

// 获取组件
function getComponent(componentPath) {
  return routeComponentMap[componentPath] || (() => import('../views/error/404.vue'))
}

// 将后端菜单数据转换为路由格式
function transformMenuToRoute(menus) {
  return menus.map(menu => {
    const route = {
      path: menu.path,
      name: menu.name || menu.path.replace(/\//g, ''),
      meta: {
        title: menu.title,
        icon: menu.icon,
        hidden: menu.hidden,
        permissions: menu.permissions
      }
    }

    // 只为叶子节点设置组件
    if (menu.component && (!menu.children || menu.children.length === 0)) {
      route.component = getComponent(menu.component)
    } else if (menu.children && menu.children.length > 0) {
      // 有子菜单的父级菜单，设置 redirect 到第一个子菜单
      route.redirect = menu.children[0].path
      route.children = transformMenuToRoute(menu.children)
    }

    return route
  })
}

// 递归过滤异步路由
function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    menuRoutes: []
  }),

  actions: {
    // 生成路由
    async generateRoutes(roles) {
      console.log('generateRoutes 被调用，roles:', roles)

      // 模拟从后端获取菜单数据
      const { menus } = await import('@/mock/index')
      console.log('获取到的菜单数据:', menus)

      // 将后端菜单数据转换为路由
      const backendRoutes = transformMenuToRoute(menus)
      console.log('转换后的路由:', backendRoutes)

      // 过滤有权限的路由
      const accessedRoutes = filterAsyncRoutes(backendRoutes, roles)
      console.log('过滤后的路由:', accessedRoutes)

      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      this.menuRoutes = menus

      return accessedRoutes
    }
  }
})
