import { defineStore } from 'pinia'
import { constantRoutes } from '@/router/constantRoutes'

// 使用 Vite 的 glob 导入获取所有视图组件
const viewComponents = import.meta.glob('../views/**/*.vue', { eager: false })

console.log('已加载的组件列表:', Object.keys(viewComponents))
console.log('internship/list/index.vue 是否存在:', '../views/internship/list/index.vue' in viewComponents || '../views/internship/list' in viewComponents)

// 组件路径映射 - 从 glob 结果中提取
function getComponentPath(componentPath) {
  // 如果没有 componentPath，返回默认的 404 组件
  if (!componentPath) {
    console.log('没有 componentPath，返回 404 组件')
    return () => import('../views/error/404.vue')
  }

  // 规范化路径
  const normalized = componentPath.replace(/^\//, '').replace(/\/+/g, '/')
  const fullPath = `../views/${normalized}.vue`

  console.log(`查找组件: ${componentPath} -> ${fullPath}`)

  // 直接检查路径是否在 glob 结果中
  const allPaths = Object.keys(viewComponents)
  console.log('所有可用组件路径:', allPaths)

  // 精确匹配
  if (viewComponents[fullPath]) {
    console.log(`✓ 找到组件: ${fullPath}`)
    return viewComponents[fullPath]
  }

  // 尝试其他可能的路径格式
  const altPath1 = `../views/${normalized}/index.vue`
  const altPath2 = `../views/${normalized}`  // 不加 .vue
  const altPath3 = `/src/views/${normalized}.vue`

  console.log(`尝试备用路径: ${altPath1}, ${altPath2}, ${altPath3}`)

  if (viewComponents[altPath1]) {
    console.log(`✓ 找到组件(备用1): ${altPath1}`)
    return viewComponents[altPath1]
  }

  // 检查是否有类似的路径
  const similarPaths = allPaths.filter(p => p.includes(normalized))
  console.log(`找到相似路径:`, similarPaths)

  if (similarPaths.length > 0) {
    console.log(`✓ 使用相似路径: ${similarPaths[0]}`)
    return viewComponents[similarPaths[0]]
  }

  console.warn(`✗ 组件不存在: ${fullPath}, 可用路径:`, Object.keys(viewComponents))
  // 返回简单的错误组件作为降级方案
  return {
    template: '<div style="padding: 20px; text-align: center;"><el-result icon="error" title="组件加载失败" sub-title="请刷新页面重试"></el-result></div>'
  }
}

// 权限处理 - 检查是否有权限访问某个菜单/路由
function hasPermission(roles, menuOrRoute, userPermissions) {
  const menuTitle = menuOrRoute.title || menuOrRoute.meta?.title || '未知菜单'

  // 如果有 admin 角色，拥有所有权限
  if (roles.includes('admin')) {
    console.log(`✓ ${menuTitle}：admin 角色，拥有所有权限`)
    return true
  }

  // 如果有超级权限（*:*:*），拥有所有权限
  if (userPermissions && userPermissions.includes('*:*:*')) {
    console.log(`✓ ${menuTitle}：拥有超级权限 (*:*:*)`)
    return true
  }

  const permissions = menuOrRoute.permissions || menuOrRoute.meta?.permissions

  // 如果没有指定权限要求，默认允许访问
  if (!permissions || permissions.length === 0) {
    console.log(`✓ ${menuTitle}：没有权限要求，允许访问`)
    return true
  }

  // 检查用户是否有匹配的权限
  const hasMatch = permissions.some(requiredPerm => {
    return userPermissions.some(userPerm => {
      // 支持通配符权限，如 system:*:* 匹配 system:user:view
      if (userPerm === '*:*:*') return true
      if (userPerm === requiredPerm) return true

      // 处理通配符匹配
      const userParts = userPerm.split(':')
      const requiredParts = requiredPerm.split(':')

      if (userParts.length !== 3 || requiredParts.length !== 3) {
        return userPerm === requiredPerm
      }

      // 检查每一部分的匹配
      for (let i = 0; i < 3; i++) {
        if (userParts[i] !== '*' && userParts[i] !== requiredParts[i]) {
          return false
        }
      }

      return true
    })
  })

  if (hasMatch) {
    console.log(`✓ ${menuTitle}：有权限`)
  } else {
    console.log(`✗ ${menuTitle}：无权限`, { 需要: permissions, 拥有: userPermissions })
  }

  return hasMatch
}

// 将后端菜单数据转换为路由格式
function transformMenuToRoute(menus) {
  return menus.map(menu => {
    // 如果有子菜单，这是一个父级路由，需要包裹在 layout 中
    if (menu.children && menu.children.length > 0) {
      // 转换子路由，子路由路径应该是相对于父路由的
      const childrenRoutes = menu.children.map(child => {
        return {
          path: child.path,
          name: child.name || child.path.replace(/\//g, ''),
          component: getComponentPath(child.component),
          meta: {
            title: child.title,
            icon: child.icon,
            hidden: child.hidden,
            permissions: child.permissions,
            lightPaht:child.lightPaht,
          }
        }
      })

      // redirect 使用相对路径
      const redirectPath = menu.children[0].path.split('/').filter(p => p).pop() || ''

      return {
        path: menu.path,
        component: () => import('../layout/index.vue'),
        redirect: redirectPath,
        children: childrenRoutes,
        meta: {
          title: menu.title,
          icon: menu.icon,
          hidden: menu.hidden,
          permissions: menu.permissions
        }
      }
    } else {
      // 叶子节点 - 包裹在 layout 中
      return {
        path: menu.path,
        component: () => import('../layout/index.vue'),
        children: [
          {
            path: '',
            name: menu.name || menu.path.replace(/\//g, ''),
            component: getComponentPath(menu.component),
            meta: {
              title: menu.title,
              icon: menu.icon,
              hidden: menu.hidden,
              permissions: menu.permissions
            }
          }
        ]
      }
    }
  })
}

// 递归过滤异步路由
function filterAsyncRoutes(routes, roles, permissions) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp, permissions)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles, permissions)
      }
      res.push(tmp)
    }
  })

  return res
}

// 递归过滤菜单数据（用于显示）
function filterMenus(menus, roles, userPermissions) {
  console.log('filterMenus 开始过滤:', { 菜单数量: menus.length, roles, permissions: userPermissions })

  const filtered = menus
    .map(menu => {
      const tmp = { ...menu }

      // 如果有子菜单，先递归过滤子菜单
      if (tmp.children && tmp.children.length > 0) {
        console.log(`处理父级菜单: ${menu.title}，子菜单数量: ${menu.children.length}`)
        tmp.children = filterMenus(tmp.children, roles, userPermissions)

        console.log(`父级菜单 ${menu.title} 过滤后的子菜单:`, tmp.children.map(c => c.title))

        // 如果过滤后子菜单为空，说明没有任何可访问的子菜单
        if (tmp.children.length === 0) {
          console.log(`父级菜单 ${menu.title} 没有可访问的子菜单，将被过滤`)
          return null
        }

        // 如果有可访问的子菜单，父级菜单应该显示（即使父级菜单本身没有权限）
        // 因为父级菜单只是一个容器
        console.log(`父级菜单 ${menu.title} 保留，子菜单数量: ${tmp.children.length}`)
        return tmp
      } else {
        // 叶子节点，检查是否有权限
        const hasAccess = hasPermission(roles, tmp, userPermissions)
        console.log(`叶子菜单 ${menu.title} 权限检查:`, {
          需要的权限: tmp.permissions,
          结果: hasAccess
        })

        if (hasAccess) {
          return tmp
        }
        return null
      }
    })
    .filter(menu => menu !== null)

  console.log('filterMenus 过滤完成，结果:', filtered.map(m => m.title))
  return filtered
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: [],
    addRoutes: [],
    menuRoutes: []
  }),

  actions: {
    // 生成路由
    async generateRoutes(roles, permissions = []) {
      console.log('========================================')
      console.log('generateRoutes 被调用')
      console.log('========================================')
      console.log('用户角色:', roles)
      console.log('用户权限:', permissions)

      // 模拟从后端获取菜单数据
      const { menus } = await import('@/mock/index')
      console.log('\n获取到的菜单数据:', menus)

      // 将后端菜单数据转换为路由
      const backendRoutes = transformMenuToRoute(menus)
      console.log('\n转换后的路由:', backendRoutes)

      // 过滤有权限的路由
      const accessedRoutes = filterAsyncRoutes(backendRoutes, roles, permissions)
      console.log('\n过滤后的路由:', accessedRoutes)

      // 过滤有权限的菜单（用于显示）
      const filteredMenus = filterMenus(menus, roles, permissions)
      console.log('\n过滤后的菜单:', filteredMenus)

      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)

      // 重要：设置 menuRoutes
      console.log('\n设置 menuRoutes:', filteredMenus)
      this.menuRoutes = filteredMenus

      console.log('当前 store 状态:', {
        routes: this.routes.length,
        addRoutes: this.addRoutes.length,
        menuRoutes: this.menuRoutes.length
      })

      return accessedRoutes
    }
  }
})
