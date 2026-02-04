<template>
  <div class="admin-dashboard">
    <div class="mb-6 px-6 pt-6 d-flex align-center justify-space-between">
      <div>
        <h1 class="text-h4 font-weight-bold">لوحة التحكم الإحصائية</h1>
        <p class="text-body-1 text-grey">تحليل أداء النظام، الفواتير، وحركات المخزون في مكان واحد</p>
      </div>
      <AppButton color="primary" prepend-icon="ri-refresh-line" variant="tonal" :loading="refreshing" @click="refreshAll"> تحديث البيانات </AppButton>
    </div>
    <ShareView file-name="dashboard-summary" background-color="#f8f9fa" top="0px" left="0px" :quality="0.5">
      <div class="px-6 mb-6">
        <!-- Loading State -->
        <v-progress-linear v-if="loading" indeterminate color="primary" class="rounded-t" />

        <!-- Statistics Cards -->
        <StatsCards :stats="stats" />
      </div>
    </ShareView>

    <!-- Charts and Tasks Row -->
    <v-row class="px-6 mx-0 mb-6">
      <v-col cols="12" lg="8">
        <v-row>
          <v-col cols="12">
            <SalesTrendChart :data="salesTrend" :loading="loading" />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" lg="4">
        <DashboardTasksWidget />
      </v-col>
    </v-row>

    <!-- Top Products row -->
    <v-row class="px-6 mx-0 mb-6">
      <v-col cols="12">
        <TopProductsChart :data="topProducts" :loading="loading" />
      </v-col>
    </v-row>

    <!-- Quick Actions & Recent Invoices -->
    <v-row class="px-6 mx-0">
      <v-col cols="12" lg="4">
        <QuickActions :actions="quickActions" @action-click="handleAction" />
      </v-col>

      <v-col cols="12" lg="8">
        <RecentInvoices :invoices="recentInvoices" :loading="loading" />
      </v-col>
    </v-row>

    <!-- Upcoming Payments & Installments -->
    <v-row class="px-6 mx-0 pb-6 mt-4">
      <v-col cols="12" md="6">
        <UpcomingPayments :payments="upcomingPayments" :loading="loadingUpcoming" />
      </v-col>

      <v-col cols="12" md="6">
        <UpcomingInstallments :installments="upcomingInstallments" :loading="loadingInstallments" />
      </v-col>
    </v-row>

    <!-- Reports Widgets -->
    <v-row class="px-6 mx-0 pb-6">
      <v-col cols="12" md="6">
        <ProfitSummaryWidget />
      </v-col>

      <v-col cols="12" md="6">
        <ReportsQuickLinks />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardData } from '../composables/useDashboardData';
import AppButton from '@/components/common/AppButton.vue';
import ShareView from '@/modules/capture/components/ShareView.vue';
import StatsCards from '../components/StatsCards.vue';
import QuickActions from '../components/QuickActions.vue';
import RecentInvoices from '../components/RecentInvoices.vue';
import UpcomingPayments from '../components/UpcomingPayments.vue';
import UpcomingInstallments from '../components/UpcomingInstallments.vue';
import SalesTrendChart from '../components/SalesTrendChart.vue';
import TopProductsChart from '../components/TopProductsChart.vue';
import DashboardTasksWidget from '@/modules/tasks/components/DashboardTasksWidget.vue';
import ProfitSummaryWidget from '../components/ProfitSummaryWidget.vue';
import ReportsQuickLinks from '../components/ReportsQuickLinks.vue';

const router = useRouter();

// Use composable for data fetching
const {
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
  refreshAll,
} = useDashboardData();

// Quick actions configuration
const quickActions = [
  {
    title: 'فاتورة جديدة',
    subtitle: 'إنشاء فاتورة بيع',
    icon: 'ri-file-add-line',
    color: 'primary',
    route: '/invoices/create',
  },
  {
    title: 'تسجيل دفعة',
    subtitle: 'إضافة دفعة جديدة',
    icon: 'ri-money-dollar-circle-line',
    color: 'success',
    route: '/payments/create',
  },
  {
    title: 'منتج جديد',
    subtitle: 'إضافة منتج للمخزون',
    icon: 'ri-shopping-bag-line',
    color: 'info',
    route: '/products/create',
  },
  {
    title: 'عرض التقارير',
    subtitle: 'تقارير مفصلة',
    icon: 'ri-bar-chart-line',
    color: 'warning',
    route: '/reports',
  },
];

const handleAction = route => {
  router.push(route);
};

// Fetch data on mount
onMounted(async () => {
  await refreshAll();
});
</script>
