import { ref } from 'vue';
import { expenseCategoryService } from '@/api';
import { toast } from 'vue3-toastify';

export function useExpenseCategories() {
  const categories = ref([]);
  const loading = ref(false);

  const fetchCategories = async (params = {}) => {
    loading.value = true;
    try {
      const response = await expenseCategoryService.getAll({ ...params, all: true });
      categories.value = response.data || [];
      return response;
    } catch (error) {
      console.error('Fetch categories error:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async data => {
    loading.value = true;
    try {
      const response = await expenseCategoryService.create(data);
      if (response.success) {
        toast.success('تم إضافة التصنيف بنجاح');
        await fetchCategories();
      }
      return response;
    } catch (error) {
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
  };
}
