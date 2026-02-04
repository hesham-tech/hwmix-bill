import { computed } from 'vue';
import { usePaymentStore } from '../store/payment.store';
import { useDialog, useConfirm } from '@/composables';

export function usePayment() {
  const store = usePaymentStore();
  const { isOpen, formData, isEditMode, open, close } = useDialog();
  const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

  // Computed
  const payments = computed(() => store.payments);
  const loading = computed(() => store.loading);
  const totalItems = computed(() => store.totalItems);

  // Actions
  const loadPayments = async () => {
    await store.fetchPayments();
  };

  const loadPayment = async id => {
    return await store.fetchPayment(id);
  };

  const savePayment = async data => {
    if (isEditMode.value) {
      return await store.updatePayment(formData.value.id, data);
    } else {
      return await store.createPayment(data);
    }
  };

  const handleDelete = payment => {
    confirm(`هل أنت متأكد من حذف الدفعة بمبلغ ${payment.amount}؟`, async () => {
      await store.deletePayment(payment.id);
    });
  };

  const handleEdit = payment => {
    open(payment);
  };

  const handleCreate = () => {
    open({});
  };

  return {
    payments,
    loading,
    totalItems,
    formData,
    isEditMode,
    isOpen,
    open,
    close,
    showConfirm,
    confirmMessage,
    handleConfirm: async () => {
      await handleConfirm();
      await loadPayments();
    },
    handleCancel,
    loadPayments,
    loadPayment,
    savePayment,
    handleDelete,
    handleEdit,
    handleCreate,
  };
}
