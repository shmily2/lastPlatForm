import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import { constantRoutes } from './constantRoutes'
import { layoutRoutes } from './layoutRoutes'
import { usePermissionStore } from '@/store/permission'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [...constantRoutes, ...layoutRoutes],
  scrollBehavior: () => ({ top: 0 })
})

// 重置路由
export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: [...constantRoutes, ...layoutRoutes]
  })
  router.matcher = newRouter.matcher
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const hasToken = sessionStorage.getItem('token')

  console.log('路由守卫执行:', { path: to.path, hasToken, roles: userStore.roles })

  if (hasToken) {
    if (to.path === '/login') {
      console.log('已登录，重定向到首页')
      next({ path: '/' })
    } else {
      try {
        const hasRoles = userStore.roles && userStore.roles.length > 0
        const hasRoutes = permissionStore.addRoutes && permissionStore.addRoutes.length > 0

        console.log('角色检查:', { hasRoles, hasRoutes, roles: userStore.roles })

        // 如果已经有角色和路由，直接放行
        if (hasRoles && hasRoutes) {
          console.log('已加载角色和路由，检查路由是否真的存在')
          // 检查路由是否真的在 router 中（刷新后 store 有数据但 router 没有）
          const allRoutes = router.getRoutes()
          const hasDynamicRoutes = allRoutes.some(r => r.path.startsWith('/internship') || r.path.startsWith('/assignment') || r.path.startsWith('/leave'))
          console.log('动态路由是否存在:', hasDynamicRoutes)

          if (!hasDynamicRoutes) {
            console.log('动态路由不存在，重新添加路由')
            const accessRoutes = permissionStore.addRoutes
            accessRoutes.forEach(route => {
              console.log(`重新添加路由: ${route.path}`)
              router.addRoute(route)
            })
            router.addRoute({
              path: '/:pathMatch(.*)*',
              redirect: '/404'
            })
            console.log('路由重新添加完成')
            await nextTick()
            next({ ...to, replace: true })
          } else {
            next()
          }
        } else {
          console.log('开始获取用户信息')
          // 获取用户信息和权限
          const data = await userStore.getUserInfo()
          console.log('用户信息:', data)

          // 根据角色和权限生成可访问的路由
          console.log('开始生成路由')
          const accessRoutes = await permissionStore.generateRoutes(data.roles, data.permissions)
          console.log('生成的路由:', accessRoutes)

          // 添加所有动态路由
          accessRoutes.forEach(route => {
            console.log(`添加路由: ${route.path}`)
            router.addRoute(route)
          })

          // 添加404路由
          router.addRoute({
            path: '/:pathMatch(.*)*',
            redirect: '/404'
          })

          console.log('当前所有路由:', router.getRoutes().map(r => ({ path: r.path, name: r.name })))
          console.log('路由添加完成，重新导航')

          // 等待路由注册完成
          await nextTick()
          next({ ...to, replace: true })
        }
      } catch (error) {
        console.error('路由守卫错误:', error)
        await userStore.logout()
        next(`/login?redirect=${to.path}`)
      }
    }
  } else {
    if (to.path === '/login') {
      console.log('未登录，显示登录页')
      next()
    } else {
      console.log('未登录，重定向到登录页')
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
