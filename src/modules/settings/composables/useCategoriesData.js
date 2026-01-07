import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useCategoriesData() {
  const api = useApi('/api/categories');
  const categories = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchCategories = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      categories.value = response.data || [];
      total.value = response.total || 0;
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
