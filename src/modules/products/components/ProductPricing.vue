<template>
  <div class="product-pricing-inventory">
    <v-row>
      <!-- Pricing Section -->
      <v-col cols="12" md="6">
        <v-card variant="flat" class="pa-4 pa-md-6 rounded-xl border bg-white h-100">
          <div class="d-flex align-center gap-3 mb-6">
            <v-avatar color="primary-lighten-5" rounded="lg">
              <v-icon icon="ri-money-dollar-circle-line" color="primary" />
            </v-avatar>
            <h3 class="text-subtitle-1 font-weight-black">إعدادات التسعير</h3>
          </div>

          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="localData.retail_price"
                label="سعر البيع (قطاعي)"
                prefix="ج.م"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                class="premium-input-field"
                type="number"
                persistent-placeholder
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="localData.wholesale_price"
                label="سعر البيع (جمله)"
                prefix="ج.م"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                class="premium-input-field"
                type="number"
                persistent-placeholder
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model.number="localData.tax"
                label="الضريبة المفروضة"
                suffix="%"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                class="premium-input-field"
                type="number"
                persistent-placeholder
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Inventory Section -->
      <v-col cols="12" md="6">
        <v-card variant="flat" class="pa-4 pa-md-6 rounded-xl border bg-white h-100">
          <div class="d-flex align-center gap-3 mb-6">
            <v-avatar color="warning-lighten-5" rounded="lg">
              <v-icon icon="ri-home-gear-line" color="warning" />
            </v-avatar>
            <h3 class="text-subtitle-1 font-weight-black">المخزون واللوجستيات</h3>
          </div>

          <v-row dense>
            <v-col cols="12">
              <v-autocomplete
                v-model="localData.warehouse_id"
                :items="warehouses"
                item-title="name"
                item-value="id"
                label="المخزن الافتراضي"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                class="premium-input-field"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="localData.min_quantity"
                label="الحد الأدنى"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                class="premium-input-field"
                type="number"
                hint="تنبيه عند نقص الكمية"
                container-class="pb-0"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="localData.weight"
                label="الوزن (كجم)"
                variant="solo"
                flat
                bg-color="grey-lighten-5"
                class="premium-input-field"
                type="number"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  warehouses: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const localData = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});
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
</style>
