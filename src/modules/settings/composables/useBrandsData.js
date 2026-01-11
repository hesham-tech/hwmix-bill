import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useBrandsData() {
  const api = useApi('/api/brands');
  const brands = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchBrands = async (params = {}, options = {}) => {
    const { append = false } = options;
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });

      let incomingData = [];
      let incomingTotal = 0;

      // Handle both paginated and non-paginated responses
      if (response.data && Array.isArray(response.data.data)) {
        incomingData = response.data.data;
        incomingTotal = response.data.meta?.total || response.data.data.length;
      } else {
        incomingData = response.data || [];
        incomingTotal = response.total || incomingData.length;
      }

      if (append) {
        brands.value = [...brands.value, ...incomingData];
      } else {
        brands.value = incomingData;
      }

      total.value = incomingTotal;
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
