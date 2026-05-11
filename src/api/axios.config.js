import axios from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import router from '@/router';

import translateErrors from '@/utils/translateErrors';

// Preventing multiple 401 notices
let last401Time = 0;
const DEBOUNCE_TIME = 3000; // 3 seconds

/**
 * Axios Instance Configuration
 * مركزي لكل API calls
 */
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : import.meta.env.VITE_API_BASE_URL) || '/api/v1',
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
    // Check both storage options
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add Company & Branch IDs
    try {
      const { useUserStore } = await import('@/stores/user');
      const { useBranchStore } = await import('@/stores/branch');
      
      const userStore = useUserStore();
      const branchStore = useBranchStore();

      if (userStore.currentUser?.company_id) {
        config.headers['X-Company-Id'] = userStore.currentUser.company_id;
      }

      if (branchStore.activeBranchId) {
        config.headers['X-Branch-Id'] = branchStore.activeBranchId;
      }
    } catch (e) {
      // Silent fail if stores are not ready
    }

    // Add Idempotency Key for mutation requests
    const isMutation = ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase());
    if (isMutation && !config.headers['X-Idempotency-Key']) {
      // Simple UUID-like generator
      config.headers['X-Idempotency-Key'] = crypto.randomUUID();
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

apiClient.interceptors.response.use(
  async response => {
    // Global User State Sync (Balance, etc.)
    // We check if the response contains the 'auth' context we added in the backend helper
    if (response.data?.auth?.user) {
      try {
        const { useUserStore } = await import('@/stores/user');
        const userStore = useUserStore();
        
        // Instant update if the ID matches current user
        if (userStore.currentUser && response.data.auth.user.id === userStore.currentUser.id) {
          userStore.updateUser(response.data.auth.user);
        }
      } catch (e) {
        // Silent fail if store or data is not ready
      }
    }
    return response;
  },
  error => {
    // 0. Ignore canceled requests (e.g. AbortController)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // 401: Unauthorized - Token expired
    if (error?.response?.status === 401 || error?.response?.data?.message === 'Unauthenticated.') {
      // Avoid spamming notifications
      const now = Date.now();
      if (now - last401Time > DEBOUNCE_TIME) {
        last401Time = now;
        toast.warning('جلستك انتهت. من فضلك سجل دخول مرة أخرى.');
      }

      // Use authStore.logout for centralized cleanup
      import('@/stores/auth')
        .then(m => {
          const authStore = m.useStore ? m.useStore() : m.useAuthStore();
          if (authStore && authStore.logout) {
            authStore.logout();
          }
        })
        .catch(() => {
          // Fallback if store import fails
          sessionStorage.removeItem('token');
          localStorage.removeItem('token');
          router
            .push({
              path: '/login',
              query: { sessionExpired: 1 },
            })
            .catch(err => {
              // If router fails (e.g. before app init), fallback is unavoidable
              console.error('Router push failed:', err);
              window.location.href = '/login?sessionExpired=1';
            });
        });

      return Promise.reject(error);
    }

    // 403: Forbidden - No permission
    if (error?.response?.status === 403) {
      const serverMessage = error?.response?.data?.message;
      toast.error(serverMessage || 'ليس لديك صلاحية للوصول إلى هذا المورد.');
      router.push({
        path: '/app/forbidden',
        query: { message: serverMessage },
      });
      return Promise.reject(error);
    }

    // 422: Validation Error
    if (error?.response?.status === 422) {
      const errors = error.response.data.errors;
      const message = translateErrors(errors || error.response.data.message);

      toast.error(message, { autoClose: 5000 });

      return Promise.reject(error);
    }

    // 429: Too Many Requests
    if (error?.response?.status === 429) {
      toast.error('لقد تجاوزت حد الطلبات المسموح به. من فضلك انتظر قليلاً.', { autoClose: 10000 });
      return Promise.reject(error);
    }

    // 404: Not Found
    if (error?.response?.status === 404) {
      // Allow components to handle 404 locally (e.g., showing a not found UI) without global interruption
      return Promise.reject(error);
    }

    // 400: Bad Request & 500+ Server Errors OR Connection Failures (status 0)
    if (error?.response?.status === 400 || error?.response?.status >= 500 || !error.response) {
      const isConnectivityError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';

      // Silent logging to background
      import('@/utils/logger').then(({ default: logger }) => {
        logger.reportError({
          message: `API Error: ${(error.config?.method || 'unknown').toUpperCase()} ${error.config?.url || 'unknown'} (${error.response?.status || 'Network'})`,
          type: 'api_error',
          severity: error.response?.status >= 500 ? 'high' : 'medium',
          payload: {
            status: error.response?.status,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              params: error.config?.params,
              data: error.config?.data,
            },
            responseData: error.response?.data,
          },
        });
      });

      // Show interactive capture UI if needed (legacy behavior maintained)
      import('@/stores/appState').then(storeModule => {
        const appState = storeModule.useappState();

        console.log('[AxiosInterceptor] Error detected, triggering capture UI');
        appState.isCapturing = true;

        import('@/modules/support/services/error-collector').then(module => {
          module
            .collectErrorInfo(error, {
              type: error?.response?.status === 400 ? 'bad_request' : isConnectivityError ? 'connectivity_error' : 'server_error',
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
                serverMessage: error?.response?.data?.message,
                serverResponse: error?.response?.data,
              },
              // Pass callbacks to sync with appState
              onCaptureStart: () => {
                appState.isCapturing = true;
              },
              onCaptureEnd: () => {
                appState.isCapturing = false;
              },
            })
            .then(info => {
              console.log('[AxiosInterceptor] Capture finished, showing ErrorDialog');
              appState.pendingReport = info;
              appState.isCapturing = false;
            })
            .catch(err => {
              console.error('[AxiosInterceptor] Capture flow error:', err);
              appState.isCapturing = false;
            });
        });
      });
    } else {
      // Fallback for any other error status code not explicitly handled
      const fallbackMessage = error?.response?.data?.message || error?.message || 'حدث خطأ غير متوقع.';
      toast.error(fallbackMessage);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
