import apiClient from '@/api/axios.config';

// موفر جلب البيانات عبر HTTP API الممتثل لواجهة موفري البيانات الموحدة.
export class ApiDataProvider {
  /**
   * جلب البيانات من الخادم الخلفي بناءً على العقد وتوقيع الطلب
   * @param {string} signature توقيع الطلب الفريد
   * @param {Object} contract عقد متطلبات البيانات للويدجت
   * @param {Object} filters الفلاتر الحالية (مثل period)
   * @returns {Promise<Object>}
   */
  async fetchData(signature, contract, filters = {}) {
    const { indicators = [] } = contract;

    const hasIndicator = (name) => indicators.includes(name);

    try {
      // 1. استعلام المنتجات الأكثر مبيعاً أو ربحية
      if (hasIndicator('productIntelligence') || hasIndicator('topProducts')) {
        const sortBy = filters.sortBy || 'total_sold_quantity';
        const response = await apiClient.get('analytics/top-products', { 
          params: { sort_by: sortBy, limit: 10, ...filters } 
        });
        return {
          source: 'api',
          signature,
          data: response.data || []
        };
      }

      // 2. استعلام مهام الفريق المعلقة
      if (hasIndicator('tasks')) {
        const response = await apiClient.get('tasks', { 
          params: { status: 'pending', per_page: 5 } 
        });
        return {
          source: 'api',
          signature,
          data: response.data || []
        };
      }

      // 3. استعلام المدفوعات والتحصيلات القادمة (مستحقة خلال 10 أيام)
      if (hasIndicator('upcomingPayments')) {
        const today = new Date();
        const tenDaysLater = new Date();
        tenDaysLater.setDate(today.getDate() + 10);
        const response = await apiClient.get('invoices', { 
          params: {
            payment_status: 'unpaid,partially_paid',
            due_date_from: today.toISOString().split('T')[0],
            due_date_to: tenDaysLater.toISOString().split('T')[0],
            per_page: 5,
            ...filters
          } 
        });
        return {
          source: 'api',
          signature,
          data: response.data || []
        };
      }

      // 4. استعلام الأقساط المستحقة القادمة
      if (hasIndicator('upcomingInstallments')) {
        const today = new Date();
        const tenDaysLater = new Date();
        tenDaysLater.setDate(today.getDate() + 10);
        const response = await apiClient.get('installments', { 
          params: {
            status: 'pending,partially_paid',
            due_date_to: tenDaysLater.toISOString().split('T')[0],
            per_page: 10,
            ...filters
          } 
        });
        return {
          source: 'api',
          signature,
          data: response.data || []
        };
      }

      // 5. استعلام ملخص الأرباح والخسائر المقارن
      if (hasIndicator('profitSummary')) {
        const period = filters.period || 'month';
        const currentMonth = new Date();
        let dateFrom, dateTo, lastMonthFrom, lastMonthTo;

        if (period === 'today') {
          const todayStr = new Date().toISOString().split('T')[0];
          dateFrom = todayStr;
          dateTo = todayStr;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          lastMonthFrom = yesterdayStr;
          lastMonthTo = yesterdayStr;
        } else if (period === 'week') {
          const startOfWeek = new Date();
          startOfWeek.setDate(startOfWeek.getDate() - 7);
          dateFrom = startOfWeek.toISOString().split('T')[0];
          dateTo = new Date().toISOString().split('T')[0];

          const prevWeekStart = new Date();
          prevWeekStart.setDate(prevWeekStart.getDate() - 14);
          lastMonthFrom = prevWeekStart.toISOString().split('T')[0];
          lastMonthTo = startOfWeek.toISOString().split('T')[0];
        } else {
          // month
          dateFrom = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0];
          dateTo = new Date().toISOString().split('T')[0];

          const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
          lastMonthFrom = lastMonth.toISOString().split('T')[0];
          lastMonthTo = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).toISOString().split('T')[0];
        }

        const [currentRes, lastRes] = await Promise.all([
          apiClient.get('reports/profit-loss', { params: { date_from: dateFrom, date_to: dateTo } }),
          apiClient.get('reports/profit-loss', { params: { date_from: lastMonthFrom, date_to: lastMonthTo } })
        ]);

        const currentProfit = currentRes.data?.summary?.net_profit || 0;
        const lastProfit = lastRes.data?.summary?.net_profit || 0;

        return {
          source: 'api',
          signature,
          data: {
            revenue: currentRes.data?.summary?.total_revenue || 0,
            costs: currentRes.data?.summary?.total_costs || 0,
            netProfit: currentProfit,
            change: lastProfit !== 0 ? ((currentProfit - lastProfit) / Math.abs(lastProfit)) * 100 : 0
          }
        };
      }

      // 6. استعلام التحليلات السريعة للوحة التحكم (اليوم / الشهر)
      const hasAnalytics = indicators.some(ind => 
        ['todayRevenue', 'todayProfit', 'todayOrders', 'monthRevenue', 'monthOrders'].includes(ind)
      );

      if (hasAnalytics) {
        const response = await apiClient.get('analytics/dashboard', { params: filters });
        return {
          source: 'api',
          signature,
          data: response.data || {}
        };
      }

      // 6. استعلام ملخص لوحة التحكم العام كـ Fallback (KPIs, recentInvoices, salesTrend)
      const response = await apiClient.get('dashboard/summary', { params: filters });
      return {
        source: 'api',
        signature,
        data: response.data || {}
      };
    } catch (error) {
      console.error(`[ApiDataProvider] فشل جلب البيانات للتوقيع ${signature}:`, error);
      throw error;
    }
  }
}

// تصدير نسخة وحيدة للاستخدام
const apiDataProviderInstance = new ApiDataProvider();
export default apiDataProviderInstance;
