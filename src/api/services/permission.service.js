import BaseService from '../base.service';
import apiClient from '../axios.config';

/**
 * Permission Service
 * إدارة الصلاحيات
 */
class PermissionService extends BaseService {
  constructor() {
    super('permissions');
  }

  /**
   * Get all permission definitions (grouped)
   */
  async getAll(options = {}) {
    const { showToast = false } = options;
    try {
      const response = await apiClient.get('permissions');
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new PermissionService();
