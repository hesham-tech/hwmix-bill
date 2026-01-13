import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/axios.config';
import { PERMISSIONS } from '@/config/permissions';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null);
  const permissions = ref([]);
  const roles = ref([]);
  const companies = ref([]);

  // Fetch current user data from backend
  const fetchUser = async () => {
    try {
      const response = await apiClient.get('/me');
      const data = response.data;

      currentUser.value = data.data;

      // Extract permissions array from backend response
      permissions.value = data.data.permissions || [];

      // Extract roles with their permissions
      roles.value = data.data.roles || [];

      // Extract available companies
      companies.value = data.data.companies || [];
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  // Check if user has a specific permission (can be string or array)
  const hasPermission = (permission, options = {}) => {
    // 1. Admin Overrides: Check raw permissions directly to avoid recursion
    const rawPermissions = permissions.value || [];
    if (rawPermissions.includes(PERMISSIONS.ADMIN_SUPER) || rawPermissions.includes(PERMISSIONS.ADMIN_COMPANY)) return true;

    if (!permission) return true;

    // 2. Handle metadata/ownership if provided
    const { resource = null } = options;

    const checkSingle = p => {
      // Direct match
      if (permissions.value.includes(p)) return true;

      // If checking for a "self" permission, also allow if they have the "all" version
      if (p.endsWith('_self')) {
        const allPermission = p.replace('_self', '_all');
        if (permissions.value.includes(allPermission)) return true;
      }

      // If resource is provided, check ownership for "self" permissions
      if (resource) {
        const userId = currentUser.value?.id;
        const isOwner = resource.created_by === userId || resource.user_id === userId;

        // If user is owner, they can perform "self" level actions
        if (isOwner) {
          // If the permission requested is the "all" version, but they only have "self", return true ONLY if owner
          if (p.endsWith('_all')) {
            const selfPermission = p.replace('_all', '_self');
            if (permissions.value.includes(selfPermission)) return true;
          }
        }
      }

      return false;
    };

    if (Array.isArray(permission)) {
      return permission.some(p => checkSingle(p));
    }

    return checkSingle(permission);
  };

  // Check if user has ANY of the permissions
  const hasAnyPermission = (...perms) => {
    return perms.some(p => hasPermission(p));
  };

  // Check if user has ALL of the permissions
  const hasAllPermissions = (...perms) => {
    return perms.every(p => hasPermission(p));
  };

  // Check if user has a specific role
  const hasRole = role => {
    return roles.value.some(r => r.name === role);
  };

  // Check if user has ANY of the roles
  const hasAnyRole = (...roleNames) => {
    return roleNames.some(r => hasRole(r));
  };

  // Reset user data
  const clearUser = () => {
    currentUser.value = null;
    permissions.value = [];
    roles.value = [];
    companies.value = [];
  };

  // Switch Active Company
  const switchCompany = async companyId => {
    try {
      const response = await apiClient.post(`/users/${currentUser.value.id}/change-company`, {
        company_id: companyId,
      });

      if (response.data.success) {
        // Full page reload is the safest way to reset all stores and
        // ensure all subsequent requests use the new company context.
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to switch company:', error);
      throw error;
    }
  };

  // Computed: Check if user is admin/super
  const isAdmin = computed(() => hasPermission(PERMISSIONS.ADMIN_SUPER));
  const isCompanyAdmin = computed(() => hasPermission(PERMISSIONS.ADMIN_COMPANY));

  // A user is "Staff" if they have ANY administrative or company-level permission
  const isStaff = computed(() => {
    if (isAdmin.value || isCompanyAdmin.value) return true;

    // Staff patterns: categories where possessing even one permission indicates an employee/admin role
    const staffActionPatterns = ['.view_all', '.view_children', '.create', '.update', '.delete', '.page'];

    return permissions.value.some(p => {
      return staffActionPatterns.some(pattern => p.includes(pattern));
    });
  });

  return {
    currentUser,
    permissions,
    roles,
    companies,
    isAdmin,
    isCompanyAdmin,
    isStaff,
    fetchUser,
    switchCompany,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    clearUser,
  };
});
