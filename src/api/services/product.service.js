import BaseService from '../base.service';
import apiClient from '../axios.config';
import { useUserStore } from '@/stores/user';

/**
 * Product Service
 * خدمات المنتجات: CRUD + Variants
 */
class ProductService extends BaseService {
  constructor() {
    super('products');
  }

  /**
   * Get product variants
   */
  async getVariants(productId, params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get(`product/${productId}/variants`, { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Add variant to product
   */
  async addVariant(productId, variantData, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`product/${productId}/variants`, variantData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Update variant
   */
  async updateVariant(productId, variantId, variantData, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.put(`product/${productId}/variants/${variantId}`, variantData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Delete variant
   */
  async deleteVariant(productId, variantId, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.delete(`product/${productId}/variants/${variantId}`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get product stock
   */
  async getStock(productId, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get(`product/${productId}/stock`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Search products by barcode
   */
  async searchByBarcode(barcode, options = {}) {
    const { showToast = false, loading = false } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('products', {
        params: { barcode },
      });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new ProductService();
