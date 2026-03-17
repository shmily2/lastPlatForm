import { useUserStore } from '@/store/user'

/**
 * 权限检查组合式函数
 * 使用方法：
 * const { hasPermission, hasRole } = usePermission()
 *
 * // 检查权限
 * if (hasPermission('system:user:add')) { ... }
 *
 * // 检查角色
 * if (hasRole('admin')) { ... }
 */
export function usePermission() {
  const userStore = useUserStore()

  /**
   * 检查是否有某个操作权限
   * @param {String|Array} permission - 权限标识，可以是字符串或数组
   * @returns {Boolean} 是否有权限
   */
  const hasPermission = (permission) => {
    const permissions = userStore.permissions

    // 如果有超级权限，直接返回true
    if (permissions.includes('*:*:*')) {
      return true
    }

    // 处理多个权限的情况（满足其中一个即可）
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.includes(p))
    }

    return permissions.includes(permission)
  }

  /**
   * 检查是否有某个角色
   * @param {String|Array} role - 角色标识，可以是字符串或数组
   * @returns {Boolean} 是否有角色
   */
  const hasRole = (role) => {
    const roles = userStore.roles

    // 处理多个角色的情况（满足其中一个即可）
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r))
    }

    return roles.includes(role)
  }

  /**
   * 检查是否有所有指定的权限
   * @param {Array} permissions - 权限标识数组
   * @returns {Boolean} 是否有所有权限
   */
  const hasAllPermissions = (permissions) => {
    const userPermissions = userStore.permissions

    // 如果有超级权限，直接返回true
    if (userPermissions.includes('*:*:*')) {
      return true
    }

    return permissions.every(permission => userPermissions.includes(permission))
  }

  /**
   * 检查是否有所有指定的角色
   * @param {Array} roles - 角色标识数组
   * @returns {Boolean} 是否有所有角色
   */
  const hasAllRoles = (roles) => {
    const userRoles = userStore.roles
    return roles.every(role => userRoles.includes(role))
  }

  return {
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAllRoles,
    roles: userStore.roles,
    permissions: userStore.permissions
  }
}
