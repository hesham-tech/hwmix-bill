<template>
  <div class="customer-dashboard pa-6">
    <!-- Premium Header -->
    <div class="welcome-section mb-8">
      <h1 class="text-h3 font-weight-bold primary-gradient-text">{{ dynamicGreeting }}, {{ userName }}!</h1>
      <p class="text-h6 text-grey-darken-1 font-weight-regular mt-2">إليك ملخص معاملاتك في {{ companyName }}</p>
    </div>

    <!-- Main Scorecards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="premium-card balance-card" elevation="4">
          <div class="card-glow"></div>
          <v-card-text class="d-flex flex-column align-center py-8">
            <v-icon icon="ri-wallet-3-line" size="48" color="white" class="mb-4" />
            <div class="text-overline text-white-50">رصيدك الحالي</div>
            <div class="text-h3 font-weight-black text-white mt-1">{{ formatCurrency(userStore.currentUser?.balance) }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="premium-card info-card" elevation="2">
          <v-card-text class="d-flex align-center py-6">
            <v-avatar color="primary-lighten-4" size="64" class="me-4">
              <v-icon icon="ri-shopping-cart-2-line" color="primary" size="32" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">إجمالي المشتريات</div>
              <div class="text-h5 font-weight-bold">{{ stats.totalInvoices }} فاتورة</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="premium-card info-card" elevation="2">
          <v-card-text class="d-flex align-center py-6">
            <v-avatar color="warning-lighten-4" size="64" class="me-4">
              <v-icon icon="ri-calendar-todo-line" color="warning" size="32" />
            </v-avatar>
            <div>
              <div class="text-caption text-grey">أقساط قادمة</div>
              <div class="text-h5 font-weight-bold">{{ upcomingInstallments.length }} قسط قريباً</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Content Sections -->
    <v-row class="mt-6">
      <v-col cols="12" lg="8">
        <v-card rounded="xl" class="border">
          <v-toolbar flat color="transparent" class="px-4">
            <v-toolbar-title class="font-weight-bold">آخر مشترياتي</v-toolbar-title>
            <v-spacer />
            <AppButton variant="text" size="small" to="/invoices">عرض الكل</AppButton>
          </v-toolbar>
          <v-divider />
          <RecentInvoices :invoices="recentInvoices" :loading="loadingInvoices" hide-actions />
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" class="border bg-grey-lighten-5">
          <v-card-title class="font-weight-bold px-6 pt-6">روابط سريعة</v-card-title>
          <v-card-text class="px-4 pb-6">
            <v-list bg-color="transparent">
              <v-list-item
                v-for="(action, i) in customerActions"
                :key="i"
                v-bind="action.props"
                class="mb-2 rounded-lg py-3 action-item"
                :prepend-icon="action.icon"
                :title="action.title"
                variant="flat"
                color="white"
                elevation="1"
              />
            </v-list>
          </v-card-text>
        </v-card>

        <v-card rounded="xl" class="mt-4 primary-gradient text-white pa-6">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-h6 font-weight-bold">هل تحتاج مساعدة؟</span>
            <v-icon icon="ri-customer-service-2-line" size="32" />
          </div>
          <p class="text-body-2 mb-4 opacity-80">نحن هنا لخدمتك دائماً. تواصل معنا لأي استفسار حول معاملاتك.</p>
          <v-btn block color="white" variant="flat" class="text-primary font-weight-bold rounded-lg">تواصل مع الدعم</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useDashboardData } from '../composables/useDashboardData';
import RecentInvoices from '../components/RecentInvoices.vue';
import AppButton from '@/components/common/AppButton.vue';
import { formatCurrency } from '@/utils/formatters';

const userStore = useUserStore();
const { stats, recentInvoices, upcomingInstallments, loadingInvoices, refreshAll } = useDashboardData();

const userName = computed(() => userStore.currentUser?.full_name?.split(' ')[0] || 'أهلاً بك');
const companyName = computed(() => {
  const company = userStore.companies.find(c => c.id === userStore.currentUser?.company_id);
  return company?.name || 'الشركة';
});

const dynamicGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'أهلاً بك';
});

const customerActions = [
  { title: 'كشف حسابي', icon: 'ri-file-search-line', props: { to: '/reports/my-statement' } },
  { title: 'فواتيري السابقة', icon: 'ri-bill-line', props: { to: '/invoices' } },
  { title: 'جدول أقساطي', icon: 'ri-calendar-2-line', props: { to: '/installments' } },
  { title: 'تحويل نقدي', icon: 'ri-send-plane-2-line', props: { to: '/transactions/create' } },
];

onMounted(() => {
  refreshAll();
});
</script>

<style scoped>
.primary-gradient {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1a237e 100%);
}

.primary-gradient-text {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1a237e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.premium-card {
  border-radius: 24px !important;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease;
}

.premium-card:hover {
  transform: translateY(-5px);
}

.balance-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #312e81 100%);
  color: white;
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.6) !important;
}

.info-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.action-item {
  transition: all 0.2s ease;
}

.action-item:hover {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}
</style>
