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
      const fd = new FormData();
      Object.keys(reportData).forEach(key => {
        if (key === 'payload') {
          fd.append(key, typeof reportData[key] === 'string' ? reportData[key] : JSON.stringify(reportData[key]));
        } else if (key === 'screenshot' || key === 'autoScreenshot') {
          // Skip these here, handled below
        } else if (reportData[key] !== null && reportData[key] !== undefined) {
          fd.append(key, reportData[key]);
        }
      });

      // Priority: manual screenshot > auto screenshot
      const imageToUpload = reportData.screenshot || reportData.autoScreenshot;
      if (imageToUpload) {
        const file = Array.isArray(imageToUpload) ? imageToUpload[0] : imageToUpload;
        if (file instanceof File || file instanceof Blob) {
          fd.append('screenshot', file);
        } else {
          console.warn('[ErrorReportService] Image to upload is not a File or Blob:', typeof file);
        }
      }

      const response = await this.client.post(this.resource, fd);
      return response.data;
    } catch (error) {
      console.error('[ErrorReportService] Failed to submit error report:', error);
      if (error.response) {
        console.error('[ErrorReportService] Server error data:', error.response.data);
      }
      throw error;
    }
  }
}

export default new ErrorReportService();
