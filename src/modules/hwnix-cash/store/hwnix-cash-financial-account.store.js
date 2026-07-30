import { defineStore } from 'pinia';
import { ref } from 'vue';
import { hwnixCashFinancialAccountService } from '@/api';
import notificationManager from '@/services/notificationManager';

/**
 * مخزن بيانات الحسابات المالية بكاش هونكس
 */
export const useHwnixCashFinancialAccountStore = defineStore('hwnix-cash-financial-account', () => {
  const financialAccounts = ref([]);
  const distinctSenders = ref([]);
  const loading = ref(false);

  async function fetchFinancialAccounts(lineId = null) {
    loading.value = true;
    try {
      const params = lineId ? { line_id: lineId } : {};
      const response = await hwnixCashFinancialAccountService.getAll(params, { showToast: false });
      financialAccounts.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Error fetching financial accounts:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchDistinctSenders() {
    try {
      const response = await hwnixCashFinancialAccountService.getDistinctSenders();
      distinctSenders.value = response.data || [];
      return response.data;
    } catch (error) {
      console.error('Error fetching distinct senders:', error);
      throw error;
    }
  }

  async function createFinancialAccount(data) {
    loading.value = true;
    try {
      const response = await hwnixCashFinancialAccountService.create(data);
      notificationManager.success('تم إنشاء الحساب المالي بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error creating financial account:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function updateFinancialAccount(id, data) {
    loading.value = true;
    try {
      const response = await hwnixCashFinancialAccountService.save(data, id);
      notificationManager.success('تم تحديث بيانات الحساب المالي بنجاح');
      return response.data[0];
    } catch (error) {
      console.error('Error updating financial account:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteFinancialAccount(id) {
    loading.value = true;
    try {
      await hwnixCashFinancialAccountService.delete(id);
      notificationManager.success('تم حذف الحساب المالي بنجاح');
    } catch (error) {
      console.error('Error deleting financial account:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function reconcileFinancialAccount(id) {
    loading.value = true;
    try {
      const response = await hwnixCashFinancialAccountService.reconcile(id);
      notificationManager.success('تمت تسوية الرصيد الحسابي بالرصيد الفعلي بنجاح وتسجيل قيد التسوية');
      return response.data[0];
    } catch (error) {
      console.error('Error reconciling financial account:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  return {
    financialAccounts,
    distinctSenders,
    loading,
    fetchFinancialAccounts,
    fetchDistinctSenders,
    createFinancialAccount,
    updateFinancialAccount,
    deleteFinancialAccount,
    reconcileFinancialAccount,
  };
});
