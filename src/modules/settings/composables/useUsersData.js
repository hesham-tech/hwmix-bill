import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useUsersData() {
  const api = useApi('/api/users');
  const users = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchUsers = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      users.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      users.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async id => {
    return await api.remove(id, { successMessage: 'تم حذف المستخدم بنجاح' });
  };

  return { users, loading, total, fetchUsers, deleteUser };
}
