import axios from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import router from '@/router';

import translateErrors from '@/utils/translateErrors';

/**
 * Axios Instance Configuration
 * مركزي لكل API calls
 */
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : import.meta.env.VITE_API_BASE_URL) || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'ar',
  },
  withCredentials: false,
});

/**
 * Request Interceptor
 * إضافة token وتحديد content-type
 */
apiClient.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Company ID header from userStore if available
    try {
      const { useUserStore } = await import('@/stores/user');
      const userStore = useUserStore();
      if (userStore.currentUser?.company_id) {
        config.headers['X-Company-Id'] = userStore.currentUser.company_id;
      }
    } catch (e) {
      // Silent fail if store is not ready
    }

    // لو FormData، خلي axios يحدد content-type تلقائياً
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  error => Promise.reject(error)
);

/**
 * Response Interceptor
 * معالجة errors عامة (401, 403, etc.)
 */
apiClient.interceptors.response.use(
  response => response,
  error => {
    // 401: Unauthorized - Token expired
    if (error?.response?.status === 401 || error?.response?.data?.message === 'Unauthenticated.') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      toast.warning('جلستك انتهت. من فضلك سجل دخول مرة أخرى.');
      router.push({ name: 'login', query: { sessionExpired: '1' } });

      return Promise.reject(error);
    }

    // 403: Forbidden - No permission
    if (error?.response?.status === 403 || error?.response?.data?.message === 'Forbidden' || error?.response?.data?.message === 'Unauthorized') {
      toast.error('ليس لديك صلاحية للوصول إلى هذا المورد.');
      return Promise.reject(error);
    }

    // 422: Validation Error
    if (error?.response?.status === 422) {
      const errors = error.response.data.errors;
      const message = translateErrors(errors || error.response.data.message);

      toast.error(message, { autoClose: 5000 });

      return Promise.reject(error);
    }

    // 500+ Server Errors OR Connection Failures (status 0) OR 404 NotFound (for reporting)
    if (error?.response?.status >= 500 || error?.response?.status === 404 || !error.response) {
      const isConnectivityError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';

      // Collect technical info and trigger global dialog
      import('@/utils/error-collector').then(module => {
        module
          .collectErrorInfo(error, {
            type: isConnectivityError ? 'connectivity_error' : 'server_error',
            isConnectivityError,
            request: {
              method: error?.config?.method?.toUpperCase(),
              url: error?.config?.url,
              params: error?.config?.params,
              data: error?.config?.data,
            },
            extraData: {
              status: error?.response?.status || 0,
              code: error?.code,
            },
          })
          .then(info => {
            import('@/stores/appState').then(storeModule => {
              const appState = storeModule.useappState();
              appState.pendingReport = info;
            });
          });
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
