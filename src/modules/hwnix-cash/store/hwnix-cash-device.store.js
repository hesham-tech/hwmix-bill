import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hwnixCashDeviceService } from '@/api';
import notificationManager from '@/services/notificationManager';

/**
 * تعليق عربي مختصر: مخزن بيانات أجهزة كاش هونكس لإدارة وجلب الأجهزة وتعديل أسمائها وحذفها
 */
export const useHwnixCashDeviceStore = defineStore('hwnix-cash-device', () => {
  // State
  const devices = ref([]);
  const currentDevice = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination & filters
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);
  const statusFilter = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    status: statusFilter.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchDevices() {
    loading.value = true;
    try {
      const response = await hwnixCashDeviceService.getAll(params.value, { showToast: false });
      devices.value = response.data || [];
      totalItems.value = response.total || (response.data ? response.data.length : 0);
      return response;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateDevice(id, data) {
    loading.value = true;
    try {
      const response = await hwnixCashDeviceService.update(id, data);
      notificationManager.success('تم تحديث بيانات الجهاز بنجاح.');
      await fetchDevices();
      return response;
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDevice(id) {
    loading.value = true;
    try {
      const response = await hwnixCashDeviceService.delete(id);
      notificationManager.success('تم إلغاء ربط وإزالة الجهاز بنجاح.');
      await fetchDevices();
      return response;
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    devices,
    currentDevice,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    sortBy,
    statusFilter,
    params,
    fetchDevices,
    updateDevice,
    deleteDevice,
  };
});
