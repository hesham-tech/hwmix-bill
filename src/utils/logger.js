import { toast } from 'vue3-toastify';
import axios from 'axios';

/**
 * Logger utility to capture and report browser errors
 */
const logger = {
  install(app) {
    // 1. Capture Vue Errors
    app.config.errorHandler = (err, vm, info) => {
      console.error('Vue Error Captured:', err, info);
      this.reportError({
        message: err.message || 'Vue Internal Error',
        stack_trace: err.stack,
        type: 'vue_error',
        payload: { info },
        severity: 'high',
      });
    };

    // 2. Capture Global JS Errors
    window.addEventListener('error', event => {
      this.reportError({
        message: event.message,
        stack_trace: event.error?.stack,
        type: 'window_error',
        payload: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        severity: 'medium',
      });
    });

    // 3. Capture Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', event => {
      this.reportError({
        message: event.reason?.message || 'Unhandled Rejection',
        stack_trace: event.reason?.stack,
        type: 'unhandled_rejection',
        payload: { reason: event.reason },
        severity: 'medium',
      });
    });

    // 4. Hook into console.error to catch manual logs and third-party errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Still show in console
      originalConsoleError.apply(console, args);

      // Report to server
      const message = args
        .map(arg => {
          if (arg instanceof Error) return arg.message;
          if (typeof arg === 'object') return JSON.stringify(arg);
          return String(arg);
        })
        .join(' ');

      // Avoid self-reporting logger errors to prevent infinite loops
      if (message.includes('[ErrorReportService]') || message.includes('Failed to report error')) {
        return;
      }

      this.reportError({
        message: message,
        type: 'console_error',
        payload: { args: args.map(a => (typeof a === 'object' ? 'Object/Error' : String(a))) },
        severity: 'low',
      });
    };
  },

  async reportError(errorData) {
    try {
      // 1. Clean up message (capture first line only for summary if too long)
      const message = errorData.message || 'Unknown Error';

      // 2. Avoid duplicates and spam
      if (this.isDuplicate(errorData)) return;

      // 3. Exclude specific noise
      const excludedMessages = ['ResizeObserver loop completed', 'Suspense is an experimental feature', 'Script error.'];
      if (excludedMessages.some(m => message.includes(m))) return;

      const payload = {
        message: message.substring(0, 500),
        type: errorData.type || 'error',
        stack_trace: errorData.stack_trace,
        url: window.location.href,
        browser: navigator.userAgent,
        os: navigator.platform,
        payload: errorData.payload || {},
        severity: errorData.severity || 'medium',
      };

      // Use raw fetch for maximum reliability and to avoid axios interceptors loop
      fetch('/api/error-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      }).catch(e => {
        // Quietly fail for reporting failures
      });
    } catch (e) {
      // Absolute fallback to prevent app crashing because of logger
    }
  },

  lastError: null,
  lastErrorTime: 0,

  isDuplicate(errorData) {
    const now = Date.now();
    const errorKey = `${errorData.type}:${errorData.message}`;

    // Block same error if it happened within 5 seconds
    if (this.lastError === errorKey && now - this.lastErrorTime < 5000) {
      return true;
    }

    this.lastError = errorKey;
    this.lastErrorTime = now;
    return false;
  },
};

export default logger;
