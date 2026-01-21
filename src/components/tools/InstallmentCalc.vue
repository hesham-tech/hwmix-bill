<template>
  <v-card width="400" class="installment-calc-card elevation-12">
    <v-card-title class="d-flex justify-space-between align-center py-2 bg-grey-lighten-4 drag-handle cursor-move">
      <div class="d-flex align-center">
        <v-icon icon="ri-calendar-todo-line" size="small" class="me-2" />
        <span class="text-subtitle-2 font-weight-bold">حاسبة الأقساط المتقدمة</span>
      </div>
      <v-btn icon="ri-close-line" size="x-small" variant="text" @click="$emit('close')" />
    </v-card-title>

    <v-card-text class="pa-4 overflow-y-auto" style="max-height: 80vh">
      <v-row dense>
        <v-col cols="12">
          <v-text-field
            v-model.number="totalAmount"
            label="إجمالي قيمة الفاتورة"
            type="number"
            suffix="ج.م"
            density="compact"
            variant="outlined"
            @update:model-value="calculatePlan"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="plan.down_payment"
            label="الدفعة المقدمة"
            type="number"
            suffix="ج.م"
            density="compact"
            variant="outlined"
            @update:model-value="calculatePlan"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="plan.number_of_installments"
            label="عدد الأقساط"
            type="number"
            density="compact"
            variant="outlined"
            min="1"
            @update:model-value="calculatePlan"
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="frequency"
            :items="frequencies"
            label="دورية القسط"
            density="compact"
            variant="outlined"
            @update:model-value="calculatePlan"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model.number="plan.round_step"
            label="تقريب القسط لأقرب"
            type="number"
            min="1"
            density="compact"
            variant="outlined"
            @update:model-value="calculatePlan"
          />
        </v-col>
      </v-row>

      <v-row dense class="mt-2">
        <v-col cols="6">
          <v-card variant="flat" border class="pa-2 bg-grey-lighten-5">
            <div class="text-caption text-grey">المتبقي للتقسيط</div>
            <div class="text-body-1 font-weight-bold">{{ formatCurrency(remainingForInstallment) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card variant="tonal" color="primary" class="pa-2">
            <div class="text-caption">قيمة القسط</div>
            <div class="text-h6 font-weight-black">{{ formatCurrency(plan.installment_amount) }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Preview Schedule -->
      <div class="mt-4">
        <div class="text-caption font-weight-bold mb-2 d-flex align-center">
          <v-icon icon="ri-list-check" size="small" class="me-1" />
          جدول الدفعات المتوقع
        </div>
        <v-table density="compact" class="schedule-table border rounded overflow-hidden">
          <thead>
            <tr class="bg-grey-lighten-4">
              <th class="text-right">#</th>
              <th class="text-right">التاريخ</th>
              <th class="text-left">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in schedule" :key="index">
              <td>{{ item.number }}</td>
              <td>{{ formatDate(item.date) }}</td>
              <td class="text-left font-weight-bold">{{ formatCurrency(item.amount) }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

defineEmits(['close']);

const totalAmount = ref(0);
const frequencies = [
  { title: 'شهري', value: 'monthly' },
  { title: 'أسبوعي', value: 'weekly' },
  { title: 'كل أسبوعين', value: 'biweekly' },
  { title: 'كل 3 أشهر', value: 'quarterly' },
];

const frequency = ref('monthly');
const plan = ref({
  down_payment: 0,
  number_of_installments: 12,
  installment_amount: 0,
  total_amount: 0,
  round_step: 5,
  start_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
});

const loadSavedData = () => {
  const saved = localStorage.getItem('installment_calc_data');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      totalAmount.value = data.totalAmount || 0;
      frequency.value = data.frequency || 'monthly';
      plan.value = { ...plan.value, ...data.plan };
    } catch (e) {
      console.error('Failed to load installment calc data', e);
    }
  }
};

const saveCurrentData = () => {
  const data = {
    totalAmount: totalAmount.value,
    frequency: frequency.value,
    plan: {
      down_payment: plan.value.down_payment,
      number_of_installments: plan.value.number_of_installments,
      round_step: plan.value.round_step,
      start_date: plan.value.start_date,
    },
  };
  localStorage.setItem('installment_calc_data', JSON.stringify(data));
};

const remainingForInstallment = computed(() => {
  return Math.max(0, totalAmount.value - (plan.value.down_payment || 0));
});

const schedule = ref([]);

const calculatePlan = () => {
  const roundStep = plan.value.round_step || 1;
  const remaining = remainingForInstallment.value;
  const count = plan.value.number_of_installments;

  if (count > 0 && remaining > 0) {
    const avgInst = remaining / count;
    plan.value.installment_amount = Math.ceil(avgInst / roundStep) * roundStep;
  } else {
    plan.value.installment_amount = 0;
  }

  generateSchedule();
  saveCurrentData();
};

const generateSchedule = () => {
  const items = [];
  if (plan.value.number_of_installments <= 0) {
    schedule.value = [];
    return;
  }

  let remaining = remainingForInstallment.value;
  const stdInst = plan.value.installment_amount;
  const count = plan.value.number_of_installments;
  let currentDate = new Date(plan.value.start_date);

  for (let i = 1; i <= count; i++) {
    if (remaining <= 0) break;
    const amount = stdInst > remaining || i === count ? remaining : stdInst;

    items.push({
      number: i,
      date: new Date(currentDate),
      amount: amount,
    });

    remaining = Math.max(0, remaining - amount);

    if (frequency.value === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
    else if (frequency.value === 'weekly') currentDate.setDate(currentDate.getDate() + 7);
    else if (frequency.value === 'biweekly') currentDate.setDate(currentDate.getDate() + 14);
    else if (frequency.value === 'quarterly') currentDate.setMonth(currentDate.getMonth() + 3);
  }

  schedule.value = items;
};

onMounted(() => {
  loadSavedData();
  calculatePlan();
});
</script>

<script>
// We add a drag handle class for the draggable logic
export default {
  name: 'InstallmentCalc',
};
</script>

<style scoped>
.installment-calc-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.schedule-table :deep(th),
.schedule-table :deep(td) {
  font-size: 0.7rem !important;
  height: 32px !important;
}

/* Custom scrollbar for better feel */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>
