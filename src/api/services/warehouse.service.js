import BaseService from '../base.service';
import apiClient from '../axios.config';
import { useUserStore } from '@/stores/user';

/**
 * Warehouse Service
 * خدمات المخازن
 */
class WarehouseService extends BaseService {
  constructor() {
    super('warehouses');
  }

  /**
   * Get warehouse stock
   */
  async getStock(warehouseId, params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get(`warehouse/${warehouseId}/stock`, { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new WarehouseService();
