import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useBrandsData() {
  const api = useApi('/api/brands');
  const brands = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchBrands = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      brands.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      brands.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteBrand = async id => {
    return await api.remove(id, { successMessage: 'تم حذف العلامة التجارية بنجاح' });
  };

  return { brands, loading, total, fetchBrands, deleteBrand };
}
