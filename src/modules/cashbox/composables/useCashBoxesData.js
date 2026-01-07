import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useCashBoxesData() {
  const api = useApi('/api/cash-boxes');
  const cashBoxes = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchCashBoxes = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      cashBoxes.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      cashBoxes.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteCashBox = async id => {
    return await api.remove(id, { successMessage: 'تم حذف الخزينة بنجاح' });
  };

  return { cashBoxes, loading, total, fetchCashBoxes, deleteCashBox };
}
