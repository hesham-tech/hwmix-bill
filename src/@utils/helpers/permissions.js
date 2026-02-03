import { useUserStore } from '@/stores/user';

/**
 * Global Permission Utility
 *
 * Usage:
 * import { can } from '@utils/helpers/permissions'
 * if (can('invoices.delete', { resource: invoice, action: 'invoices' })) { ... }
 */
export const can = (permission, options = {}) => {
  const userStore = useUserStore();
  return userStore.hasPermission(permission, options);
};

export const canAny = (...permissions) => {
  const userStore = useUserStore();
  return userStore.hasAnyPermission(...permissions);
};

export const canAll = (...permissions) => {
  const userStore = useUserStore();
  return userStore.hasAllPermissions(...permissions);
};

export default {
  can,
  canAny,
  canAll,
};
