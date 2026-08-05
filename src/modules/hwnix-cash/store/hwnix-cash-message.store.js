import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hwnixCashMessageService } from '@/api';

/**
 * مخزن بيانات رسائل كاش هونكس (قراءة فقط)
 */
export const useHwnixCashMessageStore = defineStore('hwnix-cash-message', () => {
  // State
  const messages = ref([]);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination & filters
  const page = ref(1);
  const itemsPerPage = ref(15);
  const search = ref('');
  const sortBy = ref([]);
  const lineFilter = ref(null);
  const providerFilter = ref(null);
  const dateFrom = ref(null);
  const dateTo = ref(null);
  const isProcessedFilter = ref(null);
  const statusFilter = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    line_id: lineFilter.value,
    provider: providerFilter.value,
    date_from: dateFrom.value,
    date_to: dateTo.value,
    is_processed: isProcessedFilter.value,
    status: statusFilter.value,
    sort_by: sortBy.value[0]?.key || 'received_at',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchMessages() {
    loading.value = true;
    try {
      const response = await hwnixCashMessageService.getAll(params.value, { showToast: false });
      messages.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function reparseMessage(id) {
    try {
      const response = await hwnixCashMessageService.reparse(id);
      await fetchMessages();
      return response;
    } catch (error) {
      console.error('Error reparsing message:', error);
      throw error;
    }
  }

  function resetFilters() {
    lineFilter.value = null;
    providerFilter.value = null;
    dateFrom.value = null;
    dateTo.value = null;
    isProcessedFilter.value = null;
    statusFilter.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    messages, loading, totalItems,
    page, itemsPerPage, search, sortBy,
    lineFilter, providerFilter, dateFrom, dateTo, isProcessedFilter, statusFilter,
    // Computed
    params,
    // Actions
    fetchMessages, reparseMessage, resetFilters,
  };
});
