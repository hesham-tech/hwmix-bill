import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { warehouseService } from '@/api';
import { toast } from 'vue3-toastify';

export const useWarehouseStore = defineStore('warehouse', () => {
  // State
  const warehouses = ref([]);
  const currentWarehouse = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchWarehouses() {
    loading.value = true;
    try {
      const response = await warehouseService.getAll(params.value, { showToast: false });
      warehouses.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchWarehouse(id) {
    loading.value = true;
    try {
      const response = await warehouseService.getOne(id);
      currentWarehouse.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createWarehouse(data) {
    loading.value = true;
    try {
      const response = await warehouseService.save(data);
      await fetchWarehouses();
      toast.success('تم إنشاء المخزن بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateWarehouse(id, data) {
    loading.value = true;
    try {
      const response = await warehouseService.save(data, id);
      await fetchWarehouses();
      toast.success('تم تحديث المخزن بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteWarehouse(id) {
    loading.value = true;
    try {
      await warehouseService.delete(id);
      await fetchWarehouses();
      toast.success('تم حذف المخزن بنجاح');
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function getWarehouseStock(id) {
    loading.value = true;
    try {
      const response = await warehouseService.getStock(id);
      return response.data;
    } catch (error) {
      console.error('Error getting warehouse stock:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    warehouses,
    currentWarehouse,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    sortBy,

    // Computed
    params,

    // Actions
    fetchWarehouses,
    fetchWarehouse,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseStock,
  };
});
