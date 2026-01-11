import BaseService from '../base.service';
import apiClient from '../axios.config';

/**
 * Role Service
 * إدارة الأدوار
 */
class RoleService extends BaseService {
  constructor() {
    super('roles');
  }

  /**
   * Get all roles for the current company
   */
  async getAll(params = {}, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await apiClient.get('roles', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Assign roles to user
   * (Wait, this is in UserController in backend but RoleController has assignRole too)
   * The backend route is Route::post('role/assignRole', [RoleController::class, 'assignRole']);
   */
  async assignToUser(userId, roleNames, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post(`users/${userId}/roles`, { roles: roleNames });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  async create(data, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post('roles', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  async update(id, data, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.put(`roles/${id}`, data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  async delete(id, options = {}) {
    const { showToast = true } = options;
    try {
      // Single delete using RESTful DELETE
      const response = await apiClient.delete(`roles/${id}`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  async batchDelete(ids, options = {}) {
    const { showToast = true } = options;
    try {
      // Batch delete using POST with item_ids
      const response = await apiClient.post('roles/batch-delete', { item_ids: ids });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new RoleService();
