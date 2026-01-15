<template>
  <div class="product-variants-builder">
    <!-- Attributes Selector -->
    <div class="variants-setup-glass pa-6 rounded-xl border mb-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h3 class="text-h6 font-weight-black mb-1">بناء المتغيرات</h3>
          <p class="text-body-2 text-grey-darken-1">أضف سمات مثل (اللون، المقاس، الخامة) لتوليد تشكيلات المنتج</p>
        </div>
        <QuickAddAttribute @saved="handleAttributeSaved">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" prepend-icon="ri-add-line" variant="tonal" rounded="xl" v-bind="props"> إضافة سمة </v-btn>
          </template>
        </QuickAddAttribute>
      </div>

      <div v-for="(attr, index) in attributes" :key="index" class="attr-row-glass pa-4 rounded-lg mb-4 bg-white border">
        <v-row dense align="center">
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="attr.id"
              :items="availableAttributes"
              item-title="name"
              item-value="id"
              label="السمة"
              placeholder="اختر السمة..."
              variant="solo"
              flat
              density="comfortable"
              hide-details
              bg-color="grey-lighten-4"
              @update:model-value="handleAttributeSelect(index)"
            />
          </v-col>
          <v-col cols="12" md="7">
            <v-combobox
              v-model="attr.selectedValues"
              :items="attr.availableValues"
              item-title="name"
              label="القيم المختارة"
              multiple
              chips
              closable-chips
              variant="solo"
              flat
              density="comfortable"
              hide-details
              bg-color="grey-lighten-4"
              placeholder="مثال: أحمر، أخضر، XL..."
              @update:model-value="handleValueInput(index)"
            />
          </v-col>
          <v-col cols="12" md="2" class="text-end">
            <v-btn icon="ri-delete-bin-7-line" color="error" variant="text" @click="removeAttribute(index)" />
          </v-col>
        </v-row>
      </div>

      <div v-if="attributes.length > 0" class="text-center mt-6">
        <v-btn
          color="primary"
          size="large"
          class="px-8 font-weight-black"
          rounded="xl"
          prepend-icon="ri-magic-line"
          :loading="generating"
          @click="generateVariants"
        >
          توليد تشكيلات المتغيرات
        </v-btn>
      </div>
    </div>

    <!-- Variants Matrix -->
    <v-expand-transition>
      <div v-if="variants.length > 0" class="variants-matrix mt-8">
        <div class="d-flex align-center justify-space-between mb-4 px-2">
          <h4 class="text-subtitle-1 font-weight-black">تشكيلات المتغيرات المختارة ({{ variants.length }})</h4>
          <div class="d-flex gap-2">
            <v-btn size="small" variant="text" color="primary" prepend-icon="ri-edit-line">تعديل جماعي</v-btn>
          </div>
        </div>

        <div class="glass-table-wrapper rounded-xl border overflow-hidden">
          <v-table density="comfortable" class="premium-table">
            <thead>
              <tr class="bg-grey-lighten-5">
                <th class="text-right">المتغير</th>
                <th class="text-right">SKU</th>
                <th class="text-right">السعر الإضافي</th>
                <th class="text-right">الكمية</th>
                <th class="text-center">الحالة</th>
                <th class="text-center">حذف</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(variant, idx) in variants" :key="idx" class="variant-row">
                <td class="font-weight-bold">
                  <div class="d-flex align-center gap-2">
                    <v-avatar size="32" color="grey-lighten-4" class="rounded-lg">
                      <v-icon icon="ri-box-3-line" size="16" />
                    </v-avatar>
                    <span>{{ variant.label }}</span>
                  </div>
                </td>
                <td>
                  <v-text-field v-model="variant.sku" variant="plain" density="compact" hide-details class="sku-input" />
                </td>
                <td>
                  <v-text-field v-model.number="variant.price_modifier" prefix="+" variant="plain" density="compact" hide-details type="number" />
                </td>
                <td>
                  <v-text-field v-model.number="variant.stock" variant="plain" density="compact" hide-details type="number" />
                </td>
                <td class="text-center">
                  <v-switch v-model="variant.enabled" color="primary" hide-details density="compact" />
                </td>
                <td class="text-center">
                  <v-btn icon="ri-close-circle-line" size="x-small" color="grey" variant="text" @click="removeGeneratedVariant(idx)" />
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import QuickAddAttribute from './QuickAddAttribute.vue';
import attributeValueService from '@/api/services/attribute-value.service';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  availableAttributes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'refresh-attributes']);

const attributes = ref([]);
const variants = ref([...props.modelValue]);
const generating = ref(false);

const addAttribute = () => {
  attributes.value.push({
    id: null,
    selectedValues: [],
    availableValues: [],
  });
};

const removeAttribute = index => {
  attributes.value.splice(index, 1);
};

const handleAttributeSelect = index => {
  const attr = attributes.value[index];
  const found = props.availableAttributes.find(a => a.id === attr.id);
  if (found) {
    attr.availableValues = found.values || [];
  }
};

const handleValueInput = async index => {
  const attr = attributes.value[index];
  if (!attr.id) return;

  const lastValue = attr.selectedValues[attr.selectedValues.length - 1];

  // If the last value is a string, it's a new value that needs to be created
  if (typeof lastValue === 'string') {
    try {
      const response = await attributeValueService.create({
        attribute_id: attr.id,
        name: lastValue,
        active: 1,
      });

      if (response.status) {
        // Replace the string with the newly created object
        attr.selectedValues[attr.selectedValues.length - 1] = response.data[0];
        // Also add to available values to avoid duplicates
        attr.availableValues.push(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to create attribute value:', error);
      // Remove the failed value
      attr.selectedValues.pop();
    }
  }
};

const generateVariants = () => {
  generating.value = true;
  // Simple Cartesian Product Algorithm
  const combinations = attributes.value.reduce((acc, attr) => {
    if (attr.selectedValues.length === 0) return acc;
    const newAcc = [];
    attr.selectedValues.forEach(val => {
      if (acc.length === 0) {
        newAcc.push({
          label: val.name || val,
          values: [val],
        });
      } else {
        acc.forEach(combo => {
          newAcc.push({
            label: `${combo.label} / ${val.name || val}`,
            values: [...combo.values, val],
          });
        });
      }
    });
    return newAcc;
  }, []);

  variants.value = combinations.map(combo => ({
    label: combo.label,
    values: combo.values,
    sku: '',
    price_modifier: 0,
    stock: 0,
    enabled: true,
  }));

  generating.value = false;
  emit('update:modelValue', variants.value);
};

const removeGeneratedVariant = index => {
  variants.value.splice(index, 1);
  emit('update:modelValue', variants.value);
};

const handleAttributeSaved = attribute => {
  emit('refresh-attributes');
  // Add a new row with the newly created attribute
  attributes.value.push({
    id: attribute.id,
    selectedValues: [],
    availableValues: attribute.values || [],
  });
};
</script>

<style scoped>
.variants-setup-glass {
  background: white;
  border-color: #f1f5f9 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.attr-row-glass {
  transition: all 0.3s ease;
}

.attr-row-glass:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.glass-table-wrapper {
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.premium-table :deep(th) {
  font-weight: 800 !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.75rem;
  color: #64748b;
}

.variant-row {
  transition: background-color 0.2s;
}

.variant-row:hover {
  background-color: #f8fafc;
}

.sku-input :deep(.v-field__input) {
  font-family: monospace;
  font-size: 0.85rem;
}
</style>
