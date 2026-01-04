import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { userService } from '@/api';
import { toast } from 'vue3-toastify';

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([]);
  const currentUser = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);

  // Filters
  const roleFilter = ref(null);
  const statusFilter = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    role: roleFilter.value,
    status: statusFilter.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchUsers() {
    loading.value = true;
    try {
      const response = await userService.getAll(params.value, { showToast: false });
      users.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    } finally {
      loading.value = false;
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
      await fetchUsers();
      toast.success('تم إنشاء المستخدم بنجاح');
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
      const response = await userService.save(data, id);
      await fetchUsers();
      toast.success('تم تحديث المستخدم بنجاح');
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
      await fetchUsers();
      toast.success('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function assignRole(userId, roleId) {
    loading.value = true;
    try {
      await userService.assignRole(userId, roleId);
      await fetchUser(userId);
      toast.success('تم تعيين الدور بنجاح');
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updatePermissions(userId, permissions) {
    loading.value = true;
    try {
      await userService.updatePermissions(userId, permissions);
      toast.success('تم تحديث الصلاحيات بنجاح');
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    roleFilter.value = null;
    statusFilter.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    users,
    currentUser,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    sortBy,
    roleFilter,
    statusFilter,

    // Computed
    params,

    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    updatePermissions,
    resetFilters,
  };
});
