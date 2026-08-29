<template>
  <v-card border flat class="rounded-lg overflow-hidden h-100 kpi-card-widget">
    <!-- Skeleton Loading state -->
    <v-skeleton-loader v-if="loading" type="list-item-avatar, heading, subtitle" class="pa-2" />
    
    <v-card-text v-else :class="['pa-3 pa-md-4 h-100 d-flex flex-column justify-space-between', `bg-${cardConfig.color}-lighten-5`]">
      <div class="d-flex align-center justify-space-between flex-wrap ga-2">
        <div class="flex-grow-1 min-width-0" style="word-break: break-word;">
          <div :class="['text-caption font-weight-bold mb-1', `text-${cardConfig.color}`]">{{ cardConfig.title }}</div>
          <div :class="['text-h6 text-sm-h5 font-weight-black line-height-1', `text-${cardConfig.color}`]" style="line-height: 1.2 !important;">
            {{ formattedValue }}
          </div>
        </div>
        <v-avatar :color="cardConfig.color" size="40" variant="flat" class="rounded-lg flex-shrink-0">
          <v-icon :icon="cardConfig.icon" color="white" size="24" />
        </v-avatar>
      </div>
      <div class="mt-3 pt-2 text-xxs text-grey border-t truncate-text d-flex align-center justify-space-between">
        <span>{{ cardConfig.subtitle }}</span>
        <v-chip v-if="cardConfig.badge" size="x-small" :color="cardConfig.color" variant="flat" class="font-weight-bold">
          {{ cardConfig.badge }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
// يعرض بطاقة مؤشر مالي أو تشغيلي مفرش بناءً على عقد البيانات المركزي المستلم من بيئة التشغيل.
import { computed } from 'vue';
import { formatCurrency } from '@/utils/formatters';
import { useDashboardStore } from '@/@core/dashboard/store/dashboardStore';

const props = defineProps({
  instanceId: {
    type: String,
    required: true
  },
  userConfig: {
    type: Object,
    default: () => ({})
  }
});

const dashboardStore = useDashboardStore();

const indicator = computed(() => props.userConfig.indicator || 'totalSales');

const loading = computed(() => {
  return dashboardStore.widgetLoadingStates[props.instanceId] !== false;
});

// تحديد هل المؤشر يتبع لموديول التحليلات المتقدمة
const isAnalyticsIndicator = computed(() => {
  return ['todayRevenue', 'todayProfit', 'todayOrders', 'monthRevenue', 'monthOrders'].includes(indicator.value);
});

const cardConfig = computed(() => {
  const configs = {
    totalSales: {
      title: 'إجمالي المبيعات',
      icon: 'ri-money-dollar-box-line',
      color: 'success',
      subtitle: 'المبيعات السنوية (YTD)',
      badge: 'هذا العام'
    },
    monthlySales: {
      title: 'مبيعات الشهر الحالي',
      icon: 'ri-calendar-event-line',
      color: 'primary',
      subtitle: 'مبيعات الشهر الجاري',
      badge: 'هذا الشهر'
    },
    pendingPayments: {
      title: 'مستحقات العملاء (لنا)',
      icon: 'ri-hand-coin-line',
      color: 'info',
      subtitle: 'إجمالي المستحقات غير المحصلة من العملاء',
      badge: 'ذمم مدينة'
    },
    supplierDebts: {
      title: 'مديونيات الموردين (علينا)',
      icon: 'ri-bill-line',
      color: 'error',
      subtitle: 'إجمالي الالتزامات والفواتير غير المسددة',
      badge: 'ذمم دائنة'
    },
    unpaidInstallments: {
      title: 'الأقساط المستحقة',
      icon: 'ri-calendar-check-line',
      color: 'warning',
      subtitle: 'أقساط مجدولة للتحصيل',
      badge: 'مستحق'
    },
    totalCustomers: {
      title: 'إجمالي العملاء',
      icon: 'ri-team-line',
      color: 'info',
      subtitle: 'العملاء النشطون بالنظام',
      badge: 'نشط'
    },
    todayRevenue: {
      title: 'إيرادات اليوم',
      icon: 'ri-money-dollar-circle-line',
      color: 'primary',
      subtitle: 'إجمالي المقبوضات اليومية',
      badge: 'اليوم'
    },
    todayProfit: {
      title: 'صافي أرباح اليوم',
      icon: 'ri-funds-line',
      color: 'success',
      subtitle: 'صافي المربح المالي لليوم',
      badge: 'اليوم'
    },
    todayOrders: {
      title: 'عدد عمليات اليوم',
      icon: 'ri-shopping-cart-2-line',
      color: 'warning',
      subtitle: 'عدد الفواتير الصادرة اليوم',
      badge: 'عمليات'
    },
    totalCash: {
      title: 'إجمالي النقدية',
      icon: 'ri-safe-line',
      color: 'info',
      subtitle: 'الرصيد الفعلي في الخزائن',
      badge: 'سيولة'
    },
    monthlyExpenses: {
      title: 'مصروفات الشهر',
      icon: 'ri-wallet-3-line',
      color: 'error',
      subtitle: 'إجمالي المصروفات الجارية',
      badge: 'هذا الشهر'
    },
    monthlyProfit: {
      title: 'أرباح الشهر',
      icon: 'ri-line-chart-line',
      color: 'success',
      subtitle: 'صافي أرباح الشهر الجاري',
      badge: 'هذا الشهر'
    }
  };

  return configs[indicator.value] || configs.totalSales;
});

const formattedValue = computed(() => {
  const wData = dashboardStore.dashboardData[props.instanceId];
  if (!wData) return '0';

  const actualData = wData.data && wData.success !== undefined ? wData.data : wData;
  
  if (isAnalyticsIndicator.value) {
    const s = actualData || { today: { revenue: 0, profit: 0, orders_count: 0 } };
    if (indicator.value === 'todayRevenue') return formatCurrency(s.today?.revenue || 0);
    if (indicator.value === 'todayProfit') return formatCurrency(s.today?.profit || 0);
    if (indicator.value === 'todayOrders') return `${s.today?.orders_count || 0} طلب`;
    return '0';
  } else {
    const s = actualData.kpis || actualData.kpi || actualData.data_kpis || actualData || { total_sales: 0, monthly_sales: 0, pending_payments: 0, unpaid_installments: 0, total_customers: 0, total_cash: 0, monthly_expenses: 0, monthly_profit: 0 };
    if (indicator.value === 'totalSales') return formatCurrency(s.total_sales || s.totalSales || 0);
    if (indicator.value === 'monthlySales') return formatCurrency(s.monthly_sales || s.monthlySales || 0);
    if (indicator.value === 'pendingPayments') return formatCurrency(s.pending_payments || s.pendingPayments || 0);
    if (indicator.value === 'supplierDebts') return formatCurrency(s.supplier_debts || s.supplierDebts || 0);
    if (indicator.value === 'unpaidInstallments') return formatCurrency(s.unpaid_installments || s.unpaidInstallments || 0);
    if (indicator.value === 'totalCustomers') return s.total_customers || s.totalCustomers || 0;
    if (indicator.value === 'totalCash') return formatCurrency(s.total_cash || s.totalCash || 0);
    if (indicator.value === 'monthlyExpenses') return formatCurrency(s.monthly_expenses || s.monthlyExpenses || 0);
    if (indicator.value === 'monthlyProfit') return formatCurrency(s.monthly_profit || s.monthlyProfit || 0);
    return '0';
  }
});
</script>

<script>
/**
 * بطاقة مؤشر مالي وتشغيلي موحدة (KPI Card Widget)
 */
export default {
  name: 'KpiCardWidget'
}
</script>

<style scoped>
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.line-height-1 {
  line-height: 1.1 !important;
}
.text-xxs {
  font-size: 0.65rem !important;
}
.kpi-card-widget {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.kpi-card-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.05);
}
</style>
