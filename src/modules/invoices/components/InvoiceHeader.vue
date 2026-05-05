<template>
  <div class="sticky-header d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between px-3 py-1 mb-1 gap-2">
    <div class="d-flex align-center">
      <AppButton icon="ri-arrow-right-line" variant="text" color="secondary" density="compact" @click="$emit('cancel')" class="me-2" />
      <div>
        <h1 class="text-subtitle-2 font-weight-bold mb-0">
          {{ title || (isEdit ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة') }}
        </h1>
        <div v-if="invoiceTotal > 0" class="text-xxs font-weight-bold text-primary mt-n1">
          الإجمالي: {{ formatCurrency(invoiceTotal) }}
        </div>
      </div>
    </div>
    <div class="d-flex gap-2 w-100 w-sm-auto justify-end">
      <AppButton variant="tonal" color="secondary" density="compact" @click="$emit('cancel')" :disabled="loading"> إلغاء </AppButton>
      <AppButton
        color="primary"
        prepend-icon="ri-save-line"
        density="compact"
        :loading="loading"
        @click="$emit('save')"
        :disabled="!canSubmit"
      >
        حفظ
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters';

defineProps({
  isEdit: Boolean,
  invoiceTotal: Number,
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
  backdrop-filter: blur(8px);
  background: rgba(var(--v-theme-surface), 0.9);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  /* margin-left: -24px;
  margin-right: -24px; */
}
</style>
