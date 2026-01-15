<template>
  <div class="product-general-info">
    <v-card variant="flat" class="pa-4 pa-md-6 rounded-xl border bg-white mb-6">
      <div class="d-flex align-center gap-3 mb-6">
        <v-avatar color="info-lighten-5" rounded="lg">
          <v-icon icon="ri-information-line" color="info" />
        </v-avatar>
        <h3 class="text-subtitle-1 font-weight-black">المعلومات الأساسية</h3>
      </div>

      <v-row dense>
        <v-col cols="12">
          <v-text-field
            :model-value="localData.name"
            @update:model-value="val => updateValue('name', val)"
            label="اسم المنتج"
            placeholder="مثال: آيفون 15 برو ماكس"
            variant="solo"
            flat
            bg-color="grey-lighten-5"
            class="premium-input-field"
            :rules="[v => !!v || 'اسم المنتج مطلوب']"
            persistent-placeholder
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            :model-value="localData.sku"
            @update:model-value="val => updateValue('sku', val)"
            label="SKU (كود المنتج)"
            placeholder="اتركه فارغاً للتوليد التلقائي"
            variant="solo"
            flat
            bg-color="grey-lighten-5"
            class="premium-input-field"
            persistent-placeholder
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            :model-value="localData.barcode"
            @update:model-value="val => updateValue('barcode', val)"
            label="الباركود (Barcode)"
            placeholder="رقم الباركود العالمي"
            variant="solo"
            flat
            bg-color="grey-lighten-5"
            class="premium-input-field"
            persistent-placeholder
          />
        </v-col>

        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-2 px-1">
            <span class="text-subtitle-2 font-weight-bold">وصف المنتج</span>
            <v-chip size="x-small" color="grey" variant="tonal">يدعم التنسيق الغني</v-chip>
          </div>
          <v-textarea
            :model-value="localData.desc"
            @update:model-value="val => updateValue('desc', val)"
            placeholder="اكتب وصفاً جذاباً للمنتج..."
            variant="solo"
            flat
            bg-color="grey-lighten-5"
            class="premium-input-field"
            rows="4"
            auto-grow
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

// ProductGeneral acts as a controlled component,
// its v-model (localData) is linked to the parent's localData.
const localData = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const updateValue = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  });
};
</script>

<style scoped>
.premium-input-field :deep(.v-field) {
  border-radius: 12px !important;
  border: 1px solid #f1f5f9 !important;
}

.premium-input-field :deep(.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 4px 6px -1px rgba(var(--v-theme-primary), 0.1) !important;
}

.border-dashed {
  border-style: dashed !important;
  border-width: 1.5px !important;
}
</style>
