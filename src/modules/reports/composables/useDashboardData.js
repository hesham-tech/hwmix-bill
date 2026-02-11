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
  const recentPayments = ref([]);
  const upcomingPayments = ref([]);
  const upcomingInstallments = ref([]);
  const salesTrend = ref([]);
  const topProducts = ref([]);
  const dashboardRole = ref('admin');

  /**
   * Fetch dashboard core summary
   */
  const fetchDashboardData = async () => {
    loading.value = true;
    try {
      const response = await useApi('/api/dashboard/summary').get({}, { showLoading: false });
      const data = response.data;

      if (data) {
        dashboardRole.value = data.role || 'admin';

        // Map backend KPIs
        if (dashboardRole.value === 'customer') {
          stats.value = {
            totalInvoices: data.kpis?.total_invoices || 0,
            totalPaid: data.kpis?.total_paid || 0,
            remainingBalance: data.kpis?.remaining_balance || 0,
            activeInstallmentPlans: data.kpis?.active_installment_plans || 0,
            upcomingInstallmentsCount: data.kpis?.upcoming_installments_count || 0,
          };
          recentPayments.value = data.recent_payments || [];
          upcomingInstallments.value = data.upcoming_installments || [];
        } else {
          stats.value = {
            totalSales: data.kpis?.total_sales || 0,
            monthlySales: data.kpis?.monthly_sales || 0,
            pendingPayments: data.kpis?.pending_payments || 0,
            totalCustomers: data.kpis?.total_customers || 0,
            totalProducts: data.kpis?.total_products || 0,
            totalInvoices: data.recent_invoices?.length || 0,
          };
          salesTrend.value = data.sales_trend || [];
          topProducts.value = data.top_products || [];
        }

        recentInvoices.value = data.recent_invoices || [];
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch upcoming payments (due within 10 days)
   */
  const fetchUpcomingPayments = async () => {
    loadingUpcoming.value = true;
    try {
      const today = new Date();
      const tenDaysLater = new Date();
      tenDaysLater.setDate(today.getDate() + 10);

      const response = await invoiceApi.get(
        {
          payment_status: 'unpaid,partially_paid',
          due_date_from: today.toISOString().split('T')[0],
          due_date_to: tenDaysLater.toISOString().split('T')[0],
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
   * Fetch upcoming installments (late and within 10 days)
   */
  const fetchUpcomingInstallments = async () => {
    loadingInstallments.value = true;
    try {
      const today = new Date();
      const tenDaysLater = new Date();
      tenDaysLater.setDate(today.getDate() + 10);

      const response = await installmentApi.get(
        {
          status: 'pending,partially_paid', // شمول المعلق والمدفوع جزئياً
          due_date_to: tenDaysLater.toISOString().split('T')[0], // لا نحتاج due_date_from لشمول المتأخرة
          per_page: 10,
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
    recentPayments,
    upcomingPayments,
    upcomingInstallments,
    salesTrend,
    topProducts,
    dashboardRole,
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
