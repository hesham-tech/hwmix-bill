import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useRolesData() {
  const api = useApi('/api/roles');
  const roles = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchRoles = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      roles.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      roles.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteRole = async id => {
    return await api.remove(id, { successMessage: 'تم حذف الدور بنجاح' });
  };

  return { roles, loading, total, fetchRoles, deleteRole };
}
