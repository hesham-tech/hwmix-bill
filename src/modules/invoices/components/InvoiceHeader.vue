<template>
  <div class="sticky-header d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between px-4 px-sm-6 py-3 mb-6 gap-3">
    <div class="d-flex align-center">
      <AppButton icon="ri-arrow-right-line" variant="text" color="secondary" @click="$emit('cancel')" class="me-2 me-sm-4" />
      <div>
        <h1 class="text-subtitle-1 text-sm-h5 font-weight-bold mb-0">
          {{ isEdit ? 'تعديل الفاتورة' : 'إنشاء فاتورة جديدة' }}
        </h1>
        <div v-if="invoiceTotal > 0" class="text-caption text-sm-h6 font-weight-bold text-primary mt-0 mt-sm-1">
          الإجمالي: {{ formatCurrency(invoiceTotal) }}
        </div>
      </div>
    </div>
    <div class="d-flex gap-2 w-100 w-sm-auto justify-end">
      <AppButton variant="tonal" color="secondary" @click="$emit('cancel')" :disabled="loading" class="flex-grow-1 flex-sm-grow-0"> إلغاء </AppButton>
      <AppButton
        color="primary"
        prepend-icon="ri-save-line"
        :loading="loading"
        @click="$emit('save')"
        :disabled="!canSubmit"
        class="flex-grow-1 flex-sm-grow-0"
      >
        حفظ
      </AppButton>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isEdit: Boolean,
  invoiceTotal: Number,
  loading: Boolean,
  canSubmit: Boolean,
});

defineEmits(['save', 'cancel']);

const formatCurrency = amount => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount || 0);
};
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
