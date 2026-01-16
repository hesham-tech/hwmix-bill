<template>
  <div class="variant-manager">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6">المتغيرات (الأحجام، الألوان، إلخ)</h3>
      <v-btn color="secondary" variant="tonal" prepend-icon="ri-add-line" @click="addVariant"> إضافة متغير جديد </v-btn>
    </div>

    <v-expansion-panels v-model="activePanel" multiple>
      <v-expansion-panel v-for="(variant, vIndex) in modelValue" :key="vIndex" class="mb-2 border rounded">
        <v-expansion-panel-title>
          <div class="d-flex align-center gap-3 w-100">
            <span class="font-weight-bold">متغير #{{ vIndex + 1 }}</span>
            <v-chip size="x-small" label color="primary" v-if="variant.sku">
              {{ variant.sku }}
            </v-chip>
            <v-spacer />
            <span class="text-subtitle-2 me-4"> السعر: {{ variant.retail_price || 0 }} ج.م </span>
            <v-btn icon="ri-file-copy-line" size="x-small" variant="text" color="primary" class="me-1" @click.stop="duplicateVariant(vIndex)" />
            <v-btn icon="ri-delete-bin-line" size="x-small" variant="text" color="error" @click.stop="removeVariant(vIndex)" />
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" md="3">
              <AppInput v-model="variant.sku" label="SKU" />
            </v-col>
            <v-col cols="12" md="3">
              <AppInput v-model="variant.barcode" label="الباركود" />
            </v-col>
            <v-col cols="12" md="2">
              <AppInput v-model.number="variant.purchase_price" label="سعر الشراء" type="number" prefix="ج.م" />
            </v-col>
            <v-col cols="12" md="2">
              <AppInput v-model.number="variant.wholesale_price" label="سعر الجملة" type="number" prefix="ج.م" />
            </v-col>
            <v-col cols="12" md="2">
              <AppInput v-model.number="variant.retail_price" label="سعر القطاعي" type="number" required prefix="ج.م" />
            </v-col>

            <!-- Attributes handling -->
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-2 font-weight-bold">المواصفات (اللون، المقاس، إلخ)</span>
                <v-btn size="x-small" variant="text" color="secondary" prepend-icon="ri-add-line" @click="addAttribute(vIndex)"> إضافة خاصية </v-btn>
              </div>

              <div v-for="(attr, aIndex) in variant.attributes" :key="aIndex" class="attr-row d-flex gap-2 pa-2 border rounded mb-2 align-center">
                <AppAutocomplete
                  v-model="attr.attribute_id"
                  label="الخاصية"
                  api-endpoint="attributes"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  class="flex-grow-1"
                  can-create
                />
                <AppAutocomplete
                  v-if="attr.attribute_id"
                  v-model="attr.attribute_value_id"
                  label="القيمة"
                  :api-endpoint="`attribute-values?attribute_id=${attr.attribute_id}`"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  class="flex-grow-1"
                  can-create
                  create-field="name"
                />
                <v-btn icon="ri-close-line" size="x-small" variant="text" color="error" @click="removeAttribute(vIndex, aIndex)" />
              </div>
            </v-col>

            <!-- Stock Management for this variant -->
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-2 font-weight-bold">توزيع المخزون</span>
                <v-btn size="x-small" variant="text" color="primary" prepend-icon="ri-add-line" @click="addStock(vIndex)"> إضافة مستودع </v-btn>
              </div>

              <div
                v-for="(stock, sIndex) in variant.stocks"
                :key="sIndex"
                class="stock-row d-flex gap-2 pa-2 bg-grey-lighten-4 rounded mb-2 align-center"
              >
                <AppAutocomplete
                  v-model="stock.warehouse_id"
                  label="المستودع"
                  api-endpoint="warehouses"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  class="flex-grow-1"
                />
                <AppInput v-model.number="stock.quantity" label="الكمية" type="number" density="compact" style="max-width: 120px" />
                <v-btn icon="ri-close-line" size="x-small" variant="text" color="error" @click="removeStock(vIndex, sIndex)" />
              </div>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import { useProductStore } from '../store/product.store';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const productStore = useProductStore();
const activePanel = ref([0]);

const addVariant = async () => {
  const newVariants = [...props.modelValue];
  const lastVariant = newVariants.length > 0 ? newVariants[newVariants.length - 1] : null;

  if (lastVariant) {
    // Clone logic: Copy prices, attributes, and warehouse structure
    newVariants.push({
      purchase_price: lastVariant.purchase_price,
      wholesale_price: lastVariant.wholesale_price,
      retail_price: lastVariant.retail_price,
      sku: '',
      barcode: '',
      stocks: lastVariant.stocks.map(s => ({ warehouse_id: s.warehouse_id, quantity: 0 })),
      attributes: lastVariant.attributes ? lastVariant.attributes.map(a => ({ ...a })) : [],
    });
  } else {
    // Default logic for very first variant
    const warehouseId = await productStore.fetchDefaultWarehouse();
    newVariants.push({
      purchase_price: 0,
      wholesale_price: 0,
      retail_price: 0,
      sku: '',
      barcode: '',
      stocks: [{ warehouse_id: warehouseId, quantity: 0 }],
      attributes: [],
    });
  }

  emit('update:modelValue', newVariants);
  activePanel.value = [newVariants.length - 1];
};

const duplicateVariant = index => {
  const newVariants = [...props.modelValue];
  const source = newVariants[index];

  const clone = {
    ...JSON.parse(JSON.stringify(source)),
    id: undefined, // Ensure ID is removed
    sku: '',
    barcode: '',
    stocks: source.stocks.map(s => ({ ...s, quantity: 0, id: undefined })),
  };

  newVariants.splice(index + 1, 0, clone);
  emit('update:modelValue', newVariants);
  activePanel.value = [index + 1];
};

const removeVariant = index => {
  if (props.modelValue.length === 1) return; // Keep at least one
  const newVariants = [...props.modelValue];
  newVariants.splice(index, 1);
  emit('update:modelValue', newVariants);
};

const addStock = async vIndex => {
  const newVariants = [...props.modelValue];
  const warehouseId = await productStore.fetchDefaultWarehouse();
  newVariants[vIndex].stocks.push({ warehouse_id: warehouseId, quantity: 0 });
  emit('update:modelValue', newVariants);
};

const removeStock = (vIndex, sIndex) => {
  const newVariants = [...props.modelValue];
  newVariants[vIndex].stocks.splice(sIndex, 1);
  emit('update:modelValue', newVariants);
};

const addAttribute = vIndex => {
  const newVariants = [...props.modelValue];
  if (!newVariants[vIndex].attributes) newVariants[vIndex].attributes = [];
  newVariants[vIndex].attributes.push({ attribute_id: null, attribute_value_id: null });
  emit('update:modelValue', newVariants);
};

const removeAttribute = (vIndex, aIndex) => {
  const newVariants = [...props.modelValue];
  newVariants[vIndex].attributes.splice(aIndex, 1);
  emit('update:modelValue', newVariants);
};
</script>

<style scoped>
.gap-3 {
  gap: 0.75rem;
}
.gap-2 {
  gap: 0.5rem;
}
.border {
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
