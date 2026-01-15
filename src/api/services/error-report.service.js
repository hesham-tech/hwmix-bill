import BaseService from '../base.service';

/**
 * Error Report Service
 * خدمة الإبلاغ عن الأخطاء
 */
class ErrorReportService extends BaseService {
  constructor() {
    super('error-reports');
  }

  /**
   * Submit an error report
   * @param {Object} reportData - Collected error data
   */
  async submit(reportData) {
    try {
      return await this.create(reportData, { showToast: true });
    } catch (error) {
      // If error reporting itself fails, we just log to console
      // to avoid infinite loops and annoying popups
      console.error('Failed to submit error report:', error);
      return null;
    }
  }
}

export default new ErrorReportService();
