import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

/**
 * Composable for High-Performance Analytics and Statistics
 * مسؤول عن جلب بيانات الإحصائيات المتقدمة من الـ APIs المحسنة
 */
export function useAnalytics() {
  // State
  const loading = ref(false);
  const dashboardStats = ref({
    today: { revenue: 0, profit: 0, orders_count: 0 },
    month_to_date: { revenue: 0, orders_count: 0 },
  });
  const topProducts = ref([]);
  const userSummary = ref(null);
  const userProductMatrix = ref([]);

  /**
   * جلب ملخص لوحة التحكم السريع (اليوم / الشهر)
   */
  const fetchDashboardStats = async () => {
    loading.value = true;
    try {
      const response = await useApi('/api/analytics/dashboard').get({}, { showLoading: false });
      if (response && response.data) {
        dashboardStats.value = response.data;
      }
    } catch (error) {
      console.error('Error fetching analytics dashboard:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * جلب المنتجات الأكثر مبيعاً أو ربحية
   * @param {Object} params - { sort_by: 'total_sold_quantity' | 'total_profit', limit: 10 }
   */
  const fetchTopProducts = async (params = {}) => {
    loading.value = true;
    try {
      const response = await useApi('/api/analytics/top-products').get(params, { showLoading: false });
      if (response && response.data) {
        topProducts.value = response.data;
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * جلب تاريخ مشتريات مستخدم معين
   */
  const fetchUserHistory = async userId => {
    loading.value = true;
    try {
      const response = await useApi(`/api/analytics/user-history/${userId}`).get({}, { showLoading: false });
      if (response && response.data) {
        userSummary.value = response.data.summary;
        userProductMatrix.value = response.data.details;
      }
    } catch (error) {
      console.error('Error fetching user analytics history:', error);
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    loading,
    dashboardStats,
    topProducts,
    userSummary,
    userProductMatrix,

    // Methods
    fetchDashboardStats,
    fetchTopProducts,
    fetchUserHistory,
  };
}
