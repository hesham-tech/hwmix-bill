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
   * Helper to prepare payload for API
   */
  const preparePayload = data => {
    // If there are images, we use FormData
    if (data.images && data.images.some(img => img.file)) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          data.images.forEach((img, index) => {
            if (img.file) {
              formData.append(`images[${index}]`, img.file);
            } else if (img.url) {
              formData.append(`existing_images[${index}]`, img.url);
            }
          });
        } else if (key === 'variants') {
          formData.append('variants', JSON.stringify(data.variants));
        } else if (key === 'tags') {
          formData.append('tags', JSON.stringify(data.tags));
        } else if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      return formData;
    }
    return data; // Return as JSON if no new files
  };

  /**
   * Create new product
   * إنشاء منتج جديد
   */
  const createProduct = async data => {
    const payload = preparePayload(data);
    return await api.create(payload, {
      successMessage: 'تم إضافة المنتج بنجاح',
    });
  };

  /**
   * Update product
   * تحديث منتج
   */
  const updateProduct = async (id, data) => {
    const payload = preparePayload(data);
    // Note: Laravel sometimes has issues with PUT/PATCH and FormData,
    // we might need to spoof it with POST + _method=PUT if using FormData
    if (payload instanceof FormData) {
      payload.append('_method', 'PUT');
      return await api.post(`/${id}`, payload, {
        successMessage: 'تم تحديث المنتج بنجاح',
      });
    }
    return await api.update(id, payload, {
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
