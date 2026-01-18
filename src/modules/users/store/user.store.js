import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService, roleService, permissionService } from '@/api';
import { toast } from 'vue3-toastify';

export const useUserStore = defineStore('userManagement', () => {
  // State
  const users = ref([]);
  const roles = ref([]);
  const availablePermissions = ref({});
  const currentUser = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);
  const stats = ref({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
  });

  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);

  // Filters
  const roleFilter = ref(null);
  const statusFilter = ref(null);
  const isGlobalMode = ref(false);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    role: roleFilter.value,
    status: statusFilter.value,
    sort_by: sortBy.value[0]?.key || undefined,
    order: sortBy.value[0]?.order || 'desc',
    global: isGlobalMode.value,
  }));

  // Actions
  async function lookupUser(searchParams) {
    loading.value = true;
    try {
      const response = await userService.lookup(searchParams);
      return response.data;
    } catch (error) {
      console.error('Error looking up user:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchUsers(options = {}) {
    const { append = false } = options;
    loading.value = true;
    try {
      const response = await userService.getAll(params.value, { showToast: false });

      if (append) {
        users.value = [...users.value, ...response.data];
      } else {
        users.value = response.data;
      }

      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchStats() {
    try {
      const response = await userService.getStats();
      stats.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }

  async function fetchUser(id) {
    loading.value = true;
    try {
      const response = await userService.getOne(id);
      currentUser.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createUser(data) {
    loading.value = true;
    try {
      const response = await userService.save(data);
      toast.success('تم إنشاء المستخدم بنجاح');
      await fetchUsers();
      await fetchStats();
      return response.data[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(id, data) {
    loading.value = true;
    try {
      const response = await userService.update(id, data);
      toast.success('تم تحديث المستخدم بنجاح');
      await fetchUsers();
      await fetchStats();
      return response.data[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteUser(id) {
    loading.value = true;
    try {
      await userService.delete(id);
      toast.success('تم حذف المستخدم بنجاح');
      await fetchUsers();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function assignRole(userId, roles) {
    loading.value = true;
    try {
      await userService.assignRole(userId, roles);
      toast.success('تم تعيين الدور بنجاح');
      await fetchUser(userId);
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRoles() {
    try {
      const response = await roleService.getAll();
      roles.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }

  async function fetchAvailablePermissions() {
    try {
      const response = await permissionService.getAll();
      availablePermissions.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  }

  function resetFilters() {
    roleFilter.value = null;
    statusFilter.value = null;
    search.value = '';
    page.value = 1;
  }

  const createRole = async data => {
    const response = await roleService.create(data);
    if (response) {
      toast.success('تم إنشاء الدور بنجاح');
      await fetchRoles();
    }
    return response;
  };

  const updateRole = async (id, data) => {
    const response = await roleService.update(id, data);
    if (response) {
      toast.success('تم تحديث الدور بنجاح');
      await fetchRoles();
    }
    return response;
  };

  const deleteRole = async id => {
    const response = await roleService.delete(id);
    if (response) {
      toast.success('تم حذف الدور بنجاح');
      await fetchRoles();
    }
    return response;
  };

  return {
    // State
    users,
    roles,
    availablePermissions,
    currentUser,
    loading,
    totalItems,
    stats,
    page,
    itemsPerPage,
    search,
    sortBy,
    roleFilter,
    statusFilter, // Added statusFilter to return
    isGlobalMode,

    // Computed
    params,

    // Actions
    fetchUsers,
    fetchStats,
    fetchUser,
    lookupUser,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    fetchRoles,
    fetchAvailablePermissions,
    resetFilters,
    createRole,
    updateRole,
    deleteRole,
  };
});
