import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useInvoiceTypesData() {
  const api = useApi('/api/invoice-types');
  const invoiceTypes = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchInvoiceTypes = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      invoiceTypes.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      invoiceTypes.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteInvoiceType = async id => {
    return await api.remove(id, { successMessage: 'تم حذف نوع الفاتورة بنجاح' });
  };

  return { invoiceTypes, loading, total, fetchInvoiceTypes, deleteInvoiceType };
}
