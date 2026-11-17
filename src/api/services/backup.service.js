import BaseService from '../base.service';
import apiClient from '../axios.config';

/**
 * Backup Service
 * خدمات النسخ الاحتياطي والاستعادة
 */
class BackupService extends BaseService {
  constructor() {
    super('backups');
  }

  /**
   * Run a manual backup
   */
  async runManual(options = {}) {
    const { showToast = false, loading = true } = options;
    try {
      const response = await apiClient.post(`${this.resource}/run`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Download a backup file
   */
  async confirmPassword(id, action, password) {
    const response = await apiClient.post(`${this.resource}/confirm-password`, { backup_id: id, action, password }, { handleErrorsLocally: true });
    return response.data.data.confirmation_token;
  }

  async download(id, password) {
    try {
      const confirmation = await this.confirmPassword(id, 'download', password);
      const response = await apiClient.get(`${this.resource}/${id}/download`, {
        responseType: 'blob',
        headers: { 'X-Backup-Confirmation-Token': confirmation },
        handleErrorsLocally: true,
      });

      // Create downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);

      return response.data;
    } catch (error) {
      return this.handleError(error, false);
    }
  }

  /**
   * Get backup settings
   */
  async getSettings(options = {}) {
    const { showToast = false, loading = true } = options;
    try {
      const response = await apiClient.get(`${this.resource}/settings`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Update backup settings
   */
  async updateSettings(settings, options = {}) {
    const { showToast = false, loading = true } = options;
    try {
      const response = await apiClient.put(`${this.resource}/settings`, settings);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Restore from backup
   */
  async restore(id, token, password, options = {}) {
    const { showToast = false, loading = true } = options;
    try {
      const confirmation = await this.confirmPassword(id, 'restore', password);
      const response = await apiClient.post(`${this.resource}/${id}/restore`, { token }, {
        headers: { 'X-Backup-Confirmation-Token': confirmation },
        handleErrorsLocally: true,
      });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new BackupService();
