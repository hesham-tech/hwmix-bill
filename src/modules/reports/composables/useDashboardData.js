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
  const loadingUpcoming = ref(false);
  const loadingInstallments = ref(false);
  const refreshing = ref(false);

  const stats = ref({
    totalInvoices: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalPayments: 0,
    totalSales: 0,
    monthlySales: 0,
    pendingPayments: 0,
  });

  const recentInvoices = ref([]);
  const upcomingPayments = ref([]);
  const upcomingInstallments = ref([]);
  const salesTrend = ref([]);
  const topProducts = ref([]);

  /**
   * Fetch dashboard core summary
   */
  const fetchDashboardData = async () => {
    loading.value = true;
    try {
      const response = await useApi('/api/dashboard/summary').get({}, { showLoading: false });
      const data = response.data;

      if (data) {
        // Map backend KPIs
        stats.value = {
          totalSales: data.kpis?.total_sales || 0,
          monthlySales: data.kpis?.monthly_sales || 0,
          pendingPayments: data.kpis?.pending_payments || 0,
          totalCustomers: data.kpis?.total_customers || 0,
          totalProducts: data.kpis?.total_products || 0,
          totalInvoices: data.recent_invoices?.length || 0, // Fallback if no specific count
        };

        salesTrend.value = data.sales_trend || [];
        recentInvoices.value = data.recent_invoices || [];
        topProducts.value = data.top_products || [];
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch upcoming payments (due within 5 days)
   * Remains separate as it might not be in the general summary or needs specific filters
   */
  const fetchUpcomingPayments = async () => {
    loadingUpcoming.value = true;
    try {
      const today = new Date();
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(today.getDate() + 5);

      const response = await invoiceApi.get(
        {
          payment_status: 'unpaid,partial',
          due_date_from: today.toISOString().split('T')[0],
          due_date_to: fiveDaysLater.toISOString().split('T')[0],
          per_page: 5,
        },
        { showLoading: false }
      );
      upcomingPayments.value = response.data || [];
    } finally {
      loadingUpcoming.value = false;
    }
  };

  /**
   * Fetch upcoming installments
   */
  const fetchUpcomingInstallments = async () => {
    loadingInstallments.value = true;
    try {
      const today = new Date();
      const fiveDaysLater = new Date();
      fiveDaysLater.setDate(today.getDate() + 5);

      const response = await installmentApi.get(
        {
          status: 'pending',
          due_date_from: today.toISOString().split('T')[0],
          due_date_to: fiveDaysLater.toISOString().split('T')[0],
          per_page: 5,
        },
        { showLoading: false }
      );
      upcomingInstallments.value = response.data || [];
    } finally {
      loadingInstallments.value = false;
    }
  };

  /**
   * Refresh all dashboard data
   */
  const refreshAll = async () => {
    refreshing.value = true;
    try {
      await Promise.all([fetchDashboardData(), fetchUpcomingPayments(), fetchUpcomingInstallments()]);
    } finally {
      refreshing.value = false;
    }
  };

  return {
    // State
    stats,
    recentInvoices,
    upcomingPayments,
    upcomingInstallments,
    salesTrend,
    topProducts,
    loading,
    loadingUpcoming,
    loadingInstallments,
    refreshing,

    // Methods
    fetchDashboardData,
    fetchUpcomingPayments,
    fetchUpcomingInstallments,
    refreshAll,
  };
}
