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
  const hasPermission = permission => {
    if (!permission) return true;
    if (Array.isArray(permission)) {
      return permission.some(p => permissions.value.includes(p));
    }
    return permissions.value.includes(permission);
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
    const staffActionPatterns = ['.create', '.update', '.delete', '.view_all', '.view_children', '.page'];
    const isEmp = permissions.value.some(p => {
      // Check if permission matches any staff action pattern
      return staffActionPatterns.some(pattern => p.endsWith(pattern) || p.includes(pattern));
    });

    return isEmp;
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
