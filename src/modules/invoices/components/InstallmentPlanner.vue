<template>
  <v-card variant="outlined" class="mt-4" prepend-icon="ri-calendar-todo-line" title="تحديد خطة التقسيط">
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="6">
          <AppInput
            v-model.number="plan.down_payment"
            label="الدفعة المقدمة"
            type="number"
            suffix="ج.م"
            density="compact"
            @update:model-value="calculatePlan"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <AppInput
            v-model.number="plan.number_of_installments"
            label="عدد الأقساط"
            type="number"
            density="compact"
            min="1"
            @update:model-value="calculatePlan"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <AppAutocomplete
            v-model="frequency"
            :items="frequencies"
            label="دورية القسط"
            density="compact"
            hide-details
            @update:model-value="calculatePlan"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <AppInput v-model="plan.start_date" label="تاريخ أول قسط" type="date" density="compact" @update:model-value="calculatePlan" />
        </v-col>
        <v-col cols="12" sm="6">
          <AppInput
            v-model.number="plan.round_step"
            label="تقريب القسط لأقرب"
            type="number"
            min="1"
            density="compact"
            @update:model-value="calculatePlan"
          />
        </v-col>
      </v-row>

      <v-row dense class="mt-3">
        <v-col cols="12" sm="6">
          <v-card variant="flat" border class="pa-3">
            <div class="text-caption text-secondary">المبلغ المتبقي للتقسيط</div>
            <div class="text-h6 font-weight-bold">{{ formatCurrency(remainingForInstallment) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card variant="tonal" color="primary" class="pa-3 text-left">
            <div class="text-caption">قيمة القسط الواحد</div>
            <div class="text-h5 font-weight-black">{{ formatCurrency(plan.installment_amount) }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Preview Schedule -->
      <v-expansion-panels flat class="mt-4 transparent-panels">
        <v-expansion-panel bg-color="transparent">
          <v-expansion-panel-title class="px-0 py-2">
            <span class="text-caption font-weight-bold">عرض جدول الدفعات المتوقع</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="px-0">
            <v-table density="compact" class="schedule-table border rounded">
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
                  <td class="text-left font-weight-medium">{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  netAmount: {
    type: Number,
    required: true,
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'update:downPayment']);

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
  net_amount: 0,
  round_step: 5,
  start_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  due_date: null,
});

const remainingForInstallment = computed(() => {
  return Math.max(0, props.netAmount - (plan.value.down_payment || 0));
});

const schedule = ref([]);

const calculatePlan = () => {
  const roundStep = plan.value.round_step || 1;
  const remaining = remainingForInstallment.value;
  const count = plan.value.number_of_installments;

  if (count > 0 && remaining > 0) {
    const avgInst = remaining / count;
    // التقريب لأعلى بناءً على roundStep المختار
    plan.value.installment_amount = Math.ceil(avgInst / roundStep) * roundStep;
  } else {
    plan.value.installment_amount = 0;
  }

  plan.value.net_amount = props.netAmount;

  // Generate schedule for preview
  generateSchedule();

  // Update parent
  emit('update:modelValue', plan.value);
  emit('update:downPayment', plan.value.down_payment);
};

const generateSchedule = () => {
  const items = [];
  if (!plan.value.start_date || plan.value.number_of_installments <= 0) {
    schedule.value = [];
    return;
  }

  let remaining = remainingForInstallment.value;
  const stdInst = plan.value.installment_amount;
  const count = plan.value.number_of_installments;
  let currentDate = new Date(plan.value.start_date);

  for (let i = 1; i <= count; i++) {
    if (remaining <= 0) break;

    // القسط الأخير دائماً يأخذ الباقي لضمان دقة الإجمالي
    const amount = stdInst > remaining || i === count ? remaining : stdInst;

    items.push({
      number: i,
      date: new Date(currentDate),
      amount: amount,
    });

    remaining = Math.max(0, remaining - amount);

    // إضافة وقت بناءً على الدورية
    if (frequency.value === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);
    else if (frequency.value === 'weekly') currentDate.setDate(currentDate.getDate() + 7);
    else if (frequency.value === 'biweekly') currentDate.setDate(currentDate.getDate() + 14);
    else if (frequency.value === 'quarterly') currentDate.setMonth(currentDate.getMonth() + 3);
  }

  schedule.value = items;
  if (items.length > 0) {
    plan.value.due_date = items[items.length - 1].date.toISOString().split('T')[0];
  }
};

// Initial calculation
onMounted(() => {
  calculatePlan();
});

// Watch for changes in total amount from parent
watch(
  () => props.netAmount,
  () => {
    calculatePlan();
  }
);
</script>

<style scoped>
.schedule-table :deep(th),
.schedule-table :deep(td) {
  font-size: 0.75rem !important;
}

.transparent-panels :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}
</style>
