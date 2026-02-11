<template>
  <v-card
    variant="flat"
    class="portal-purchase-card border rounded-xl overflow-hidden shadow-sm hover-shadow transition-all bg-white"
    @click="$emit('view', purchase)"
  >
    <!-- Header: Date & Product Initial Name -->
    <div class="pa-4 pb-0 d-flex justify-space-between align-start">
      <div class="d-flex align-center gap-3">
        <div class="date-badge pa-2 rounded-xl bg-primary-lighten-5 text-center border">
          <div class="text-xxs font-weight-black text-primary line-height-1 mb-1">
            {{ formatDate(purchase.issue_date, 'MMM') }}
          </div>
          <div class="text-subtitle-1 font-weight-black text-primary line-height-1">{{ formatDate(purchase.issue_date, 'DD') }}</div>
        </div>
        <div class="overflow-hidden">
          <div class="text-h6 font-weight-black text-slate-900 truncate line-height-1-2 mb-1">
            {{ purchase.items?.[0]?.name || 'مشتريات متنوعة' }}
            <span v-if="purchase.items?.length > 1" class="text-caption font-weight-bold text-primary"> (+{{ purchase.items.length - 1 }}) </span>
          </div>
          <div class="text-caption text-grey-darken-1 d-flex align-center gap-1">
            <v-icon icon="ri-bill-line" size="14" />
            فواتير رقم #{{ purchase.invoice_number }}
          </div>
        </div>
      </div>
      <PortalStatusBadge :status="purchase.status" size="x-small" />
    </div>

    <!-- Product Tray (Images & Count) -->
    <div class="pa-4">
      <div class="product-tray d-flex align-center gap-2 mb-4 pa-2 rounded-lg bg-slate-50 border">
        <div v-for="(item, idx) in purchase.items?.slice(0, 3)" :key="item.id" class="tray-item">
          <v-avatar v-if="item.primary_image_url" :src="item.primary_image_url" size="36" rounded="md" class="border Elevate-1" />
          <v-avatar v-else color="grey-lighten-2" size="36" rounded="md" class="border">
            <v-icon icon="ri-image-line" size="18" color="grey" />
          </v-avatar>
        </div>
        <div v-if="purchase.items?.length > 3" class="more-items text-caption font-weight-bold text-grey px-1">+{{ purchase.items.length - 3 }}</div>
        <div class="ms-auto text-caption font-weight-bold text-slate-600 truncate max-w-150">{{ purchase.items?.[0]?.name }}...</div>
      </div>

      <!-- Financial Progress -->
      <div class="financial-summary mb-1">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-caption font-weight-bold text-grey">المبلغ الإجمالي</span>
          <span class="text-subtitle-2 font-weight-black text-primary">{{ formatCurrency(displayTotalAmount) }}</span>
        </div>
        <v-progress-linear :model-value="paymentProgress" color="success" height="6" rounded class="bg-grey-lighten-3" />
        <div class="d-flex justify-space-between mt-1">
          <span class="text-xxs font-weight-bold text-success">تم سداد {{ paymentProgress }}%</span>
          <span class="text-xxs font-weight-bold text-error" v-if="displayRemainingAmount > 0">
            متبقي: {{ formatCurrency(displayRemainingAmount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Tooltip / Click Hint -->
    <div class="view-details-strip py-2 px-4 text-center bg-grey-lighten-5 border-top cursor-pointer">
      <span class="text-caption font-weight-bold text-primary">
        عرض تفاصيل المشتريات
        <v-icon icon="ri-arrow-left-s-line" size="14" class="ms-1" />
      </span>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency, formatDate } from '@/utils/formatters';
import PortalStatusBadge from './PortalStatusBadge.vue';

const props = defineProps({
  purchase: { type: Object, required: true },
});

defineEmits(['view']);

const paymentProgress = computed(() => {
  // استخدام النسبة المحسوبة ديناميكياً من الباك إند لضمان الدقة
  const plan = props.purchase.installment_plan || props.purchase.installmentPlan;
  if (plan) {
    const progress = plan.payment_progress ?? plan.paymentProgress;
    if (progress !== undefined && progress !== null) {
      return Math.round(progress);
    }
  }

  const total = parseFloat(props.purchase.net_amount) || 0;
  const remaining = parseFloat(props.purchase.remaining_amount) || 0;
  const paid = total - remaining;

  if (total <= 0) return 0;
  return Math.round((paid / total) * 100);
});

const displayRemainingAmount = computed(() => {
  const plan = props.purchase.installment_plan || props.purchase.installmentPlan;
  if (!plan) return props.purchase.remaining_amount;

  // إعطاء الأولوية القصوى للتسميات المحسوبة ديناميكياً (actual_remaining)
  // والتحقق من التنسيقين (snake_case و camelCase) لضمان الدقة وتفادي مشاكل المزامنة
  return plan.actual_remaining ?? plan.actualRemaining ?? plan.remaining_amount ?? plan.remainingAmount;
});

const displayTotalAmount = computed(() => {
  const plan = props.purchase.installment_plan || props.purchase.installmentPlan;
  return plan ? (plan.total_amount ?? plan.totalAmount) : props.purchase.net_amount;
});
</script>

<style scoped>
.portal-purchase-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1) !important;
  border-color: rgb(var(--v-theme-primary), 0.2) !important;
}

.date-badge {
  min-width: 48px;
}

.line-height-1 {
  line-height: 1;
}

.text-xxs {
  font-size: 0.65rem;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.max-w-150 {
  max-width: 150px;
}

.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}

.view-details-strip {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.portal-purchase-card:hover .view-details-strip {
  opacity: 1;
  background-color: rgb(var(--v-theme-primary), 0.05);
}
</style>
