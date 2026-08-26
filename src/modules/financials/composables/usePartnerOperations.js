import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function usePartnerOperations() {
  const { fetchApi } = useApi();
  
  const loading = ref(false);
  const operations = ref([]);
  const operationTypes = ref([]);
  const totalItems = ref(0);
  const statement = ref(null);

  const loadTypes = async () => {
    try {
      loading.value = true;
      const response = await fetchApi('/partner-operations/types');
      if (response.success) {
        operationTypes.value = response.data;
      }
    } catch (error) {
      console.error('Error loading partner operation types:', error);
    } finally {
      loading.value = false;
    }
  };

  const loadOperations = async (params = {}) => {
    try {
      loading.value = true;
      const response = await fetchApi('/partner-operations', { params });
      if (response.success) {
        operations.value = response.data;
        totalItems.value = response.meta?.total || response.data.length;
      }
    } catch (error) {
      console.error('Error loading partner operations:', error);
    } finally {
      loading.value = false;
    }
  };

  const createOperation = async (payload) => {
    try {
      loading.value = true;
      const response = await fetchApi('/partner-operations', {
        method: 'POST',
        data: payload
      });
      return response;
    } finally {
      loading.value = false;
    }
  };

  const reverseOperation = async (id) => {
    try {
      loading.value = true;
      const response = await fetchApi('/partner-operations/' + id, {
        method: 'DELETE'
      });
      return response;
    } finally {
      loading.value = false;
    }
  };

  const loadStatement = async (partnerId, params = {}) => {
    try {
      loading.value = true;
      const response = await fetchApi('/partner-operations/partner/' + partnerId + '/statement', { params });
      if (response.success) {
        statement.value = response.data;
      }
      return response;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    operations,
    operationTypes,
    totalItems,
    statement,
    loadTypes,
    loadOperations,
    createOperation,
    reverseOperation,
    loadStatement
  };
}
