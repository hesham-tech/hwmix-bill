import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useWarehousesData() {
  const api = useApi('/api/warehouses');
  const warehouses = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchWarehouses = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      warehouses.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      warehouses.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteWarehouse = async id => {
    return await api.remove(id, { successMessage: 'تم حذف المخزن بنجاح' });
  };

  return { warehouses, loading, total, fetchWarehouses, deleteWarehouse };
}
