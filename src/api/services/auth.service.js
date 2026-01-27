import apiClient from '../axios.config';
import { toast } from 'vue3-toastify';
import { useUserStore } from '@/stores/user';
import router from '@/router';

/**
 * Authentication Service
 * خدمات المصادقة: تسجيل دخول، تسجيل، خروج
 */
class AuthService {
  /**
   * Login
   * @param {Object} credentials - { email, password }
   */
  async login(credentials, options = {}) {
    const { showToast = true, loading = true } = options;
    const { useAuthStore } = await import('@/stores/auth');
    const { useUserStore } = await import('@/stores/user');
    const authStore = useAuthStore();
    const userStore = useUserStore();

    try {
      const response = await apiClient.post('login', credentials);
      const data = response.data.data;

      // Delegate storage to authStore.saveLoginData
      authStore.saveLoginData(data, credentials.remember);

      // Set axios authorization header
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // Fetch complete user data with permissions
      await userStore.fetchUser();

      if (showToast) {
        toast.success(response.data.message || 'تم تسجيل الدخول بنجاح');
      }

      return data;
    } catch (error) {
      let errorMessage = 'فشل تسجيل الدخول';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      if (showToast) {
        toast.error(errorMessage, { autoClose: 7000 });
      }

      throw error;
    }
  }

  /**
   * Register
   * @param {Object} userData - بيانات المستخدم الجديد
   */
  async register(userData, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('register', userData);

      if (showToast) {
        toast.success(response.data.message || 'تم التسجيل بنجاح');
      }

      if (loading) userStore.loadingApi = false;

      return response.data;
    } catch (error) {
      if (loading) userStore.loadingApi = false;

      let errorMessage = 'فشل التسجيل';
      if (error.response?.data?.errors) {
        // Format validation errors
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      if (showToast) {
        toast.error(errorMessage, { autoClose: 7000 });
      }

      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('logout');

      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('products');

      delete apiClient.defaults.headers.common['Authorization'];

      if (showToast) {
        toast.success(response.data.message || 'تم تسجيل الخروج بنجاح');
      }

      if (loading) userStore.loadingApi = false;

      // Reload page to reset state
      location.reload();

      return response.data;
    } catch (error) {
      if (loading) userStore.loadingApi = false;

      if (showToast) {
        toast.error('فشل تسجيل الخروج');
      }

      throw error;
    }
  }

  /**
   * Forgot Password
   * @param {Object} data - { email }
   */
  async forgotPassword(data, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('forgot-password', data);

      if (showToast) {
        toast.success(response.data.message || 'تم إرسال رابط الاستعادة');
      }

      if (loading) userStore.loadingApi = false;
      return response.data;
    } catch (error) {
      if (loading) userStore.loadingApi = false;

      if (showToast) {
        toast.error(error.response?.data?.message || 'فشل إرسال الرابط');
      }

      throw error;
    }
  }

  /**
   * Get current user (alias for me)
   */
  async getCurrentUser() {
    return this.me();
  }

  /**
   * Get current user profile
   */
  async me() {
    try {
      const response = await apiClient.get('/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(sessionStorage.getItem('token') || localStorage.getItem('token'));
  }

  /**
   * Get stored token
   */
  getToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  }

  /**
   * Get stored user
   */
  getStoredUser() {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Session Management
   */
  async getSessions() {
    const response = await apiClient.get('auth/sessions');
    return response.data.data;
  }

  async revokeSession(id) {
    const response = await apiClient.delete(`auth/sessions/${id}`);
    return response.data;
  }

  async revokeOtherSessions() {
    const response = await apiClient.delete('auth/sessions-others');
    return response.data;
  }
}

export default new AuthService();
