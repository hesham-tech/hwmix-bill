import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hwnixCashWalletTransactionService } from '@/api';
import notificationManager from '@/services/notificationManager';

/**
 * مخزن بيانات معاملات محافظ كاش هونكس
 */
export const useHwnixCashWalletTransactionStore = defineStore('hwnix-cash-wallet-transaction', () => {
  // State
  const transactions = ref([]);
  const currentTransaction = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination & filters
  const page = ref(1);
  const itemsPerPage = ref(15);
  const search = ref('');
  const sortBy = ref([]);
  const lineFilter = ref(null);
  const typeFilter = ref(null);
  const statusFilter = ref(null);
  const providerFilter = ref(null);
  const dateFrom = ref(null);
  const dateTo = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    line_id: lineFilter.value,
    transaction_type: typeFilter.value,
    status: statusFilter.value,
    provider: providerFilter.value,
    date_from: dateFrom.value,
    date_to: dateTo.value,
    sort_by: sortBy.value[0]?.key || 'transaction_date',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchTransactions() {
    loading.value = true;
    try {
      const response = await hwnixCashWalletTransactionService.getAll(params.value, { showToast: false });
      transactions.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTransaction(id) {
    loading.value = true;
    try {
      const response = await hwnixCashWalletTransactionService.getOne(id);
      currentTransaction.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching wallet transaction:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createTransaction(data) {
    loading.value = true;
    try {
      const response = await hwnixCashWalletTransactionService.save(data);
      notificationManager.success('تم إضافة المعاملة بنجاح');
      await fetchTransactions();
      return response.data[0];
    } catch (error) {
      console.error('Error creating wallet transaction:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTransaction(id) {
    loading.value = true;
    try {
      await hwnixCashWalletTransactionService.delete(id);
      notificationManager.success('تم حذف المعاملة بنجاح');
      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting wallet transaction:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    lineFilter.value = null;
    typeFilter.value = null;
    statusFilter.value = null;
    providerFilter.value = null;
    dateFrom.value = null;
    dateTo.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    transactions, currentTransaction, loading, totalItems,
    page, itemsPerPage, search, sortBy,
    lineFilter, typeFilter, statusFilter, providerFilter, dateFrom, dateTo,
    // Computed
    params,
    // Actions
    fetchTransactions, fetchTransaction, createTransaction, deleteTransaction, resetFilters,
  };
});
