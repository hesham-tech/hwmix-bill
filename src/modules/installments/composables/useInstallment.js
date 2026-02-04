import { computed } from 'vue';
import { useInstallmentStore } from '../store/installment.store';
import { useDialog, useConfirm } from '@/composables';

export function useInstallment() {
  const store = useInstallmentStore();
  const { isOpen, formData, isEditMode, open, close } = useDialog();
  const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

  // Computed
  const plans = computed(() => store.plans);
  const payments = computed(() => store.payments);
  const loading = computed(() => store.loading);
  const totalItems = computed(() => store.totalItems);

  // Plan Actions
  const loadPlans = async () => {
    await store.fetchPlans();
  };

  const loadPlan = async id => {
    return await store.fetchPlan(id);
  };

  const savePlan = async data => {
    if (isEditMode.value) {
      return await store.updatePlan(formData.value.id, data);
    } else {
      return await store.createPlan(data);
    }
  };

  const handleDeletePlan = plan => {
    confirm(`هل أنت متأكد من حذف خطة التقسيط؟`, async () => {
      await store.deletePlan(plan.id);
    });
  };

  const handleEditPlan = plan => {
    open(plan);
  };

  const handleCreatePlan = () => {
    open({});
  };

  // Payment Actions
  const loadPayments = async (planId = null) => {
    await store.fetchPayments(planId);
  };

  const createPayment = async data => {
    return await store.createPayment(data);
  };

  // Payment Details Actions
  const loadPaymentDetails = async paymentId => {
    return await store.fetchPaymentDetails(paymentId);
  };

  const createPaymentDetail = async data => {
    return await store.createPaymentDetail(data);
  };

  const updatePaymentDetail = async (id, data) => {
    return await store.updatePaymentDetail(id, data);
  };

  return {
    // State
    plans,
    payments,
    loading,
    totalItems,
    formData,
    isEditMode,

    // Dialog
    isOpen,
    open,
    close,

    // Confirm
    showConfirm,
    confirmMessage,
    handleConfirm: async () => {
      await handleConfirm();
      await loadPlans();
    },
    handleCancel,

    // Plan Actions
    loadPlans,
    loadPlan,
    savePlan,
    handleDeletePlan,
    handleEditPlan,
    handleCreatePlan,

    // Payment Actions
    loadPayments,
    createPayment,

    // Payment Details Actions
    loadPaymentDetails,
    createPaymentDetail,
    updatePaymentDetail,
  };
}
