import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useCashBoxesData() {
  const api = useApi('/api/cash-boxes');
  const cashBoxes = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchCashBoxes = async (params = {}, options = {}) => {
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
        cashBoxes.value = [...cashBoxes.value, ...incomingData];
      } else {
        cashBoxes.value = incomingData;
      }

      total.value = incomingTotal;
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
