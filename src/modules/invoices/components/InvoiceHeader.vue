<template>
  <div class="sticky-header d-flex flex-column mb-1 border-b shadow-sm">
    <!-- Row 1: Primary Header -->
    <div class="d-flex align-center justify-space-between px-3 py-1 w-100" style="min-height: 44px;">
      <!-- Title Section -->
      <div class="d-flex align-center flex-grow-0">
        <AppButton icon="ri-arrow-right-line" variant="text" color="secondary" density="compact" @click="$emit('cancel')" class="me-1" />
        <h1 class="text-subtitle-2 font-weight-black mb-0 text-truncate" style="max-width: 150px;">
          {{ title || (isEdit ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة') }}
        </h1>
      </div>

      <!-- Center Dashboard (Desktop Only: Visible on LG and up) -->
      <div class="header-dashboard d-none d-lg-flex align-center justify-center flex-grow-1 gap-0">
        <div class="dashboard-card px-4 border-e">
          <div class="card-label">صافي الفاتورة</div>
          <div class="card-value">{{ formatCurrency(financials?.net_amount || 0) }}</div>
        </div>
        <div class="dashboard-card px-4 border-e">
          <div class="card-label">إجمالي المستحق</div>
          <div class="card-value text-secondary">{{ formatCurrency(financials?.total_balance || 0) }}</div>
        </div>
        <div class="dashboard-card px-4">
          <div class="card-label">المتبقي للتحصيل</div>
          <div :class="['card-value', (financials?.remaining_amount || 0) > 0 ? 'text-error' : 'text-success']">
            {{ formatCurrency(financials?.remaining_amount || 0) }}
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="d-flex gap-2 align-center flex-grow-0">
        <AppButton variant="tonal" color="secondary" density="compact" @click="$emit('cancel')" :disabled="loading" class="d-none d-sm-flex px-3 text-xxs"> إلغاء </AppButton>
        <AppButton
          color="primary"
          prepend-icon="ri-save-line"
          density="compact"
          :loading="loading"
          @click="$emit('save')"
          :disabled="!canSubmit"
          class="px-4 font-weight-bold text-xxs"
        >
          حفظ الفاتورة
        </AppButton>
      </div>
    </div>

    <!-- Row 2: Secondary Dashboard (Mobile/Tablet Only: Hidden on LG and up) -->
    <div class="mobile-dashboard d-flex d-lg-none align-center justify-space-around border-t bg-neutral-lighten-5 py-2">
      <div class="dashboard-card flex-grow-1 border-e">
        <div class="card-label">صافي الفاتورة</div>
        <div class="card-value">{{ formatCurrency(financials?.net_amount || 0) }}</div>
      </div>
      <div class="dashboard-card flex-grow-1 border-e">
        <div class="card-label">إجمالي المستحق</div>
        <div class="card-value text-secondary">{{ formatCurrency(financials?.total_balance || 0) }}</div>
      </div>
      <div class="dashboard-card flex-grow-1">
        <div class="card-label">المتبقي للتحصيل</div>
        <div :class="['card-value', (financials?.remaining_amount || 0) > 0 ? 'text-error' : 'text-success']">
          {{ formatCurrency(financials?.remaining_amount || 0) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters';

defineProps({
  isEdit: Boolean,
  financials: {
    type: Object,
    default: () => ({}),
  },
  loading: Boolean,
  canSubmit: Boolean,
  title: String,
});

defineEmits(['save', 'cancel']);
</script>

<style scoped>
.sticky-header {
  position: sticky;
  top: 88px;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(var(--v-theme-surface), 0.85);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  min-height: 48px;
}

.dashboard-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-label {
  font-size: 8.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.5);
  line-height: 1;
  margin-bottom: 3px;
}

.card-value {
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.3px;
}

.mobile-dashboard {
  width: 100%;
}
</style>
