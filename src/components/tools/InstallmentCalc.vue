<template>
  <div class="installment-calc-content pa-1">
    <div class="pa-4 overflow-y-auto" style="max-height: 80vh">
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="totalAmount"
            label="إجمالي قيمة الفاتورة"
            type="number"
            suffix="ج.م"
            density="compact"
            variant="outlined"
            :disabled="mode === 'invoice'"
            @update:model-value="onDataChange"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="plan.interest_rate"
            label="نسبة الفائدة السنوية"
            type="number"
            suffix="%"
            density="compact"
            variant="outlined"
            @update:model-value="onDataChange"
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
            @update:model-value="onDataChange"
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
            @update:model-value="onDataChange"
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model="frequency"
            :items="frequencies"
            label="دورية القسط"
            density="compact"
            variant="outlined"
            @update:model-value="onDataChange"
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
            @update:model-value="onDataChange"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="plan.start_date"
            label="تاريخ أول قسط"
            type="date"
            density="compact"
            variant="outlined"
            @update:model-value="onDataChange"
          />
        </v-col>
      </v-row>

      <v-row dense class="mt-2">
        <v-col cols="6">
          <v-card variant="flat" border class="pa-2 bg-grey-lighten-5">
            <div class="text-caption text-grey">قيمة الفائدة</div>
            <div class="text-body-1 font-weight-bold text-error">{{ formatCurrency(interestAmount) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card variant="flat" border class="pa-2 bg-grey-lighten-5">
            <div class="text-caption text-grey">الإجمالي بالفوائد</div>
            <div class="text-body-1 font-weight-bold">{{ formatCurrency(totalWithInterest) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card variant="tonal" color="primary" class="pa-3 text-center">
            <div class="text-caption mb-1">تفاصيل الأقساط</div>
            <div class="text-h6 font-weight-bold" v-html="scheduleSummary" />
          </v-card>
        </v-col>
      </v-row>

      <div v-if="mode === 'invoice'" class="mt-4">
        <v-btn block color="primary" size="large" @click="handleSave">
          تأكيد وحفظ الفاتورة
          <v-icon icon="ri-check-line" class="ms-2" />
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useInstallments } from '@/composables/useInstallments';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  mode: {
    type: String,
    default: 'standalone',
  },
  initialTotal: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['close', 'save']);

const { totalAmount, frequency, plan, interestAmount, totalWithInterest, scheduleSummary, calculatePlan } = useInstallments({
  totalAmount: props.initialTotal,
});

const frequencies = [
  { title: 'شهري', value: 'monthly' },
  { title: 'أسبوعي', value: 'weekly' },
  { title: 'كل أسبوعين', value: 'biweekly' },
  { title: 'كل 3 أشهر', value: 'quarterly' },
];

const onDataChange = () => {
  calculatePlan();
  if (props.mode === 'standalone') {
    const data = {
      totalAmount: totalAmount.value,
      frequency: frequency.value,
      plan: {
        down_payment: plan.value.down_payment,
        number_of_installments: plan.value.number_of_installments,
        interest_rate: plan.value.interest_rate,
        round_step: plan.value.round_step,
        start_date: plan.value.start_date,
      },
    };
    localStorage.setItem('installment_calc_data', JSON.stringify(data));
  }
};

const handleSave = () => {
  emit('save', {
    ...plan.value,
    frequency: frequency.value,
    net_amount: totalAmount.value,
    total_amount: totalWithInterest.value,
    interest_amount: interestAmount.value,
  });
};

onMounted(() => {
  if (props.mode === 'standalone') {
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
  } else {
    totalAmount.value = props.initialTotal;
  }
  calculatePlan();
});

// Watch for external total changes (e.g. from InvoiceForm)
watch(
  () => props.initialTotal,
  newTotal => {
    if (props.mode === 'invoice') {
      totalAmount.value = newTotal;
      calculatePlan();
    }
  }
);
</script>

<script>
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
