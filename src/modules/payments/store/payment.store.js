import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { paymentService } from '@/api';
import { toast } from 'vue3-toastify';

export const usePaymentStore = defineStore('payment', () => {
  // State
  const payments = ref([]);
  const currentPayment = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);

  // Filters
  const invoiceFilter = ref(null);
  const customerFilter = ref(null);
  const methodFilter = ref(null);
  const dateFrom = ref(null);
  const dateTo = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    invoice_id: invoiceFilter.value,
    customer_id: customerFilter.value,
    method: methodFilter.value,
    date_from: dateFrom.value,
    date_to: dateTo.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchPayments() {
    loading.value = true;
    try {
      const response = await paymentService.getAll(params.value, { showToast: false });
      payments.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPayment(id) {
    loading.value = true;
    try {
      const response = await paymentService.getOne(id);
      currentPayment.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createPayment(data) {
    loading.value = true;
    try {
      const response = await paymentService.save(data);
      await fetchPayments();
      toast.success('تم تسجيل الدفعة بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updatePayment(id, data) {
    loading.value = true;
    try {
      const response = await paymentService.save(data, id);
      await fetchPayments();
      toast.success('تم تحديث الدفعة بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deletePayment(id) {
    loading.value = true;
    try {
      await paymentService.delete(id);
      await fetchPayments();
      toast.success('تم حذف الدفعة بنجاح');
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    invoiceFilter.value = null;
    customerFilter.value = null;
    methodFilter.value = null;
    dateFrom.value = null;
    dateTo.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    payments,
    currentPayment,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    sortBy,
    invoiceFilter,
    customerFilter,
    methodFilter,
    dateFrom,
    dateTo,

    // Computed
    params,

    // Actions
    fetchPayments,
    fetchPayment,
    createPayment,
    updatePayment,
    deletePayment,
    resetFilters,
  };
});
