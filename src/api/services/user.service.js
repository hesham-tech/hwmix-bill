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
   * Get user roles
   */
  async getRoles(userId, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get(`user/${userId}/roles`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, roleId, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`user/${userId}/roles`, { role_id: roleId });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get user permissions
   */
  async getPermissions(userId, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get(`user/${userId}/permissions`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Update user permissions
   */
  async updatePermissions(userId, permissions, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`user/${userId}/permissions`, { permissions });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new UserService();
