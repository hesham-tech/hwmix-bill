import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/axios.config';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null);
  const permissions = ref([]);
  const roles = ref([]);

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
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  // Check if user has a specific permission
  const hasPermission = permission => {
    if (!permission) return true; // No permission required
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
  };

  // Computed: Check if user is admin/super
  const isAdmin = computed(() => hasPermission('admin.super'));
  const isCompanyAdmin = computed(() => hasPermission('admin.company'));

  return {
    currentUser,
    permissions,
    roles,
    isAdmin,
    isCompanyAdmin,
    fetchUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    clearUser,
  };
});
