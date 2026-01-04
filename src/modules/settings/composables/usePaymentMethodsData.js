import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

/**
 * Composable for Payment Methods data management
 * إدارة بيانات طرق الدفع
 */
export function usePaymentMethodsData() {
  const api = useApi('/api/payment-methods');

  // State
  const paymentMethods = ref([]);
  const loading = ref(false);
  const total = ref(0);

  /**
   * Fetch payment methods list
   * جلب قائمة طرق الدفع
   */
  const fetchPaymentMethods = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      paymentMethods.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      paymentMethods.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete payment method
   * حذف طريقة دفع
   */
  const deletePaymentMethod = async id => {
    return await api.remove(id, {
      successMessage: 'تم حذف طريقة الدفع بنجاح',
    });
  };

  return {
    // State
    paymentMethods,
    loading,
    total,

    // Methods
    fetchPaymentMethods,
    deletePaymentMethod,
  };
}
