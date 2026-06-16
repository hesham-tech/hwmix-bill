import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/axios.config';
import { PERMISSIONS } from '@/config/permissions';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null);
  const permissions = ref([]);
  const roles = ref([]);
  const companies = ref([]);

  // Fetch current user data and initial configuration from bootstrap endpoint
  const fetchUser = async () => {
    try {
      const response = await apiClient.get('bootstrap');
      const bootstrapData = response.data.data;

      currentUser.value = bootstrapData.user;

      // Extract permissions array from backend response
      permissions.value = bootstrapData.user.permissions || [];

      // Extract roles with their permissions
      roles.value = bootstrapData.user.roles || [];

      // Extract available companies
      companies.value = bootstrapData.user.companies || [];

      // Sync branches from user data
      if (bootstrapData.user.branches) {
        try {
          const { useBranchStore } = await import('@/stores/branch');
          const branchStore = useBranchStore();
          branchStore.setBranches(bootstrapData.user.branches);
        } catch (e) {
          console.error('Failed to sync branches from user data:', e);
        }
      }

      // Sync initial screen preferences into uiPreferences store
      if (bootstrapData.screen_preferences) {
        try {
          const { useUIPreferencesStore } = await import('@/stores/uiPreferences');
          const uiPrefsStore = useUIPreferencesStore();
          
          const userId = bootstrapData.user.id;
          const companyId = bootstrapData.user.active_company_id;

          Object.keys(bootstrapData.screen_preferences).forEach(key => {
            const pref = bootstrapData.screen_preferences[key];
            uiPrefsStore.preferences[key] = pref;

            // Cache in LocalStorage
            const cacheKey = `ui_pref_${userId}_${companyId}_${key}`;
            localStorage.setItem(cacheKey, JSON.stringify(pref));
          });
        } catch (e) {
          console.error('Failed to sync screen preferences from bootstrap:', e);
        }
      }
    } catch (error) {
      console.error('Failed to bootstrap application:', error);
    }
  };

  // Check if user has a specific permission (can be string or array)
  const hasPermission = (permission, options = {}) => {
    if (!permission) return false;

    // 1. Admin Overrides: Check raw permissions directly to avoid recursion
    const rawPermissions = permissions.value || [];
    
    // Super admin bypasses EVERYTHING
    if (rawPermissions.includes(PERMISSIONS.ADMIN_SUPER)) return true;

    // Helper to determine if a permission strictly requires Super Admin or Company management permissions
    const isRestrictedPermission = p => {
      if (typeof p !== 'string') return false;
      return p === PERMISSIONS.ADMIN_SUPER ||
             p.startsWith('companies.') ||
             p.startsWith('subscriptions.') ||
             p.startsWith('plans.') ||
             p.startsWith('backups.') ||
             p.startsWith('error_reports.');
    };

    // Company admin bypasses everything EXCEPT super admin and company management permissions
    if (rawPermissions.includes(PERMISSIONS.ADMIN_COMPANY)) {
      if (Array.isArray(permission)) {
        // If all are restricted, block access
        const hasNonRestricted = permission.some(p => !isRestrictedPermission(p));
        if (!hasNonRestricted) return false;
      } else if (isRestrictedPermission(permission)) {
        return false;
      }
      return true;
    }

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

    // Clear branch store
    try {
      import('@/stores/branch').then(m => {
        const branchStore = m.useBranchStore();
        branchStore.clearBranches();
      });
    } catch (e) {}
  };

  // Switch Active Company
  const switchCompany = async companyId => {
    try {
      const response = await apiClient.put(`change-company/${currentUser.value.id}`, {
        company_id: companyId,
      });

      // Backend sends { status: true, ... }
      if (response.data.status || response.data.success) {
        // مسح الفرع النشط من المتصفح لمنع تعارض الفرع مع الشركة الجديدة
        // يحتفظ كل جهاز بفرعه الخاص (localStorage)، لذا نحذف الفرع فقط
        // وعند إعادة التحميل سيتم تعيين الفرع الافتراضي للشركة الجديدة تلقائياً
        localStorage.removeItem('active_branch_id');
        localStorage.removeItem('available_branches');
        // Reload the current page to refresh all stores under the new company context
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

  // A user is "Staff" if the API indicated they are staff or admin
  const isStaff = computed(() => !!currentUser.value?.is_staff_or_admin);
  
  const userType = computed(() => currentUser.value?.user_type || 'customer');

  const hasInstallments = computed(() => !!currentUser.value?.has_installments);

  const currentCompany = computed(() => {
    if (!currentUser.value || !companies.value.length) return null;
    return companies.value.find(c => c.id === currentUser.value.active_company_id) || companies.value[0];
  });

  const updatePrintFormat = async format => {
    try {
      if (!currentCompany.value) return;

      const companyId = currentCompany.value.id;
      const settings = currentCompany.value.settings || {};
      const print_settings = settings.print_settings || {};

      const response = await apiClient.put(`companies/${companyId}`, {
        settings: {
          ...settings,
          print_settings: {
            ...print_settings,
            print_format: format,
          },
        },
      });

      if (response.data.status || response.data.success) {
        // Update local state
        const companyIndex = companies.value.findIndex(c => c.id === companyId);
        if (companyIndex !== -1) {
          companies.value[companyIndex].settings = response.data.data.settings;
          companies.value[companyIndex].print_settings = response.data.data.print_settings;
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to update print format:', error);
      throw error;
    }
  };

  return {
    currentUser,
    currentCompany,
    permissions,
    roles,
    companies,
    isAdmin,
    isCompanyAdmin,
    isStaff,
    userType,
    hasInstallments,
    fetchUser,
    switchCompany,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    clearUser,
    updatePrintFormat,
    /**
     * Update current user data partially (useful for balance sync from API responses)
     */
    updateUser: (data) => {
      if (!currentUser.value || !data) return;
      currentUser.value = { ...currentUser.value, ...data };
    },
  };
});
