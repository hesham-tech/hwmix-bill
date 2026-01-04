import { useUserStore } from '@/stores/user';

/**
 * Composable for checking permissions
 * استخدام: const { can, canAny, canAll } = usePermissions()
 */
export function usePermissions() {
  const userStore = useUserStore();

  /**
   * Check single permission
   * @param {string} permission - Permission key (e.g., 'invoices.create')
   * @returns {boolean}
   */
  const can = permission => {
    return userStore.hasPermission(permission);
  };

  /**
   * Check if user has ANY of the permissions
   * @param {...string} permissions - Permission keys
   * @returns {boolean}
   */
  const canAny = (...permissions) => {
    return userStore.hasAnyPermission(...permissions);
  };

  /**
   * Check if user has ALL of the permissions
   * @param {...string} permissions - Permission keys
   * @returns {boolean}
   */
  const canAll = (...permissions) => {
    return userStore.hasAllPermissions(...permissions);
  };

  /**
   * Check if user has a specific role
   * @param {string} role - Role name
   * @returns {boolean}
   */
  const hasRole = role => {
    return userStore.hasRole(role);
  };

  return {
    can,
    canAny,
    canAll,
    hasRole,
  };
}
