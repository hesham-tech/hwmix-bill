<template>
  <div class="installments-portal">
    <v-container fluid class="pa-2">
      <!-- Header -->
      <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-6 gap-4">
        <div>
          <div class="text-overline font-weight-black text-secondary line-height-1 mb-1">جدولة المدفوعات</div>
          <h1 class="text-h3 font-weight-black text-slate-900">خطط التقسيط الرقمية</h1>
          <p class="text-body-2 text-slate-500">إدارة ومتابعة جداول الدفع الآجلة والمدفوعات</p>
        </div>
        <v-btn color="secondary" variant="tonal" prepend-icon="ri-history-line" class="rounded-lg font-weight-black" to="/app/customer-payments">
          سجل المدفوعات
        </v-btn>
      </div>

      <!-- Stats -->
      <div class="stats-tray d-flex gap-4 mb-8 overflow-x-auto pb-2">
        <!-- Unified Account Balance -->
        <div
          class="stat-card px-6 py-4 rounded-xl flex-grow-1 min-w-280 shadow-sm transition-all"
          :class="userStore.currentUser?.balance < 0 ? 'bg-error-lighten-5 border-error' : 'bg-primary-lighten-5 border-primary'"
          style="border: 1px dashed"
        >
          <div class="d-flex align-center gap-2 mb-1">
            <v-icon
              :icon="userStore.currentUser?.balance < 0 ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'"
              :color="userStore.currentUser?.balance < 0 ? 'error' : 'primary'"
              size="16"
            />
            <div class="text-xxs font-weight-bold" :class="userStore.currentUser?.balance < 0 ? 'text-error-darken-2' : 'text-primary-darken-2'">
              رصيد الحساب الجاري الموحد
            </div>
          </div>
          <div class="text-h4 font-weight-black" :class="userStore.currentUser?.balance < 0 ? 'text-error-darken-4' : 'text-primary-darken-4'">
            {{ formatCurrency(userStore.currentUser?.balance) }}
          </div>
        </div>

        <div class="stat-card bg-secondary-lighten-5 border-secondary border-dashed px-6 py-4 rounded-xl min-w-200">
          <div class="text-xxs font-weight-bold text-secondary-darken-2 mb-1">إجمالي التزامات التقسيط</div>
          <div class="text-h4 font-weight-black text-secondary-darken-4">{{ formatCurrency(summary.total) }}</div>
        </div>
        <div class="stat-card bg-success-lighten-5 border-success border-dashed px-6 py-4 rounded-xl min-w-160">
          <div class="text-xxs font-weight-bold text-success-darken-2 mb-1">الخطط المكتملة</div>
          <div class="text-h4 font-weight-black text-success-darken-4">{{ summary.completed }}</div>
        </div>
        <div class="stat-card bg-primary-lighten-5 border-primary border-dashed px-6 py-4 rounded-xl min-w-160">
          <div class="text-xxs font-weight-bold text-primary-darken-2 mb-1">الخطط النشطة</div>
          <div class="text-h4 font-weight-black text-primary-darken-4">{{ summary.active }}</div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading && plans.length === 0" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="secondary" size="64" />
      </div>

      <!-- Empty State -->
      <div v-else-if="plans.length === 0" class="text-center py-12 bg-grey-lighten-4 rounded-md border border-dashed mt-4">
        <v-icon icon="ri-calendar-todo-line" size="64" color="grey-lighten-1" class="mb-4" />
        <h3 class="text-h6 font-weight-bold text-grey-darken-1">لا توجد خطط تقسيط حالياً</h3>
      </div>

      <!-- Grid -->
      <v-row v-else class="dense-grid">
        <v-col v-for="plan in plans" :key="plan.id" cols="12" sm="6" lg="4" class="pa-2">
          <PortalInstallmentPlanCard :plan="plan" @view="viewPlan" />
        </v-col>
      </v-row>

      <!-- Pagination -->
      <div class="d-flex justify-center mt-8">
        <v-pagination
          v-if="total > perPage"
          v-model="page"
          :length="Math.ceil(total / perPage)"
          rounded="circle"
          color="secondary"
          @update:model-value="fetchData"
        />
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { formatCurrency } from '@/utils/formatters';
import PortalInstallmentPlanCard from '../components/PortalInstallmentPlanCard.vue';

const userStore = useUserStore();

const router = useRouter();
const api = useApi('/api/installment-plans');

const plans = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const perPage = ref(9);

const summary = computed(() => {
  return plans.value.reduce(
    (acc, p) => {
      acc.total += parseFloat(p.net_amount || 0);
      if (p.status === 'completed') acc.completed++;
      if (p.status === 'active') acc.active++;
      return acc;
    },
    { total: 0, completed: 0, active: 0 }
  );
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get({
      page: page.value,
      per_page: perPage.value,
    });
    plans.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const viewPlan = plan => {
  // Assuming a customer view for plan exists or we redirect to invoice
  if (plan.invoice_id) {
    router.push(`/app/purchases/${plan.invoice_id}`);
  }
};

onMounted(fetchData);
</script>
<style scoped>
.installments-portal {
  background-color: #f8fafc;
  min-height: 100vh;
}

.dense-grid {
  margin: -8px;
}
.gap-4 {
  gap: 16px;
}

.line-height-1 {
  line-height: 1;
}
.text-xxs {
  font-size: 0.65rem;
}
.text-slate-500 {
  color: #64748b;
}
.text-slate-900 {
  color: #0f172a;
}

.stats-tray::-webkit-scrollbar {
  display: none;
}
.stats-tray {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.min-w-200 {
  min-width: 200px;
}
.min-w-160 {
  min-width: 160px;
}

.border-dashed {
  border-style: dashed !important;
}
</style>
