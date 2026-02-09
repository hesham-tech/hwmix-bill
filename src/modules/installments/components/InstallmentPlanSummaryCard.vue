<template>
  <v-card v-if="plan" rounded="md" class="border shadow-sm installment-plan-summary-card overflow-hidden">
    <div class="pa-3 bg-primary-lighten-5 border-b d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon icon="ri-calendar-todo-line" color="primary" size="18" class="me-2" />
        <span class="text-subtitle-2 font-weight-bold text-primary">تفاصيل التقسيط المرتبط</span>
      </div>
      <v-chip :color="getStatusColor(plan.status)" size="x-small" variant="flat" class="font-weight-bold px-2">
        {{ plan.status_label || plan.status }}
      </v-chip>
    </div>

    <div class="pa-4">
      <v-row dense>
        <v-col cols="6">
          <div class="mb-3">
            <div class="text-xxs text-grey mb-1">المقدم المدفوع</div>
            <div class="text-body-2 font-weight-bold text-indigo">{{ formatCurrency(plan.down_payment) }}</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="mb-3 text-left">
            <div class="text-xxs text-grey mb-1">إجمالي الفوائد</div>
            <div class="text-body-2 font-weight-bold text-error">{{ formatCurrency(plan.interest_amount) }} ({{ plan.interest_rate }}%)</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="mb-3">
            <div class="text-xxs text-grey mb-1">المحصل حتى الآن</div>
            <div class="text-body-2 font-weight-bold text-success">{{ formatCurrency(plan.total_pay) }}</div>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="mb-3 text-left">
            <div class="text-xxs text-grey mb-1">متبقي تقسيط</div>
            <div class="text-body-2 font-weight-bold text-error">{{ formatCurrency(plan.remaining_amount) }}</div>
          </div>
        </v-col>

        <v-col cols="12">
          <v-divider class="mb-3 border-opacity-25" />
          <div class="d-flex align-center justify-space-between mb-1">
            <div class="d-flex flex-column">
              <span class="text-xxs font-weight-bold text-grey">تقدم السداد</span>
              <span class="text-body-2 font-weight-black text-primary">{{ formatCurrency(plan.installment_amount) }} / قسط</span>
            </div>
            <span class="text-h6 font-weight-black text-primary">{{ Math.round(plan.payment_progress || 0) }}%</span>
          </div>
          <v-progress-linear :model-value="plan.payment_progress" height="10" rounded color="primary" class="mt-1 shadow-xs">
            <template v-slot:default="{ value }">
              <span class="text-overline text-white font-weight-bold" style="font-size: 8px !important">{{ Math.ceil(value) }}%</span>
            </template>
          </v-progress-linear>
        </v-col>
      </v-row>

      <div class="mt-4 pt-3 border-t-dashed d-flex justify-center">
        <AppButton color="primary" variant="tonal" size="small" prepend-icon="ri-external-link-line" block @click="$emit('view-plan', plan.id)">
          إدارة خطة التقسيط بالكامل
        </AppButton>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters';
import AppButton from '@/components/common/AppButton.vue';

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
});

defineEmits(['view-plan']);

const getStatusColor = status => {
  const colors = {
    active: 'info',
    pending: 'warning',
    completed: 'success',
    paid: 'success',
    canceled: 'error',
    partially_paid: 'primary',
  };
  return colors[status] || 'grey';
};
</script>

<style scoped>
.installment-plan-summary-card {
  transition: transform 0.2s ease;
}
.installment-plan-summary-card:hover {
  transform: translateY(-2px);
}
.border-t-dashed {
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
}
.shadow-xs {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}
.text-xxs {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
