import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import apiClient from '@/api/axios.config';

/**
 * Composable for making API calls with loading states and error handling
 * يدير استدعاءات API مع معالجة الأخطاء و loading states
 *
 * @param {string} baseUrl - Base URL للـ API endpoint
 * @returns {Object} - دوال CRUD و loading states
 */
export function useApi(baseUrl) {
  // تنظيف الرابط من البادئة المكررة /api لتجنب مشاكل baseURL في apiClient
  const resource = baseUrl.startsWith('/api/') ? baseUrl.substring(5) : baseUrl.startsWith('api/') ? baseUrl.substring(4) : baseUrl;

  const loading = ref(false);
  const error = ref(null);

  /**
   * GET request
   */
  const get = async (params = {}, options = {}) => {
    const { showLoading = true, showError = true } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.get(resource, { params });
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ في تحميل البيانات';
      if (showError) {
        toast.error(error.value);
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  /**
   * GET by ID
   */
  const getById = async (id, options = {}) => {
    const { showLoading = true, showError = true } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.get(`${resource}/${id}`);
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ في تحميل البيانات';
      if (showError) {
        toast.error(error.value);
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  /**
   * POST request (Create)
   */
  const create = async (data, options = {}) => {
    const { showLoading = true, showSuccess = true, showError = true, successMessage = 'تمت الإضافة بنجاح' } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post(resource, data);
      if (showSuccess) {
        toast.success(successMessage);
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ في الحفظ';
      if (showError) {
        toast.error(error.value);
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  /**
   * PUT request (Update)
   */
  const update = async (id, data, options = {}) => {
    const { showLoading = true, showSuccess = true, showError = true, successMessage = 'تم التحديث بنجاح' } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.put(`${resource}/${id}`, data);
      if (showSuccess) {
        toast.success(successMessage);
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ في التحديث';
      if (showError) {
        toast.error(error.value);
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  /**
   * DELETE request
   */
  const remove = async (id, options = {}) => {
    const { showLoading = true, showSuccess = true, showError = true, successMessage = 'تم الحذف بنجاح' } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.delete(`${resource}/${id}`);
      if (showSuccess) {
        toast.success(successMessage);
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ في الحذف';
      if (showError) {
        toast.error(error.value);
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  /**
   * Bulk delete
   */
  const bulkDelete = async (ids, options = {}) => {
    const { showLoading = true, showSuccess = true, showError = true, successMessage = 'تم الحذف بنجاح' } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post(`${resource}/bulk-delete`, { ids });
      if (showSuccess) {
        toast.success(successMessage);
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ في الحذف';
      if (showError) {
        toast.error(error.value);
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  /**
   * Custom request
   */
  const request = async (method, url, data = null, options = {}) => {
    const { showLoading = true, showError = true } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      // التأكد من عدم تكرار البادئة في الطلبات المخصصة أيضاً
      const finalUrl = url.startsWith('/') ? `${resource}${url}` : `${resource}/${url}`;

      const response = await apiClient({
        method,
        url: finalUrl,
        data,
      });
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ';
      if (showError) {
        toast.error(error.value);
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  return {
    // State
    loading,
    error,

    // Methods
    get,
    getById,
    create,
    update,
    remove,
    bulkDelete,
    request,
  };
}
