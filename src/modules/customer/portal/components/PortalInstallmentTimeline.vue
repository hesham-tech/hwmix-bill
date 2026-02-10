<template>
  <div class="portal-installment-timeline">
    <div v-if="installments.length === 0" class="text-center py-4 text-grey text-caption">لا توجد أقساط مجدولة حالياً.</div>

    <div v-else class="timeline-container ps-4">
      <div
        v-for="(inst, idx) in installments"
        :key="inst.id"
        class="timeline-item pb-4 border-s-2 position-relative"
        :class="[inst.status === 'paid' ? 'border-success' : 'border-grey-lighten-2', { 'last-item': idx === installments.length - 1 }]"
      >
        <!-- Timeline dot -->
        <div
          class="timeline-dot position-absolute rounded-circle bg-white border-2"
          :class="inst.status === 'paid' ? 'border-success' : 'border-grey-lighten-2'"
          style="width: 12px; height: 12px; left: -7px; top: 0"
        ></div>

        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption font-weight-bold" :class="inst.status === 'paid' ? 'text-success' : 'text-slate-700'">
            قسط #{{ inst.installment_number }}
          </span>
          <span class="text-caption font-weight-black">{{ formatCurrency(inst.amount) }}</span>
        </div>

        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center gap-1">
            <v-icon icon="ri-calendar-line" size="12" color="grey" />
            <span class="text-xxs text-grey">{{ formatDate(inst.due_date) }}</span>
          </div>
          <v-chip v-if="inst.status === 'paid'" size="x-small" color="success" variant="flat" class="px-2 font-weight-black"> تم السداد </v-chip>
          <v-chip v-else-if="new Date(inst.due_date) < new Date()" size="x-small" color="error" variant="tonal" class="px-2 font-weight-black">
            متأخر
          </v-chip>
          <span v-else class="text-xxs text-orange font-weight-bold">قيد السداد</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  installments: { type: Array, default: () => [] },
});
</script>

<style scoped>
.timeline-container {
  border-left: none !important;
}

.timeline-item {
  padding-left: 20px;
}

.last-item {
  border-left-color: transparent !important;
}

.text-xxs {
  font-size: 0.65rem;
}

.gap-1 {
  gap: 4px;
}
</style>
