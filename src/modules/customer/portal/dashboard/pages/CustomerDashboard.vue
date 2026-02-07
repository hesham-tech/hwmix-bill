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

    <!-- Stats Grid -->
    <v-row class="mb-8">
      <v-col cols="12">
        <v-card variant="flat" border class="stats-card pa-2 text-center h-100 bg-primary-lighten-5 border-primary">
          <v-icon icon="ri-wallet-3-line" size="48" color="primary" class="mb-3" />
          <div class="text-body-2 text-primary-darken-2 font-weight-bold mb-1">رصيدك</div>
          <div class="text-h4 font-weight-bold text-primary-darken-4">{{ formatCurrency(stats.remainingBalance) }}</div>
        </v-card>
      </v-col>

      <!-- <v-col cols="12" md="4">
        <v-card variant="flat" border class="stats-card pa-2 text-center h-100 bg-success-lighten-5 border-success">
          <v-icon icon="ri-checkbox-circle-line" size="48" color="success" class="mb-3" />
          <div class="text-body-2 text-success-darken-2 font-weight-bold mb-1">إجمالي ما تم سداده</div>
          <div class="text-h4 font-weight-bold text-success-darken-4">{{ formatCurrency(stats.totalPaid) }}</div>
        </v-card>
      </v-col> -->

      <v-col v-if="userStore.hasInstallments" cols="12" md="4">
        <v-card variant="flat" border class="stats-card pa-2 text-center h-100 bg-orange-lighten-5 border-orange">
          <v-icon icon="ri-calendar-todo-line" size="48" color="orange" class="mb-3" />
          <div class="text-body-2 text-orange-darken-2 font-weight-bold mb-1">فواتير قيد التقسيط</div>
          <div class="text-h4 font-weight-bold text-orange-darken-4">{{ stats.activeInstallmentPlans || 0 }} خطط</div>
        </v-card>
      </v-col>
    </v-row>

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

        <v-row v-else>
          <v-col v-for="item in recentInvoices.slice(0, 4)" :key="item.id" cols="12" sm="6">
            <PurchaseCard :purchase="item" @view="viewInvoice" @print="printInvoice" />
          </v-col>
        </v-row>
      </v-col>

      <!-- Sidebar: Quick Actions & Alerts -->
      <v-col cols="12" lg="4">
        <v-card variant="flat" border class="pa-4 rounded-md mb-2">
          <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-2">
            <v-icon icon="ri-flashlight-line" color="warning" />
            إجراءات سريعة
          </h3>
          <div class="d-flex flex-column gap-3">
            <v-btn
              block
              color="primary"
              variant="tonal"
              prepend-icon="ri-file-search-line"
              to="/app/purchases"
              height="48"
              class="font-weight-bold justify-start rounded-md"
            >
              البحث عن فاتورة
            </v-btn>
            <v-btn
              v-if="userStore.hasInstallments"
              block
              color="secondary"
              variant="tonal"
              prepend-icon="ri-calendar-check-line"
              to="/app/customer-installments"
              height="48"
              class="font-weight-bold justify-start rounded-md"
            >
              متابعة الأقساط
            </v-btn>
            <v-btn
              block
              color="success"
              variant="tonal"
              prepend-icon="ri-money-dollar-circle-line"
              to="/app/customer-payments"
              height="48"
              class="font-weight-bold justify-start rounded-md"
            >
              سجل مدفوعاتي
            </v-btn>
          </div>
        </v-card>

        <!-- Upcoming Installments Alert if any -->
        <v-card v-if="upcomingInstallments.length > 0" variant="flat" border color="error" class="bg-error-lighten-5 pa-4 rounded-md">
          <div class="d-flex align-start gap-3">
            <v-icon icon="ri-error-warning-fill" size="24" color="error" />
            <div>
              <div class="text-subtitle-2 font-weight-bold text-error mb-1">تنبيه أقساط قادمة</div>
              <div class="text-body-2 text-error-darken-1 mb-3">لديك أقساط تستحق السداد قريباً، يرجى مراجعة الجدول.</div>
              <v-btn size="small" color="error" variant="flat" to="/app/customer-installments" class="font-weight-bold rounded-md px-4">
                مراجعة الآن
              </v-btn>
            </div>
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
import PurchaseCard from '../../purchases/components/PurchaseCard.vue';
import { toast } from 'vue3-toastify';

const userStore = useUserStore();
const router = useRouter();
const { stats, recentInvoices, upcomingInstallments, refreshing, loading, refreshAll } = useDashboardData();

const userName = computed(() => userStore.currentUser?.full_name?.split(' ')[0] || 'أهلاً بك');
const dynamicGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'أهلاً بك';
});

const viewInvoice = invoice => {
  router.push(`/app/purchases/${invoice.id}`);
};

const printInvoice = async invoice => {
  try {
    toast.info('جاري تجهيز الفاتورة للطباعة...');
    window.open(`/api/invoice/${invoice.id}/pdf`, '_blank');
  } catch (error) {
    toast.error('فشل في طباعة الفاتورة');
  }
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

.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}

.stats-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}
</style>
