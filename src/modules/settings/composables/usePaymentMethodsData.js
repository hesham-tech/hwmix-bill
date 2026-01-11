import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function usePaymentMethodsData() {
  const api = useApi('/api/payment-methods');
  const paymentMethods = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchPaymentMethods = async (params = {}, options = {}) => {
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
        paymentMethods.value = [...paymentMethods.value, ...incomingData];
      } else {
        paymentMethods.value = incomingData;
      }

      total.value = incomingTotal;
      return response;
    } catch (error) {
      paymentMethods.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deletePaymentMethod = async id => {
    return await api.remove(id, { successMessage: 'تم حذف طريقة الدفع بنجاح' });
  };

  const togglePaymentMethodStatus = async id => {
    return await api.update(`${id}/toggle`, {}, { successMessage: 'تم تغيير حالة طريقة الدفع بنجاح' });
  };

  return { paymentMethods, loading, total, fetchPaymentMethods, deletePaymentMethod, togglePaymentMethodStatus };
}
