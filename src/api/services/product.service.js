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
   * Search and Filter products
   */
  async getAll(params = {}, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await apiClient.get('products', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get full product details
   */
  async getOne(id, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await apiClient.get(`products/${id}`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Comprehensive Save (Create or Update)
   * Handles nested variants and stocks
   */
  async save(data, id = null, options = {}) {
    const { showToast = false } = options;
    try {
      const response = id ? await apiClient.put(`products/${id}`, data) : await apiClient.post('products', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Delete product and all its relations
   */
  async delete(id, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await apiClient.delete(`products/${id}`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Import products from Excel with mapping
   */
  async import(data, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post('products/import', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Export products to Excel
   */
  async export(params = {}) {
    try {
      const response = await apiClient.get('products/export', {
        params,
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

export default new ProductService();
