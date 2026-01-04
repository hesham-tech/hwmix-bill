import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

/**
 * Composable for Dashboard data fetching
 * مسؤول عن جلب بيانات Dashboard من الـ APIs
 */
export function useDashboardData() {
  // APIs
  const invoiceApi = useApi('/api/invoices');
  const productApi = useApi('/api/products');
  const userApi = useApi('/api/users');
  const paymentApi = useApi('/api/payments');

  // State
  const loading = ref(true);
  const loadingInvoices = ref(false);

  const stats = ref({
    totalInvoices: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalPayments: 0,
  });

  const recentInvoices = ref([]);

  /**
   * Fetch dashboard statistics
   * جلب الإحصائيات الرئيسية
   */
  const fetchDashboardData = async () => {
    loading.value = true;

    try {
      // Fetch counts in parallel for better performance
      const [invoicesRes, productsRes, usersRes, paymentsRes] = await Promise.all([
        invoiceApi.get({ per_page: 1 }, { showLoading: false, showError: false }),
        productApi.get({ per_page: 1 }, { showLoading: false, showError: false }),
        userApi.get({ per_page: 1 }, { showLoading: false, showError: false }),
        paymentApi.get({ per_page: 1 }, { showLoading: false, showError: false }),
      ]);

      stats.value = {
        totalInvoices: invoicesRes.total || invoicesRes.data?.length || 0,
        totalProducts: productsRes.total || productsRes.data?.length || 0,
        totalUsers: usersRes.total || usersRes.data?.length || 0,
        totalPayments: paymentsRes.total || paymentsRes.data?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default 0 values on error
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch recent invoices
   * جلب آخر الفواتير
   */
  const fetchRecentInvoices = async () => {
    loadingInvoices.value = true;

    try {
      const response = await invoiceApi.get({ per_page: 5, sort: '-created_at' }, { showLoading: false, showError: false });
      recentInvoices.value = response.data || [];
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      recentInvoices.value = [];
    } finally {
      loadingInvoices.value = false;
    }
  };

  return {
    // State
    stats,
    recentInvoices,
    loading,
    loadingInvoices,

    // Methods
    fetchDashboardData,
    fetchRecentInvoices,
  };
}
