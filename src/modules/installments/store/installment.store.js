import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { installmentService, installmentDetailService } from '@/api';
import { toast } from 'vue3-toastify';

export const useInstallmentStore = defineStore('installment', () => {
  // State
  const plans = ref([]);
  const currentPlan = ref(null);
  const payments = ref([]);
  const paymentDetails = ref([]);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);

  // Filters
  const statusFilter = ref(null);
  const customerFilter = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    status: statusFilter.value,
    customer_id: customerFilter.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Plan Actions
  async function fetchPlans() {
    loading.value = true;
    try {
      const response = await installmentService.getPlans(params.value, { showToast: false });
      plans.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPlan(id) {
    loading.value = true;
    try {
      const response = await installmentService.getOne(id, { full: true });
      currentPlan.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching plan:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createPlan(data) {
    loading.value = true;
    try {
      const response = await installmentService.createPlan(data);
      toast.success('تم إنشاء خطة التقسيط بنجاح');
      await fetchPlans();
      return response.data[0];
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updatePlan(id, data) {
    loading.value = true;
    try {
      const response = await installmentService.updatePlan(id, data);
      toast.success('تم تحديث خطة التقسيط بنجاح');
      await fetchPlans();
      return response.data[0];
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deletePlan(id) {
    loading.value = true;
    try {
      await installmentService.delete(id);
      toast.success('تم حذف خطة التقسيط بنجاح');
      await fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Payment Actions
  async function fetchPayments(planId = null) {
    loading.value = true;
    try {
      const params = planId ? { installment_plan_id: planId } : {};
      const response = await installmentService.getPayments(params, { showToast: false });
      payments.value = response.data;
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createPayment(data) {
    loading.value = true;
    try {
      const response = await installmentService.createPayment(data);
      toast.success('تم تسجيل دفعة التقسيط بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Payment Details Actions
  async function fetchPaymentDetails(paymentId) {
    loading.value = true;
    try {
      const response = await installmentDetailService.getByPayment(paymentId, { showToast: false });
      paymentDetails.value = response.data;
      return response;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createPaymentDetail(data) {
    loading.value = true;
    try {
      const response = await installmentDetailService.createDetail(data);
      toast.success('تم إضافة تفاصيل الدفعة بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error creating payment detail:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Note: Update is disabled due to backend issue
  async function updatePaymentDetail(id, data) {
    loading.value = true;
    try {
      // Use workaround: delete old + create new
      await installmentDetailService.replaceDetail(id, data);
      toast.success('تم تحديث تفاصيل الدفعة بنجاح');
    } catch (error) {
      console.error('Error updating payment detail:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    statusFilter.value = null;
    customerFilter.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    plans,
    currentPlan,
    payments,
    paymentDetails,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    sortBy,
    statusFilter,
    customerFilter,

    // Computed
    params,

    // Actions - Plans
    fetchPlans,
    fetchPlan,
    createPlan,
    updatePlan,
    deletePlan,

    // Actions - Payments
    fetchPayments,
    createPayment,

    // Actions - Payment Details
    fetchPaymentDetails,
    createPaymentDetail,
    updatePaymentDetail,

    resetFilters,
  };
});
