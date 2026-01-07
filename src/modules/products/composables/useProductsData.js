import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

/**
 * Composable for Products data management
 * إدارة بيانات المنتجات
 */
export function useProductsData() {
  const api = useApi('/api/products');

  // State
  const products = ref([]);
  const loading = ref(false);
  const total = ref(0);

  /**
   * Fetch products list with filters
   * جلب قائمة المنتجات مع الفلاتر
   */
  const fetchProducts = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      products.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      products.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get single product by ID
   * جلب منتج واحد
   */
  const getProduct = async id => {
    return await api.getById(id);
  };

  /**
   * Create new product
   * إنشاء منتج جديد
   */
  const createProduct = async data => {
    return await api.create(data, {
      successMessage: 'تم إضافة المنتج بنجاح',
    });
  };

  /**
   * Update product
   * تحديث منتج
   */
  const updateProduct = async (id, data) => {
    return await api.update(id, data, {
      successMessage: 'تم تحديث المنتج بنجاح',
    });
  };

  /**
   * Delete product
   * حذف منتج
   */
  const deleteProduct = async id => {
    return await api.remove(id, {
      successMessage: 'تم حذف المنتج بنجاح',
    });
  };

  return {
    // State
    products,
    loading,
    total,

    // Methods
    fetchProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
