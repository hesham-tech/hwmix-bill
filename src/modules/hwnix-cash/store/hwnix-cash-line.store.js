import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hwnixCashLineService } from '@/api';
import notificationManager from '@/services/notificationManager';

/**
 * مخزن بيانات خطوط كاش هونكس
 */
export const useHwnixCashLineStore = defineStore('hwnix-cash-line', () => {
  // State
  const lines = ref([]);
  const currentLine = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination & filters
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);
  const statusFilter = ref(null);
  const providerFilter = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    status: statusFilter.value,
    provider: providerFilter.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchLines() {
    loading.value = true;
    try {
      const response = await hwnixCashLineService.getAll(params.value, { showToast: false });
      lines.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching lines:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLine(id) {
    loading.value = true;
    try {
      const response = await hwnixCashLineService.getOne(id);
      currentLine.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching line:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateLine(id, data) {
    loading.value = true;
    try {
      const response = await hwnixCashLineService.save(data, id);
      notificationManager.success('تم تحديث بيانات الخط بنجاح');
      await fetchLines();
      return response.data[0];
    } catch (error) {
      console.error('Error updating line:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function reconcileLine(id, data) {
    loading.value = true;
    try {
      const response = await hwnixCashLineService.reconcile(id, data);
      notificationManager.success('تمت تسوية الرصيد الحسابي وتسجيل قيد التسوية المالية بنجاح');
      await fetchLines();
      return response.data[0];
    } catch (error) {
      console.error('Error reconciling line balance:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function forceDeleteLine(id) {
    loading.value = true;
    try {
      const response = await hwnixCashLineService.forceDelete(id);
      notificationManager.success('تم حذف الخط وجميع بياناته نهائياً بنجاح');
      await fetchLines();
      return response;
    } catch (error) {
      console.error('Error force deleting line:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    statusFilter.value = null;
    providerFilter.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    lines, currentLine, loading, totalItems,
    page, itemsPerPage, search, sortBy, statusFilter, providerFilter,
    // Computed
    params,
    // Actions
    fetchLines, fetchLine, updateLine, reconcileLine, forceDeleteLine, resetFilters,
  };
});
