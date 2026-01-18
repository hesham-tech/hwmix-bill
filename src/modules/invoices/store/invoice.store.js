import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { invoiceService } from '@/api';
import { toast } from 'vue3-toastify';

export const useInvoiceStore = defineStore('invoice', () => {
  // State
  const invoices = ref([]);
  const currentInvoice = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);

  // Filters
  const typeFilter = ref(null); // 'sales', 'purchases', 'installment_sale'
  const statusFilter = ref(null);
  const dateFrom = ref(null);
  const dateTo = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    type: typeFilter.value,
    status: statusFilter.value,
    date_from: dateFrom.value,
    date_to: dateTo.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  const salesInvoices = computed(() => invoices.value.filter(inv => inv.invoice_type?.context === 'sales'));

  const purchaseInvoices = computed(() => invoices.value.filter(inv => inv.invoice_type?.context === 'purchases'));

  const installmentInvoices = computed(() => invoices.value.filter(inv => inv.invoice_type?.context === 'installment_sale'));

  // Actions
  async function fetchInvoices() {
    loading.value = true;
    try {
      const response = await invoiceService.getAll(params.value, { showToast: false });
      invoices.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchInvoice(id) {
    loading.value = true;
    try {
      const response = await invoiceService.getOne(id, { full: true });
      currentInvoice.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createInvoice(data) {
    loading.value = true;
    try {
      const response = await invoiceService.save(data);
      toast.success('تم إنشاء الفاتورة بنجاح');
      await fetchInvoices(); // Refresh list
      return response.data[0];
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateInvoice(id, data) {
    loading.value = true;
    try {
      const response = await invoiceService.save(data, id);
      toast.success('تم تحديث الفاتورة بنجاح');
      await fetchInvoices(); // Refresh list
      return response.data[0];
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteInvoice(id) {
    loading.value = true;
    try {
      await invoiceService.delete(id);
      toast.success('تم حذف الفاتورة بنجاح');
      await fetchInvoices(); // Refresh list
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function downloadPDF(id) {
    try {
      await invoiceService.getPDF(id, { showToast: true });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  async function sendEmail(id, emailData) {
    loading.value = true;
    try {
      await invoiceService.sendEmail(id, emailData);
      toast.success('تم إرسال الفاتورة عبر البريد بنجاح');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    typeFilter.value = null;
    statusFilter.value = null;
    dateFrom.value = null;
    dateTo.value = null;
    search.value = '';
    page.value = 1;
  }

  function setTypeFilter(type) {
    typeFilter.value = type;
    page.value = 1;
    fetchInvoices();
  }

  return {
    // State
    invoices,
    currentInvoice,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    sortBy,
    typeFilter,
    statusFilter,
    dateFrom,
    dateTo,

    // Computed
    params,
    salesInvoices,
    purchaseInvoices,
    installmentInvoices,

    // Actions
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    downloadPDF,
    sendEmail,
    resetFilters,
    setTypeFilter,
  };
});
