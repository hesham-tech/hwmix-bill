<template>
  <div class="dashboard-page">
    <!-- Header -->
    <div class="dashboard-header mb-6">
      <h1 class="text-h4 font-weight-bold">لوحة التحكم</h1>
      <p class="text-body-1 text-grey">نظرة عامة على أداء النظام</p>
    </div>

    <!-- Loading State -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- Statistics Cards -->
    <StatsCards :stats="stats" />

    <!-- Quick Actions & Recent Invoices -->
    <v-row>
      <v-col cols="12" md="4">
        <QuickActions :actions="quickActions" @action-click="handleAction" />
      </v-col>

      <v-col cols="12" md="8">
        <RecentInvoices :invoices="recentInvoices" :loading="loadingInvoices" />
      </v-col>
    </v-row>

    <!-- Upcoming Payments & Installments -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <UpcomingPayments :payments="upcomingPayments" :loading="loadingUpcoming" />
      </v-col>

      <v-col cols="12" md="6">
        <UpcomingInstallments :installments="upcomingInstallments" :loading="loadingInstallments" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardData } from '../composables/useDashboardData';
import StatsCards from '../components/StatsCards.vue';
import QuickActions from '../components/QuickActions.vue';
import RecentInvoices from '../components/RecentInvoices.vue';
import UpcomingPayments from '../components/UpcomingPayments.vue';
import UpcomingInstallments from '../components/UpcomingInstallments.vue';

const router = useRouter();

// Use composable for data fetching
const {
  stats,
  recentInvoices,
  upcomingPayments,
  upcomingInstallments,
  loading,
  loadingInvoices,
  loadingUpcoming,
  loadingInstallments,
  fetchDashboardData,
  fetchRecentInvoices,
  fetchUpcomingPayments,
  fetchUpcomingInstallments,
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
  await Promise.all([fetchDashboardData(), fetchRecentInvoices(), fetchUpcomingPayments(), fetchUpcomingInstallments()]);
});
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
}

.dashboard-header {
  margin-bottom: 24px;
}
</style>
