import axios from 'axios';

/**
 * Error Report Service
 * خدمة الإبلاغ عن الأخطاء
 * تستخدم instance مستقل لتجنب التداخل مع interceptors في حالة فشل الإبلاغ نفسه
 */
class ErrorReportService {
  constructor() {
    this.resource = '/error-reports';
    this.client = axios.create({
      baseURL: (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : import.meta.env.VITE_API_BASE_URL) || '/api',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add auth token if available
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;

      // Handle FormData
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }
      return config;
    });
  }

  /**
   * Submit an error report
   * @param {Object} reportData - Collected error data
   */
  async submit(reportData) {
    try {
      // Since it's a many-field request with image, use FormData
      const fd = new FormData();
      Object.keys(reportData).forEach(key => {
        if (key === 'payload') {
          fd.append(key, typeof reportData[key] === 'string' ? reportData[key] : JSON.stringify(reportData[key]));
        } else if (reportData[key] !== null && reportData[key] !== undefined) {
          fd.append(key, reportData[key]);
        }
      });

      if (reportData.autoScreenshot) {
        fd.append('screenshot', reportData.autoScreenshot);
      }

      const response = await this.client.post(this.resource, fd);
      return response.data;
    } catch (error) {
      console.error('Failed to submit error report:', error);
      return null;
    }
  }
}

export default new ErrorReportService();
