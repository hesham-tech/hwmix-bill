import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function usePaymentMethodsData() {
  const api = useApi('/api/payment-methods');
  const paymentMethods = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchPaymentMethods = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      // Handle both paginated and non-paginated responses
      if (response.data && Array.isArray(response.data.data)) {
        paymentMethods.value = response.data.data;
        total.value = response.data.meta?.total || response.data.data.length;
      } else {
        paymentMethods.value = response.data || [];
        total.value = response.total || paymentMethods.value.length;
      }
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
