<template>
  <v-card
    variant="flat"
    class="portal-plan-card border rounded-xl overflow-hidden shadow-sm hover-shadow transition-all bg-white mb-4"
    @click="$emit('view', plan)"
  >
    <div class="pa-4">
      <!-- Header -->
      <div class="d-flex justify-space-between align-start mb-4">
        <div class="d-flex align-center gap-3">
          <v-avatar color="secondary-lighten-5" size="44" rounded="lg">
            <v-icon icon="ri-calendar-event-line" color="secondary" size="24" />
          </v-avatar>
          <div>
            <div class="text-overline font-weight-black text-secondary line-height-1 mb-1">خطة تقسيط نشطة</div>
            <div class="text-h6 font-weight-black text-slate-900 line-height-1">#{{ plan.id }}</div>
          </div>
        </div>
        <PortalStatusBadge :status="plan.status" size="x-small" />
      </div>

      <!-- Financial Progress -->
      <div class="bg-slate-50 rounded-xl pa-3 mb-4 border border-slate-100">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-caption font-weight-bold text-slate-500">معدل الانجاز</span>
          <span class="text-caption font-weight-black text-secondary">{{ progress }}%</span>
        </div>
        <v-progress-linear :model-value="progress" color="secondary" height="8" rounded class="bg-white border shadow-inner" />
      </div>

      <!-- Stats Grid -->
      <v-row no-gutters class="mb-4">
        <v-col cols="6" class="border-e-slate px-2">
          <div class="text-xxs font-weight-bold text-slate-400 mb-1">القسط الشهري</div>
          <div class="text-subtitle-1 font-weight-black text-primary">{{ formatCurrency(plan.installment_amount) }}</div>
        </v-col>
        <v-col cols="6" class="px-2">
          <div class="text-xxs font-weight-bold text-slate-400 mb-1">المبلغ المتبقي</div>
          <div class="text-subtitle-1 font-weight-black text-slate-900">{{ formatCurrency(plan.remaining_amount || plan.net_amount) }}</div>
        </v-col>
      </v-row>

      <v-divider class="mb-4 border-slate-100" />

      <!-- Footer Info -->
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex align-center gap-2">
          <v-icon icon="ri-bill-line" size="14" color="grey" />
          <span class="text-caption font-weight-bold text-grey">الفاتورة: #{{ plan.invoice?.invoice_number || '---' }}</span>
        </div>
        <v-btn variant="text" color="primary" size="small" class="font-weight-black rounded-lg" @click.stop="$emit('view', plan)">
          عرض الجدول
          <v-icon icon="ri-arrow-left-s-line" end />
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/formatters';
import PortalStatusBadge from '../../components/PortalStatusBadge.vue';

const props = defineProps({
  plan: { type: Object, required: true },
});

defineEmits(['view']);

const progress = computed(() => {
  const total = parseFloat(props.plan.net_amount) || 0;
  const paid = total - (parseFloat(props.plan.remaining_amount) || 0);
  if (total === 0) return 0;
  return Math.round((paid / total) * 100);
});
</script>

<style scoped>
.portal-plan-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.08) !important;
}

.bg-slate-50 {
  background-color: #f8fafc;
}
.border-slate-100 {
  border-color: #f1f5f9 !important;
}
.border-e-slate {
  border-right: 1px solid #f1f5f9 !important;
}

.line-height-1 {
  line-height: 1;
}
.text-xxs {
  font-size: 0.65rem;
}
.text-slate-400 {
  color: #94a3b8;
}
.text-slate-500 {
  color: #64748b;
}
.text-slate-900 {
  color: #0f172a;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important;
}
</style>
