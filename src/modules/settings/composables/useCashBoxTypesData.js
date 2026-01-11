import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useCashBoxTypesData() {
  const api = useApi('/api/cash-box-types');
  const cashBoxTypes = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchCashBoxTypes = async (params = {}, options = {}) => {
    const { append = false } = options;
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });

      let incomingData = [];
      let incomingTotal = 0;

      // Handle both paginated and non-paginated responses
      if (response.data && Array.isArray(response.data.data)) {
        incomingData = response.data.data;
        incomingTotal = response.data.meta?.total || response.data.data.length;
      } else {
        incomingData = response.data || [];
        incomingTotal = response.total || incomingData.length;
      }

      if (append) {
        cashBoxTypes.value = [...cashBoxTypes.value, ...incomingData];
      } else {
        cashBoxTypes.value = incomingData;
      }

      total.value = incomingTotal;
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
