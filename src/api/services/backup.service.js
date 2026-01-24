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
  async download(id) {
    try {
      const response = await apiClient.get(`${this.resource}/${id}/download`, {
        responseType: 'blob',
      });

      // Create downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${id}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return response.data;
    } catch (error) {
      return this.handleError(error, true);
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
  async restore(id, token, options = {}) {
    const { showToast = false, loading = true } = options;
    try {
      const response = await apiClient.post(`${this.resource}/${id}/restore`, { token });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new BackupService();
