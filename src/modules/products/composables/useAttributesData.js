import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useAttributesData() {
  const api = useApi('/api/attributes');
  const attributes = ref([]);
  const loading = ref(false);
  const total = ref(0);

  const fetchAttributes = async (params = {}, options = {}) => {
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
        attributes.value = [...attributes.value, ...incomingData];
      } else {
        attributes.value = incomingData;
      }

      total.value = incomingTotal;
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
