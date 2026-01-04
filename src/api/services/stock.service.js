import BaseService from '../base.service';
import apiClient from '../axios.config';
import { useUserStore } from '@/stores/user';

/**
 * Stock Service
 * خدمة حركات المخزون
 */
class StockService extends BaseService {
  constructor() {
    super('stock');
  }

  /**
   * Get stock movements
   */
  async getMovements(params = {}, options = {}) {
    return this.getAll(params, options);
  }

  /**
   * Add stock (إضافة مخزون)
   */
  async addStock(data, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('stock/add', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Subtract stock (صرف مخزون)
   */
  async subtractStock(data, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('stock/subtract', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(data, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('stock/transfer', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Adjust stock (تسوية مخزون)
   */
  async adjustStock(data, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('stock/adjust', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get stock by product
   */
  async getByProduct(productId, options = {}) {
    return this.getAll({ product_id: productId }, options);
  }

  /**
   * Get stock by warehouse
   */
  async getByWarehouse(warehouseId, options = {}) {
    return this.getAll({ warehouse_id: warehouseId }, options);
  }

  /**
   * Get low stock items
   */
  async getLowStock(options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('stock/low-stock');
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new StockService();
