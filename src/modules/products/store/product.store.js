import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import productService from '@/api/services/product.service';
import warehouseService from '@/api/services/warehouse.service';
import { toast } from 'vue3-toastify';

export const useProductStore = defineStore('product', () => {
  // --- State ---
  const products = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);
  const defaultWarehouseId = ref(null);

  // Pagination & Filters
  const page = ref(1);
  const itemsPerPage = ref(15);
  const search = ref('');
  const sortBy = ref([{ key: 'created_at', order: 'desc' }]);
  const filters = ref({
    category_id: null,
    brand_id: null,
    active: null,
    featured: null,
  });

  // --- Computed ---
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value === -1 ? 1000 : itemsPerPage.value,
    search: search.value,
    sort_by: sortBy.value[0]?.key,
    sort_order: sortBy.value[0]?.order,
    ...filters.value,
  }));

  // --- Actions ---
  async function fetchProducts() {
    loading.value = true;
    try {
      const response = await productService.getAll(params.value);
      if (response.status) {
        products.value = response.data;
        totalItems.value = response.meta?.total || response.data.length;
      }
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id) {
    loading.value = true;
    try {
      const response = await productService.getOne(id);
      if (response.status) {
        currentProduct.value = Array.isArray(response.data) ? response.data[0] : response.data;
      }
      return currentProduct.value;
    } finally {
      loading.value = false;
    }
  }

  async function saveProduct(data, id = null) {
    loading.value = true;
    try {
      const response = await productService.save(data, id);
      if (response.status) {
        toast.success(id ? 'تم تحديث المنتج بنجاح' : 'تم إنشاء المنتج بنجاح');
        await fetchProducts();
      }
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id) {
    loading.value = true;
    try {
      const response = await productService.delete(id);
      if (response.status) {
        toast.success('تم حذف المنتج بنجاح');
        await fetchProducts();
      }
      return response;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDefaultWarehouse() {
    if (defaultWarehouseId.value) return defaultWarehouseId.value;
    try {
      // First try to get the designated default
      const response = await warehouseService.getAll({ is_default: 1, per_page: 1 });
      if (response.status && response.data.length > 0) {
        defaultWarehouseId.value = response.data[0].id;
      } else {
        // Fallback to first available if no default designated
        const fallback = await warehouseService.getAll({ per_page: 1 });
        if (fallback.status && fallback.data.length > 0) {
          defaultWarehouseId.value = fallback.data[0].id;
        }
      }
      return defaultWarehouseId.value;
    } catch (error) {
      console.error('Error fetching default warehouse:', error);
      return null;
    }
  }

  function resetFilters() {
    page.value = 1;
    search.value = '';
    filters.value = {
      category_id: null,
      brand_id: null,
      active: null,
      featured: null,
    };
  }

  return {
    products,
    currentProduct,
    loading,
    totalItems,
    defaultWarehouseId,
    page,
    itemsPerPage,
    search,
    sortBy,
    filters,
    params,
    fetchProducts,
    fetchProduct,
    saveProduct,
    deleteProduct,
    fetchDefaultWarehouse,
    resetFilters,
  };
});
