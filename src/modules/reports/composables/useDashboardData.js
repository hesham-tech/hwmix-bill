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
  const installmentApi = useApi('/api/installments');

  // State
  const loading = ref(true);
  const loadingInvoices = ref(false);
  const loadingUpcoming = ref(false);
  const loadingInstallments = ref(false);

  const stats = ref({
    totalInvoices: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalPayments: 0,
  });

  const recentInvoices = ref([]);
  const upcomingPayments = ref([]);
  const upcomingInstallments = ref([]);

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

  /**
   * Fetch upcoming payments (due within 5 days)
   * جلب الدفعات المستحقة خلال 5 أيام
   */
  const fetchUpcomingPayments = async () => {
    loadingUpcoming.value = true;

    try {
      // Calculate date range (today to +5 days)
      const today = new Date();
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(today.getDate() + 5);

      const todayStr = today.toISOString().split('T')[0];
      const fiveDaysStr = fiveDaysLater.toISOString().split('T')[0];

      // Fetch unpaid/partial invoices with due date in next 5 days
      const response = await invoiceApi.get(
        {
          payment_status: 'unpaid,partial',
          due_date_from: todayStr,
          due_date_to: fiveDaysStr,
          per_page: 10,
          sort: 'due_date',
        },
        { showLoading: false, showError: false }
      );

      upcomingPayments.value = response.data || [];
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      upcomingPayments.value = [];
    } finally {
      loadingUpcoming.value = false;
    }
  };

  /**
   * Fetch upcoming installments (due within 5 days)
   * جلب الأقساط المستحقة خلال 5 أيام
   */
  const fetchUpcomingInstallments = async () => {
    loadingInstallments.value = true;

    try {
      // Calculate date range (today to +5 days)
      const today = new Date();
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(today.getDate() + 5);

      const todayStr = today.toISOString().split('T')[0];
      const fiveDaysStr = fiveDaysLater.toISOString().split('T')[0];

      // Fetch pending installments with due date in next 5 days
      const response = await installmentApi.get(
        {
          status: 'pending',
          due_date_from: todayStr,
          due_date_to: fiveDaysStr,
          per_page: 10,
          sort: 'due_date',
        },
        { showLoading: false, showError: false }
      );

      upcomingInstallments.value = response.data || [];
    } catch (error) {
      console.error('Error fetching upcoming installments:', error);
      upcomingInstallments.value = [];
    } finally {
      loadingInstallments.value = false;
    }
  };

  return {
    // State
    stats,
    recentInvoices,
    upcomingPayments,
    upcomingInstallments,
    loading,
    loadingInvoices,
    loadingUpcoming,
    loadingInstallments,

    // Methods
    fetchDashboardData,
    fetchRecentInvoices,
    fetchUpcomingPayments,
    fetchUpcomingInstallments,
  };
}
