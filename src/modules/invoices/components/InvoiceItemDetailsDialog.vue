<template>
  <v-dialog
    :model-value="!!item"
    :fullscreen="isPhone"
    max-width="620"
    scrollable
    content-class="invoice-item-details-dialog"
    @update:model-value="!$event && requestClose()"
  >
    <v-card v-if="draft" class="item-details-card" :style="isPhone ? { height: `${viewportHeight}px` } : {}">
      <v-toolbar color="surface" density="comfortable"
        ><v-btn icon="ri-close-line" aria-label="إغلاق تفاصيل الصنف" @click="requestClose" /><v-toolbar-title
          >تفاصيل الصنف</v-toolbar-title
        ></v-toolbar
      >
      <v-card-text class="item-details-content"
        ><h2 class="text-h6 mb-2">{{ draft.name }}</h2>
        <p v-if="draft.attributes_text" class="text-body-2 mb-4">{{ draft.attributes_text }}</p>
        <v-select
          v-if="draft.allowed_units?.length > 1"
          v-model="draft.unit_id"
          :items="draft.allowed_units"
          item-title="name"
          item-value="id"
          label="الوحدة"
          @update:model-value="value => $emit('unit-change', draft, value)"
        />
        <p v-else class="mb-4 text-body-2">الوحدة: {{ draft.allowed_units?.[0]?.name || (draft.product_type === 'service' ? 'خدمة' : 'قطعة') }}</p>
        <AppInput
          v-model.number="draft.quantity"
          label="الكمية"
          type="number"
          inputmode="decimal"
          :step="draft.allow_decimal_quantities ? 10 ** -(draft.quantity_precision || 2) : 1"
        />
        <AppInput v-model.number="draft.unit_price" label="سعر الوحدة" type="number" inputmode="decimal" min="0" />
        <AppInput v-model.number="draft.discount" label="خصم الصنف" type="number" inputmode="decimal" min="0" />
        <p v-if="invoiceType === 'purchase'" class="mb-3 text-success">سعر البيع للوحدة: {{ formatCurrency(sellingPrice(draft)) }}</p>
        <dl class="item-identifiers">
          <template v-if="draft.sku"
            ><dt>SKU</dt>
            <dd dir="ltr">{{ draft.sku }}</dd></template
          ><template v-if="draft.barcode"
            ><dt>الباركود</dt>
            <dd dir="ltr">{{ draft.barcode }}</dd></template
          >
        </dl>
        <p class="text-caption text-medium-emphasis my-3">ضريبة الفاتورة وملاحظاتها العامة متاحة في «الدفع والحسابات».</p>
        <div class="details-total">
          <span>إجمالي الصنف</span><strong>{{ formatCurrency(total) }}</strong>
        </div>
        <v-alert v-if="error || externalError" type="error" variant="tonal" class="mt-3">{{ error || externalError }}</v-alert>
      </v-card-text>
      <v-card-actions class="item-details-actions"
        ><v-spacer /><v-btn @click="requestClose">إلغاء</v-btn><v-btn color="primary" variant="flat" @click="apply">تطبيق</v-btn></v-card-actions
      >
    </v-card>
  </v-dialog>
  <v-dialog v-model="discardOpen" max-width="420"
    ><v-card title="تجاهل تعديلات الصنف؟"
      ><v-card-text>لم تُطبق التعديلات على الفاتورة بعد.</v-card-text
      ><v-card-actions
        ><v-spacer /><v-btn @click="discardOpen = false">العودة للتفاصيل</v-btn
        ><v-btn
          color="error"
          @click="
            discardOpen = false;
            $emit('close');
          "
          >تجاهل</v-btn
        ></v-card-actions
      ></v-card
    ></v-dialog
  >
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { formatCurrency } from '@/utils/formatters';
const props = defineProps({
  item: Object,
  isPhone: Boolean,
  viewportHeight: Number,
  invoiceType: String,
  sellingPrice: Function,
  externalError: String,
});
const emit = defineEmits(['close', 'apply', 'unit-change']);
const draft = ref(null),
  error = ref(''),
  discardOpen = ref(false);
let initial = '';
watch(
  () => props.item,
  item => {
    draft.value = item ? JSON.parse(JSON.stringify(item)) : null;
    initial = JSON.stringify(draft.value);
    error.value = '';
    discardOpen.value = false;
  },
  { immediate: true }
);
const total = computed(() => Number(draft.value?.quantity || 0) * Number(draft.value?.unit_price || 0) - Number(draft.value?.discount || 0));
function requestClose() {
  if (JSON.stringify(draft.value) !== initial) discardOpen.value = true;
  else emit('close');
}
function apply() {
  error.value = '';
  if (!Number.isFinite(Number(draft.value.quantity)) || Number(draft.value.quantity) <= 0) {
    error.value = 'أدخل كمية موجبة صحيحة.';
    return;
  }
  if ([draft.value.unit_price, draft.value.discount].some(v => !Number.isFinite(Number(v)) || Number(v) < 0)) {
    error.value = 'أدخل سعرًا وخصمًا صالحين لا يقلان عن صفر.';
    return;
  }
  emit('apply', draft.value);
}
</script>
<style scoped>
.item-details-card {
  display: flex;
  flex-direction: column;
  max-height: 90dvh;
}
.item-details-content {
  overflow: auto;
  overscroll-behavior: contain;
}
.item-details-actions {
  flex-shrink: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(var(--v-border-color), 0.15);
}
.details-total {
  display: flex;
  justify-content: space-between;
  background: rgba(var(--v-theme-primary), 0.07);
  padding: 14px;
  border-radius: 10px;
}
.item-identifiers {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  font-size: 13px;
}
.item-identifiers dd {
  margin: 0;
  overflow-wrap: anywhere;
}
@media (max-width: 599.98px) {
  .item-details-card {
    max-height: 100dvh;
  }
  .item-details-actions .v-btn {
    min-height: 48px;
  }
}
</style>
