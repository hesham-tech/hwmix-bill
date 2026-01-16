import apiClient from './axios.config';
import { toast } from 'vue3-toastify';
import { useUserStore } from '@/stores/user';
import translateErrors from '@/utils/translateErrors';

/**
 * Base Service Class
 * يحتوي على الدوال الأساسية لكل services
 */
class BaseService {
  constructor(resource) {
    this.resource = resource;
  }

  /**
   * Handle Success Response
   * تنسيق البيانات بشكل متوافق مع v-data-table-server
   */
  handleSuccess(response, showToast = false) {
    const resData = response.data;
    const userStore = useUserStore();
    userStore.loadingApi = false;

    if (showToast && resData.message) {
      toast.success(resData.message);
    }

    // Normalize response
    let normalized = {
      data: [],
      total: 0,
      message: resData.message ?? '',
      status: resData.status ?? true,
    };

    if (resData.hasOwnProperty('total')) {
      // Paginated response
      normalized.data = resData.data ?? [];
      normalized.total = resData.total ?? normalized.data.length;
    } else if (Array.isArray(resData.data)) {
      // Array response
      normalized.data = resData.data;
      normalized.total = resData.data.length;
    } else if (resData.data) {
      // Single resource
      normalized.data = [resData.data];
      normalized.total = 1;
    } else if (Array.isArray(resData)) {
      // Direct array
      normalized.data = resData;
      normalized.total = resData.length;
    }

    return normalized;
  }

  /**
   * Handle Error Response
   * معالجة الأخطاء وعرضها للمستخدم
   */
  handleError(error, showToast = true) {
    const userStore = useUserStore();
    userStore.loadingApi = false;

    // Ignore 401 & 422 errors (handled in interceptor)
    if (error?.response?.status === 401 || error?.response?.status === 422) {
      throw error;
    }

    let errorMessage = 'حدث خطأ غير متوقع';

    if (error.response?.data) {
      const apiErrors = error.response.data.errors;
      if (apiErrors && (Array.isArray(apiErrors) ? apiErrors.length : Object.keys(apiErrors).length)) {
        errorMessage = translateErrors(apiErrors);
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (showToast) {
      toast.error(errorMessage, { autoClose: 7000 });
    }

    throw error;
  }

  /**
   * GET all resources
   * @param {Object} params - Query parameters
   * @param {Object} options - { showToast, loading }
   */
  async getAll(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get(this.resource, { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * GET single resource
   * @param {Number|String} id
   * @param {Object} options
   */
  async getOne(id, options = {}) {
    const { showToast = false, loading = true, full = false } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const url = full ? `${this.resource}/${id}?full=1` : `${this.resource}/${id}`;
      const response = await apiClient.get(url);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * CREATE or UPDATE resource
   * @param {Object} data
   * @param {Number|String|null} id - للتحديث
   * @param {Object} options
   */
  async save(data, id = null, options = {}) {
    const { showToast = false, loading = true, useFormData = false } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      let finalData = data;

      // Convert to FormData if needed
      if (useFormData && !(data instanceof FormData)) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });
        finalData = formData;
      }

      let response;
      if (id) {
        // Update
        if (useFormData) {
          finalData.append('_method', 'put');
          response = await apiClient.post(`${this.resource}/${id}`, finalData);
        } else {
          response = await apiClient.put(`${this.resource}/${id}`, finalData);
        }
      } else {
        // Create
        response = await apiClient.post(this.resource, finalData);
      }

      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * CREATE alias for save
   */
  async create(data, options = {}) {
    return this.save(data, null, options);
  }

  /**
   * UPDATE alias for save
   */
  async update(id, data, options = {}) {
    return this.save(data, id, options);
  }

  /**
   * DELETE resource
   * @param {Number|String} id
   * @param {Object} options
   */
  async delete(id, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.delete(`${this.resource}/${id}`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * BULK DELETE
   * @param {Array} ids
   * @param {Object} options
   */
  async deleteMany(ids, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`${this.resource}/bulk-delete`, { ids });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * ARCHIVE resource
   */
  async archive(id, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`${this.resource}/${id}/archive`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * RESTORE resource
   */
  async restore(id, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`${this.resource}/${id}/restore`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default BaseService;
