import { useUserStore } from '@/store/user'

/**
 * 权限指令
 * 使用方法：
 * v-permission="['system:user:add']"
 * v-permission="'system:user:add'"
 */
export default {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions

    if (value) {
      const requiredPermissions = Array.isArray(value) ? value : [value]
      const hasPermission = requiredPermissions.some(permission => {
        return permissions.includes(permission) || permissions.includes('*:*:*')
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限值，如 v-permission="\'system:user:add\'"')
    }
  }
}

/**
 * 角色指令
 * 使用方法：
 * v-role="['admin']"
 * v-role="'admin'"
 */
export const role = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const roles = userStore.roles

    if (value) {
      const requiredRoles = Array.isArray(value) ? value : [value]
      const hasRole = requiredRoles.some(role => {
        return roles.includes(role)
      })

      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('需要指定角色值，如 v-role="\'admin\'"')
    }
  }
}
