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
      warehouses.value = response.data.map(item => ({
        ...item,
        is_active: item.status === 'active',
      }));
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
      const data = response.data[0];
      currentWarehouse.value = {
        ...data,
        is_active: data.status === 'active',
      };
      return currentWarehouse.value;
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
      const payload = {
        ...data,
        status: data.is_active ? 'active' : 'inactive',
      };
      const response = await warehouseService.save(payload);
      toast.success('تم إنشاء المخزن بنجاح');
      await fetchWarehouses();
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
      const payload = {
        ...data,
        status: data.is_active ? 'active' : 'inactive',
      };
      const response = await warehouseService.save(payload, id);
      toast.success('تم تحديث المخزن بنجاح');
      await fetchWarehouses();
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
      toast.success('تم حذف المخزن بنجاح');
      await fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function setDefaultWarehouse(id) {
    loading.value = true;
    try {
      await warehouseService.setDefault(id);
      toast.success('تم تعيين المخزن كافتراضي');
      await fetchWarehouses();
    } catch (error) {
      console.error('Error setting default warehouse:', error);
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
    setDefaultWarehouse,
    getWarehouseStock,
  };
});
