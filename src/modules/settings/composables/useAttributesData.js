import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useAttributesData() {
  const api = useApi('/api/attributes');
  const attributes = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchAttributes = async (params = {}) => {
    loading.value = true;
    try {
      const response = await api.get(params, { showLoading: false });
      attributes.value = response.data || [];
      total.value = response.total || 0;
      return response;
    } catch (error) {
      attributes.value = [];
      total.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const deleteAttribute = async id => {
    return await api.remove(id, { successMessage: 'تم حذف الخاصية بنجاح' });
  };

  return { attributes, loading, total, fetchAttributes, deleteAttribute };
}
