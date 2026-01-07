import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useCashBoxTypesData() {
  const api = useApi('/api/cash-box-types');
  const cashBoxTypes = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchCashBoxTypes = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      cashBoxTypes.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      cashBoxTypes.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteCashBoxType = async id => {
    return await api.remove(id, { successMessage: 'تم حذف نوع الخزينة بنجاح' });
  };

  return { cashBoxTypes, loading, total, fetchCashBoxTypes, deleteCashBoxType };
}
