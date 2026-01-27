<template>
  <div class="installments-portal">
    <v-container fluid class="pa-6">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-black mb-1">خطط التقسيط</h1>
          <p class="text-subtitle-1 text-grey-darken-1">ادارة ومتابعة جداول الدفع الآجلة</p>
        </div>
        <v-avatar color="secondary" rounded="xl" size="56" class="elevation-4">
          <v-icon icon="ri-calendar-schedule-line" color="white" size="32" />
        </v-avatar>
      </div>

      <!-- Stats -->
      <v-row class="mb-6">
        <v-col cols="12" sm="4">
          <v-card variant="flat" border class="pa-4 bg-secondary-lighten-5 border-secondary">
            <div class="text-caption text-secondary-darken-2 font-weight-bold mb-1">إجمالي مبلغ التقسيط</div>
            <div class="text-h5 font-weight-black">{{ formatCurrency(summary.total) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="flat" border class="pa-4 bg-info-lighten-5 border-info">
            <div class="text-caption text-info-darken-2 font-weight-bold mb-1">الخطط المكتملة</div>
            <div class="text-h5 font-weight-black">{{ summary.completed }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card variant="flat" border class="pa-4 bg-primary-lighten-5 border-primary">
            <div class="text-caption text-primary-darken-2 font-weight-bold mb-1">الخطط النشطة</div>
            <div class="text-h5 font-weight-black">{{ summary.active }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading -->
      <div v-if="loading && plans.length === 0" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="secondary" size="64" />
      </div>

      <!-- Empty State -->
      <div v-else-if="plans.length === 0" class="text-center py-12 bg-grey-lighten-4 rounded-xl border border-dashed mt-4">
        <v-icon icon="ri-calendar-todo-line" size="64" color="grey-lighten-1" class="mb-4" />
        <h3 class="text-h6 font-weight-bold text-grey-darken-1">لا توجد خطط تقسيط حالياً</h3>
      </div>

      <!-- Grid -->
      <v-row v-else>
        <v-col v-for="plan in plans" :key="plan.id" cols="12" md="6" lg="4">
          <InstallmentPlanCard :plan="plan" @view="viewPlan" />
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
import { formatCurrency } from '@/utils/formatters';
import InstallmentPlanCard from '../components/InstallmentPlanCard.vue';

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
