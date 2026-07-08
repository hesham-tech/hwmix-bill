import { ref } from 'vue';
import notificationManager from '@/services/notificationManager';
import apiClient from '@/api/axios.config';

function extractErrorMessage(err, fallback) {
  if (err.response?.data?.errors && typeof err.response.data.errors === 'object') {
    const errorObj = err.response.data.errors;
    const firstKey = Object.keys(errorObj)[0];
    if (firstKey && Array.isArray(errorObj[firstKey]) && errorObj[firstKey][0]) {
      return errorObj[firstKey][0];
    }
    return err.response?.data?.message || 'خطأ في التحقق من البيانات';
  }
  if (err.response?.status === 404 && typeof err.response?.data?.message === 'string' && err.response.data.message.includes('No query results for model')) {
    return 'العنصر المطلوب غير موجود أو تم حذفه.';
  }
  return err.response?.data?.message || err.message || fallback;
}

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
      error.value = extractErrorMessage(err, 'حدث خطأ في تحميل البيانات');

      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
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
      error.value = extractErrorMessage(err, 'حدث خطأ في تحميل البيانات');

      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
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
    const { showLoading = true, showSuccess = true, showError = true, successMessage = 'تمت العملية بنجاح' } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.post(resource, data);
      if (showSuccess) {
        notificationManager.success(response.data.message || successMessage, { code: 'SUCCESS' });
      }
      return response.data;
    } catch (err) {
      error.value = extractErrorMessage(err, 'حدث خطأ في الحفظ');

      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
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
        notificationManager.success(response.data.message || successMessage, { code: 'SUCCESS' });
      }
      return response.data;
    } catch (err) {
      error.value = extractErrorMessage(err, 'حدث خطأ في التحديث');

      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
      }
      throw err;
    } finally {
      if (showLoading) loading.value = false;
    }
  };

  /**
   * PATCH request
   */
  const patch = async (id, data, options = {}) => {
    const { showLoading = true, showSuccess = true, showError = true, successMessage = 'تم التحديث بنجاح' } = options;

    if (showLoading) loading.value = true;
    error.value = null;

    try {
      const response = await apiClient.patch(id ? `${resource}/${id}` : resource, data);
      if (showSuccess) {
        notificationManager.success(response.data.message || successMessage, { code: 'SUCCESS' });
      }
      return response.data;
    } catch (err) {
      error.value = extractErrorMessage(err, 'حدث خطأ في التحديث');

      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
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
        notificationManager.success(response.data.message || successMessage, { code: 'SUCCESS' });
      }
      return response.data;
    } catch (err) {
      error.value = extractErrorMessage(err, 'حدث خطأ في الحذف');

      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
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
        notificationManager.success(successMessage, { code: 'SUCCESS' });
      }
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'حدث خطأ في الحذف';
      if (err.response?.status === 404 && typeof error.value === 'string' && error.value.includes('No query results for model')) {
        error.value = 'العنصر المطلوب غير موجود أو تم حذفه.';
      }
      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
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
      if (err.response?.status === 404 && typeof error.value === 'string' && error.value.includes('No query results for model')) {
        error.value = 'العنصر المطلوب غير موجود أو تم حذفه.';
      }
      if (showError) {
        const status = err.response?.status;
        const domain = status === 422 ? 'validation' : (status === 400 || status === 409) ? 'business' : 'system';
        const severity = status >= 500 ? 'high' : 'medium';
        notificationManager.error(error.value, {
          domain,
          severity,
          code: err.response?.data?.error_code || (status === 422 ? 'VALIDATION_FAILED' : 'API_ERROR')
        });
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
    patch,
    remove,
    bulkDelete,
    request,
  };
}
