import axios from 'axios';
import { ref } from 'vue';
import { toast } from 'vue3-toastify';

/**
 * Composable for making API calls with loading states and error handling
 * يدير استدعاءات API مع معالجة الأخطاء و loading states
 *
 * @param {string} baseUrl - Base URL للـ API endpoint
 * @returns {Object} - دوال CRUD و loading states
 */
export function useApi(baseUrl) {
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
      const response = await axios.get(baseUrl, { params });
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
      const response = await axios.get(`${baseUrl}/${id}`);
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
      const response = await axios.post(baseUrl, data);
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
      const response = await axios.put(`${baseUrl}/${id}`, data);
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
      const response = await axios.delete(`${baseUrl}/${id}`);
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
      const response = await axios.post(`${baseUrl}/bulk-delete`, { ids });
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
      const response = await axios({
        method,
        url: `${baseUrl}${url}`,
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
