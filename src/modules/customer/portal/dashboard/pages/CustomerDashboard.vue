<template>
  <div class="customer-dashboard pa-4 pa-sm-6">
    <!-- Welcome Header -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-8 gap-4">
      <div>
        <h1 class="text-h3 font-weight-bold primary-gradient-text mb-2">{{ dynamicGreeting }}, {{ userName }}!</h1>
        <p class="text-subtitle-1 text-grey-darken-1">نظرة سريعة على جميع نشاطاتك المالية ومشترياتك</p>
      </div>
      <v-btn
        prepend-icon="ri-refresh-line"
        variant="tonal"
        color="primary"
        class="rounded-md font-weight-bold"
        height="48"
        :loading="refreshing"
        @click="refreshAll"
      >
        تحديث البيانات
      </v-btn>
    </div>

    <!-- Dynamic Stats Grid (Horizontal Scrolling on mobile, tight layout) -->
    <div class="stats-tray d-flex gap-4 mb-8 overflow-x-auto pb-2">
      <div class="stat-card-premium balance-hero px-6 py-4 rounded-xl shadow-sm d-flex flex-column justify-center min-w-280 flex-grow-1">
        <div class="d-flex align-center gap-3 mb-2">
          <v-avatar color="white" size="32" class="shadow-sm">
            <v-icon icon="ri-wallet-3-line" color="primary" size="18" />
          </v-avatar>
          <span class="text-subtitle-2 font-weight-bold text-white opacity-80">رصيدك الحالي</span>
        </div>
        <div class="text-h3 font-weight-black text-white line-height-1">
          {{ formatCurrency(stats.remainingBalance) }}
        </div>
      </div>

      <div class="stat-card-premium bg-white border px-6 py-4 rounded-xl shadow-sm d-flex flex-column justify-center min-w-200">
        <div class="d-flex align-center gap-3 mb-2">
          <v-avatar color="orange-lighten-5" size="32">
            <v-icon icon="ri-calendar-todo-line" color="orange" size="18" />
          </v-avatar>
          <span class="text-subtitle-2 font-weight-bold text-slate-500">خطط التقسيط</span>
        </div>
        <div class="text-h4 font-weight-black text-slate-900 line-height-1">
          {{ stats.activeInstallmentPlans || 0 }} <span class="text-body-2 font-weight-bold text-grey">خطة</span>
        </div>
      </div>

      <div
        class="stat-card-premium bg-white border px-6 py-4 rounded-xl shadow-sm d-flex flex-column justify-center min-w-200"
        v-if="upcomingInstallments?.length > 0"
      >
        <div class="d-flex align-center gap-3 mb-2">
          <v-avatar color="error-lighten-5" size="32">
            <v-icon icon="ri-alarm-warning-line" color="error" size="18" />
          </v-avatar>
          <span class="text-subtitle-2 font-weight-bold text-slate-500">أقساط قادمة</span>
        </div>
        <div class="text-h4 font-weight-black text-error line-height-1">
          {{ upcomingInstallments.length }} <span class="text-body-2 font-weight-bold text-grey">قسط</span>
        </div>
      </div>
    </div>

    <v-row>
      <!-- Recent Purchases -->
      <v-col cols="12" lg="8">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h5 font-weight-bold d-flex align-center gap-2">
            <v-icon icon="ri-bill-line" color="primary" />
            أحدث المشتريات
          </h2>
          <v-btn variant="text" color="primary" to="/app/purchases" class="font-weight-bold">
            عرض الكل
            <v-icon end icon="ri-arrow-left-s-line" />
          </v-btn>
        </div>

        <div v-if="loading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" size="48" />
        </div>

        <div v-else-if="recentInvoices.length === 0" class="empty-state text-center py-12 border rounded-md bg-grey-lighten-5 border-dashed">
          <v-icon icon="ri-inbox-line" size="48" color="grey" class="mb-2 opacity-50" />
          <div class="text-grey font-weight-bold">لا يوجد مشتريات حديثة</div>
        </div>

        <v-row v-else class="dense-grid">
          <v-col v-for="item in recentInvoices.slice(0, 4)" :key="item.id" cols="12" sm="6" class="pa-2">
            <PortalPurchaseCard :purchase="item" @view="viewInvoice" />
          </v-col>
        </v-row>
      </v-col>

      <!-- Sidebar: Quick Alerts & Portal Tools -->
      <v-col cols="12" lg="4">
        <!-- Quick Alerts: Installment Timeline -->
        <v-card variant="flat" border class="pa-4 rounded-xl mb-4 bg-white shadow-sm border-slate-200">
          <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center gap-2 text-slate-900 border-bottom pb-2">
            <v-icon icon="ri-calendar-todo-line" color="orange" />
            تتبع أقساطك القادمة
          </h3>
          <PortalInstallmentTimeline :installments="upcomingInstallments?.slice(0, 5)" />
          <v-btn
            v-if="upcomingInstallments?.length > 5"
            block
            variant="text"
            color="secondary"
            size="small"
            to="/app/customer-installments"
            class="mt-2 font-weight-bold"
          >
            عرض كافة الأقساط
          </v-btn>
        </v-card>

        <v-card variant="flat" border class="pa-4 rounded-xl mb-4 bg-white shadow-sm border-slate-200">
          <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center gap-2 text-slate-900 border-bottom pb-2">
            <v-icon icon="ri-flashlight-line" color="warning" />
            روابط سريعة
          </h3>
          <div class="d-flex flex-column gap-2">
            <v-btn
              block
              color="primary"
              variant="tonal"
              prepend-icon="ri-file-search-line"
              to="/app/purchases"
              height="40"
              class="font-weight-bold justify-start rounded-lg text-caption"
            >
              البحث عن فاتورة
            </v-btn>
            <v-btn
              v-if="userStore.hasInstallments"
              block
              color="success"
              variant="tonal"
              prepend-icon="ri-money-dollar-circle-line"
              to="/app/customer-payments"
              height="40"
              class="font-weight-bold justify-start rounded-lg text-caption"
            >
              سجل مدفوعاتي
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useDashboardData } from '@/modules/reports/composables/useDashboardData';
import { formatCurrency, formatDate } from '@/utils/formatters';
import PortalPurchaseCard from '../../components/PortalPurchaseCard.vue';
import PortalInstallmentTimeline from '../../components/PortalInstallmentTimeline.vue';

const userStore = useUserStore();
const router = useRouter();
const { stats, recentInvoices, upcomingInstallments, refreshing, loading, refreshAll } = useDashboardData();

const userName = computed(() => userStore.currentUser?.full_name?.split(' ')[0] || 'أهلاً بك');
const dynamicGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 5) return 'ليلة سعيدة';
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'ليلة سعيدة';
});

const viewInvoice = invoice => {
  router.push(`/app/purchases/${invoice.id}`);
};

onMounted(() => {
  refreshAll();
});
</script>

<style scoped>
.customer-dashboard {
  background-color: #f8fafc;
  min-height: 100vh;
}

.primary-gradient-text {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1a237e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.balance-hero {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #303f9f 100%);
}

.stat-card-premium {
  transition: all 0.2s ease;
}

.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}

.min-w-280 {
  min-width: 280px;
}
.min-w-200 {
  min-width: 200px;
}

.line-height-1 {
  line-height: 1;
}

.stats-tray::-webkit-scrollbar {
  display: none;
}
.stats-tray {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.dense-grid {
  margin: -8px;
}

.shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.text-slate-500 {
  color: #64748b;
}
.text-slate-600 {
  color: #475569;
}
.text-slate-900 {
  color: #0f172a;
}
.border-slate-200 {
  border-color: #e2e8f0 !important;
}
</style>
