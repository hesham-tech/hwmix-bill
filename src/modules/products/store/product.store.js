import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { productService } from '@/api';
import { toast } from 'vue3-toastify';

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([]);
  const currentProduct = ref(null);
  const loading = ref(false);
  const totalItems = ref(0);

  // Pagination
  const page = ref(1);
  const itemsPerPage = ref(10);
  const search = ref('');
  const sortBy = ref([]);

  // Filters
  const categoryFilter = ref(null);
  const brandFilter = ref(null);

  // Computed
  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
    category_id: categoryFilter.value,
    brand_id: brandFilter.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'desc',
  }));

  // Actions
  async function fetchProducts() {
    loading.value = true;
    try {
      const response = await productService.getAll(params.value, { showToast: false });
      products.value = response.data;
      totalItems.value = response.total;
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProduct(id) {
    loading.value = true;
    try {
      const response = await productService.getOne(id, { full: true });
      currentProduct.value = response.data[0];
      return response.data[0];
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(data) {
    loading.value = true;
    try {
      const response = await productService.save(data);
      await fetchProducts();
      toast.success('تم إنشاء المنتج بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(id, data) {
    loading.value = true;
    try {
      const response = await productService.save(data, id);
      await fetchProducts();
      toast.success('تم تحديث المنتج بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id) {
    loading.value = true;
    try {
      await productService.delete(id);
      await fetchProducts();
      toast.success('تم حذف المنتج بنجاح');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    categoryFilter.value = null;
    brandFilter.value = null;
    search.value = '';
    page.value = 1;
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    totalItems,
    page,
    itemsPerPage,
    search,
    sortBy,
    categoryFilter,
    brandFilter,

    // Computed
    params,

    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    resetFilters,
  };
});
