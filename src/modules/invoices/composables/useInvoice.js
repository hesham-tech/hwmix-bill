import { computed } from 'vue';
import { useInvoiceStore } from '../store/invoice.store';
import { useDialog, useConfirm } from '@/composables';

/**
 * useInvoice Composable
 * Logic reuse للـ invoice operations
 */
export function useInvoice() {
  const store = useInvoiceStore();
  const { isOpen, formData, isEditMode, open, close } = useDialog();
  const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

  // Computed
  const invoices = computed(() => store.invoices);
  const loading = computed(() => store.loading);
  const totalItems = computed(() => store.totalItems);

  // Actions
  const loadInvoices = async () => {
    await store.fetchInvoices();
  };

  const loadInvoice = async id => {
    return await store.fetchInvoice(id);
  };

  const saveInvoice = async data => {
    if (isEditMode.value) {
      return await store.updateInvoice(formData.value.id, data);
    } else {
      return await store.createInvoice(data);
    }
  };

  const handleDelete = invoice => {
    confirm(`هل أنت متأكد من حذف الفاتورة #${invoice.invoice_number}؟`, async () => {
      await store.deleteInvoice(invoice.id);
    });
  };

  const handleView = invoice => {
    // Navigate to view page or open view dialog
    formData.value = invoice;
  };

  const handleEdit = invoice => {
    open(invoice);
  };

  const handleCreate = (type = 'sales') => {
    open({ type });
  };

  const downloadPDF = async invoiceId => {
    await store.downloadPDF(invoiceId);
  };

  const sendByEmail = async (invoiceId, emailData) => {
    await store.sendEmail(invoiceId, emailData);
  };

  return {
    // State
    invoices,
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
      await loadInvoices();
    },
    handleCancel,

    // Actions
    loadInvoices,
    loadInvoice,
    saveInvoice,
    handleDelete,
    handleView,
    handleEdit,
    handleCreate,
    downloadPDF,
    sendByEmail,
  };
}
