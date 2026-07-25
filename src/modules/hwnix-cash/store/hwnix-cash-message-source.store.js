import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hwnixCashMessageSourceService } from '@/api';
import notificationManager from '@/services/notificationManager';

/**
 * مخزن بيانات مصادر رسائل كاش هونكس
 */
export const useHwnixCashMessageSourceStore = defineStore('hwnix-cash-message-source', () => {
  // State
  const sources = ref([]);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination & filters
  const page = ref(1);
  const itemsPerPage = ref(15);
  const search = ref('');
  const sortBy = ref([]);
  const isActiveFilter = ref(null);
  const providerFilter = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    is_active: isActiveFilter.value,
    provider: providerFilter.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchSources() {
    loading.value = true;
    try {
      const response = await hwnixCashMessageSourceService.getAll(params.value, { showToast: false });
      sources.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching message sources:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createSource(data) {
    loading.value = true;
    try {
      const response = await hwnixCashMessageSourceService.save(data);
      notificationManager.success('تم إضافة المصدر بنجاح');
      await fetchSources();
      return response.data[0];
    } catch (error) {
      console.error('Error creating message source:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateSource(id, data) {
    loading.value = true;
    try {
      const response = await hwnixCashMessageSourceService.save(data, id);
      notificationManager.success('تم تحديث المصدر بنجاح');
      await fetchSources();
      return response.data[0];
    } catch (error) {
      console.error('Error updating message source:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteSource(id) {
    loading.value = true;
    try {
      await hwnixCashMessageSourceService.delete(id);
      notificationManager.success('تم حذف المصدر بنجاح');
      await fetchSources();
    } catch (error) {
      console.error('Error deleting message source:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    isActiveFilter.value = null;
    providerFilter.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    sources, loading, totalItems,
    page, itemsPerPage, search, sortBy, isActiveFilter, providerFilter,
    // Computed
    params,
    // Actions
    fetchSources, createSource, updateSource, deleteSource, resetFilters,
  };
});
