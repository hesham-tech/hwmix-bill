import { ref } from 'vue';
import { custodyService } from '@/api';
import notificationManager from '@/services/notificationManager';

export function useCustodies() {
  const custodies = ref([]);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });
  const loading = ref(false);

  const fetchCustodies = async (params = {}) => {
    loading.value = true;
    try {
      const response = await custodyService.getAll(params);
      if (response.success) {
        custodies.value = response.data?.data || response.data || [];
        pagination.value = {
          current_page: params.page || 1,
          last_page: Math.ceil((response.data?.total || 0) / (params.per_page || 15)),
          total: response.data?.total || 0,
          per_page: params.per_page || 15,
        };
      }
      return response;
    } catch (error) {
      console.error('Fetch custodies error:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getCustody = async id => {
    loading.value = true;
    try {
      return await custodyService.getById(id);
    } catch (error) {
      return null;
    } finally {
      loading.value = false;
    }
  };

  const issueCustody = async data => {
    loading.value = true;
    try {
      const response = await custodyService.issue(data);
      if (response.success) {
        notificationManager.success('تمت العملية بنجاح');
      }
      return response;
    } catch (error) {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  const refundCustody = async (id, data) => {
    loading.value = true;
    try {
      const response = await custodyService.refund(id, data);
      if (response.success) {
        notificationManager.success('تمت العملية بنجاح');
      }
      return response;
    } catch (error) {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  const reverseCustody = async id => {
    loading.value = true;
    try {
      const response = await custodyService.reverse(id);
      if (response.success) {
        notificationManager.success('تمت العملية بنجاح');
      }
      return response;
    } catch (error) {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return {
    custodies,
    pagination,
    loading,
    fetchCustodies,
    getCustody,
    issueCustody,
    refundCustody,
    reverseCustody,
  };
}
