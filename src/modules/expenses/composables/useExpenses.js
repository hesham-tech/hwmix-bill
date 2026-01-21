import { ref } from 'vue';
import { expenseService } from '@/api';
import { toast } from 'vue3-toastify';

export function useExpenses() {
  const expenses = ref([]);
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });
  const loading = ref(false);

  const fetchExpenses = async (params = {}) => {
    loading.value = true;
    try {
      const response = await expenseService.getAll(params);
      if (response.success) {
        expenses.value = response.data || [];
        pagination.value = {
          current_page: params.page || 1,
          last_page: Math.ceil((response.total || 0) / (params.per_page || 15)),
          total: response.total || 0,
          per_page: params.per_page || 15,
        };
      }
      return response;
    } catch (error) {
      console.error('Fetch expenses error:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createExpense = async data => {
    loading.value = true;
    try {
      const response = await expenseService.create(data);
      if (response.success) {
        toast.success('تم تسجيل المصروف بنجاح');
      }
      return response;
    } catch (error) {
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateExpense = async (id, data) => {
    loading.value = true;
    try {
      const response = await expenseService.update(id, data);
      if (response.success) {
        toast.success('تم تحديث المصروف بنجاح');
      }
      return response;
    } catch (error) {
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteExpense = async id => {
    loading.value = true;
    try {
      const response = await expenseService.delete(id);
      if (response.success) {
        toast.success('تم حذف المصروف بنجاح');
      }
      return response;
    } catch (error) {
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    expenses,
    pagination,
    loading,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
  };
}
