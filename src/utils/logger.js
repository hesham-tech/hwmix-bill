import { toast } from 'vue3-toastify';
import axios from 'axios';

/**
 * Logger utility to capture and report browser errors
 */
const logger = {
  install(app) {
    // 1. Capture Vue Errors
    app.config.errorHandler = (err, vm, info) => {
      console.error('Vue Error:', err, info);
      this.reportError({
        message: err.message,
        stack_trace: err.stack,
        type: 'vue_error',
        payload: { info },
      });
    };

    // 2. Capture Global JS Errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.reportError({
        message: message,
        stack_trace: error?.stack,
        type: 'window_error',
        payload: { source, lineno, colno },
      });
      return false; // Let default browser error occur
    };

    // 3. Capture Unhandled Promise Rejections
    window.onunhandledrejection = event => {
      this.reportError({
        message: event.reason?.message || 'Unhandled Rejection',
        stack_trace: event.reason?.stack,
        type: 'unhandled_rejection',
        payload: { reason: event.reason },
      });
    };
  },

  async reportError(errorData) {
    try {
      // Avoid reporting the same error multiple times in a short window
      if (this.isDuplicate(errorData)) return;

      const payload = {
        message: errorData.message,
        type: errorData.type || 'error',
        stack_trace: errorData.stack_trace,
        url: window.location.href,
        browser: navigator.userAgent,
        payload: JSON.stringify(errorData.payload || {}),
        severity: 'medium',
      };

      // We use raw axios to avoid interceptor loops if the API itself fails
      await axios.post('/api/error-reports', payload, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          // Try to get token from localStorage if available
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (e) {
      // Silent fail to avoid infinite loops
      console.warn('Failed to report error to server:', e);
    }
  },

  lastError: null,
  lastErrorTime: 0,

  isDuplicate(errorData) {
    const now = Date.now();
    const errorKey = `${errorData.type}:${errorData.message}`;

    if (this.lastError === errorKey && now - this.lastErrorTime < 2000) {
      return true;
    }

    this.lastError = errorKey;
    this.lastErrorTime = now;
    return false;
  },
};

export default logger;
