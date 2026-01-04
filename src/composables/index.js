import { ref, computed } from 'vue';
import { toast } from 'vue3-toastify';

/**
 * useApi Composable
 * للتعامل مع API calls بشكل reactive
 *
 * @param {Function} serviceMethod - الدالة من الـ service
 * @param {Object} options - { immediate, onSuccess, onError }
 */
export function useApi(serviceMethod, options = {}) {
  const { immediate = false, onSuccess, onError } = options;

  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const execute = async (...args) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await serviceMethod(...args);
      data.value = response.data;

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (err) {
      error.value = err;

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Execute immediately if requested
  if (immediate) {
    execute();
  }

  return {
    data,
    loading,
    error,
    execute,
  };
}

/**
 * usePagination Composable
 * للتعامل مع الجداول و pagination
 */
export function usePagination() {
  const page = ref(1);
  const itemsPerPage = ref(10);
  const sortBy = ref([]);
  const search = ref('');
  const totalItems = ref(0);

  const resetPagination = () => {
    page.value = 1;
  };

  const handlePageChange = newPage => {
    page.value = newPage;
  };

  const handleItemsPerPageChange = newItemsPerPage => {
    itemsPerPage.value = newItemsPerPage;
    page.value = 1;
  };

  const handleSortChange = newSortBy => {
    sortBy.value = newSortBy;
    page.value = 1;
  };

  const handleSearchChange = newSearch => {
    search.value = newSearch;
    page.value = 1;
  };

  const params = computed(() => ({
    page: page.value,
    per_page: itemsPerPage.value,
    sort_by: sortBy.value[0]?.key || '',
    order: sortBy.value[0]?.order || 'asc',
    search: search.value,
  }));

  return {
    page,
    itemsPerPage,
    sortBy,
    search,
    totalItems,
    params,
    resetPagination,
    handlePageChange,
    handleItemsPerPageChange,
    handleSortChange,
    handleSearchChange,
  };
}

/**
 * useDialog Composable
 * لإدارة الـ dialogs
 */
export function useDialog() {
  const isOpen = ref(false);
  const formData = ref({});
  const isEditMode = ref(false);

  const open = (data = {}) => {
    formData.value = data;
    isEditMode.value = !!data.id;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    formData.value = {};
    isEditMode.value = false;
  };

  const openCreate = () => {
    open({});
  };

  const openEdit = data => {
    open(data);
  };

  return {
    isOpen,
    formData,
    isEditMode,
    open,
    close,
    openCreate,
    openEdit,
  };
}

/**
 * useConfirm Composable
 * للتأكيد قبل الحذف أو العمليات الخطرة
 */
export function useConfirm() {
  const showConfirm = ref(false);
  const confirmMessage = ref('');
  const confirmCallback = ref(null);

  const confirm = (message, callback) => {
    confirmMessage.value = message;
    confirmCallback.value = callback;
    showConfirm.value = true;
  };

  const handleConfirm = async () => {
    if (confirmCallback.value) {
      await confirmCallback.value();
    }
    handleCancel();
  };

  const handleCancel = () => {
    showConfirm.value = false;
    confirmMessage.value = '';
    confirmCallback.value = null;
  };

  return {
    showConfirm,
    confirmMessage,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

/**
 * useLoading Composable
 * لإدارة loading states
 */
export function useLoading(initialState = false) {
  const isLoading = ref(initialState);

  const startLoading = () => {
    isLoading.value = true;
  };

  const stopLoading = () => {
    isLoading.value = false;
  };

  const withLoading = async asyncFn => {
    startLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}
