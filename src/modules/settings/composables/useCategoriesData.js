import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useCategoriesData() {
  const api = useApi('/api/categories');
  const categories = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchCategories = async (params = {}, options = {}) => {
    const { append = false } = options;
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });

      let incomingData = [];
      let incomingTotal = 0;

      if (response.data && Array.isArray(response.data.data)) {
        incomingData = response.data.data;
        incomingTotal = response.data.meta?.total || response.data.data.length;
      } else {
        incomingData = response.data || [];
        incomingTotal = response.total || incomingData.length;
      }

      if (append) {
        categories.value = [...categories.value, ...incomingData];
      } else {
        categories.value = incomingData;
      }

      total.value = incomingTotal;
      return response;
    } catch (error) {
      categories.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async id => {
    return await api.remove(id, { successMessage: 'تم حذف الفئة بنجاح' });
  };

  return { categories, loading, total, fetchCategories, deleteCategory };
}
