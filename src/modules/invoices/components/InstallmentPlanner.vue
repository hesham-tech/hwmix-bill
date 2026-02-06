<template>
  <v-card variant="tonal" color="primary" class="mt-4 pa-4 installment-planner-card">
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="d-flex align-center">
        <v-icon icon="ri-calendar-2-line" class="me-2" />
        <span class="font-weight-bold">خطة التقسيط المقترحة</span>
      </div>
      <v-chip size="small" color="primary" variant="flat">بيع بالتقسيط</v-chip>
    </div>

    <div class="text-h6 font-weight-bold mb-1" v-html="scheduleSummary"></div>

    <div class="text-caption text-secondary">سيتم تأكيد التفاصيل النهائية عند الضغط على حفظ الفاتورة</div>
  </v-card>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useInstallments } from '@/composables/useInstallments';

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

const { totalAmount, scheduleSummary, calculatePlan } = useInstallments({
  totalAmount: props.netAmount,
});

// Keep totalAmount synced with prop
watch(
  () => props.netAmount,
  val => {
    totalAmount.value = val;
    calculatePlan();
  },
  { immediate: true }
);

onMounted(() => {
  calculatePlan();
});
</script>

<style scoped>
.installment-planner-card {
  border-radius: 12px;
}
</style>
