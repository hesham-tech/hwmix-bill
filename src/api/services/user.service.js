import BaseService from '../base.service';
import apiClient from '../axios.config';

/**
 * User Service
 * خدمات المستخدمين والصلاحيات
 */
class UserService extends BaseService {
  constructor() {
    super('users');
  }

  /**
   * Lookup a user globally by phone or email
   */
  async lookup(params = {}, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await apiClient.get('users/lookup', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get user statistics
   */
  async getStats(params = {}, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await apiClient.get('users/stats', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Assign roles to user
   */
  async assignRole(userId, roles, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post('role/assignRole', {
        user_id: userId,
        roles: Array.isArray(roles) ? roles : [roles],
      });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Update user details (includes status and roles)
   */
  async update(userId, data, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.put(`users/${userId}`, data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new UserService();
