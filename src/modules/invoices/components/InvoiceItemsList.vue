<template>
  <v-card class="rounded-md border-dashed mb-2">
    <v-card-item class="py-4 px-6 border-bottom" prepend-icon="ri-list-settings-line">
      <template #title>
        <span class="font-weight-bold">أصناف الفاتورة</span>
      </template>
      <template #append>
        <div style="min-width: 300px; max-width: 450px" class="ms-4">
          <ProductSelector
            @add="$emit('add', $event)"
            @create-product="$emit('create-product')"
            :warehouse-id="warehouseId"
            :invoice-type="invoiceType"
            :customer-type="customerType"
          />
        </div>
      </template>
    </v-card-item>

    <v-card-text class="pa-0">
      <!-- Items List (Desktop) -->
      <div class="w-100 d-none d-md-block">
        <v-table class="items-table">
          <thead>
            <tr class="bg-grey-lighten-4">
              <th class="text-right" style="width: fit-content">الصنف</th>
              <th class="text-center" style="width: fit-content">الكمية</th>
              <th class="text-center" style="width: fit-content">سعر الوحدة</th>
              <th class="text-center" style="width: fit-content">الخصم</th>
              <th class="text-left pe-6" style="width: fit-content">الإجمالي</th>
              <th style="width: 50px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td class="ps-6 py-2">
                <v-list-item class="pa-0">
                  <template #prepend>
                    <AppAvatar :img-url="item.primary_image_url" :name="item.name" size="40" rounded="md" class="me-3 border" />
                  </template>

                  <v-list-item-title class="font-weight-bold">{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle v-if="item.variant_name" class="d-flex align-center gap-1">
                    <span>{{ item.variant_name }}</span>
                    <span v-if="item.attributes_text" class="text-grey-lighten-1">•</span>
                    <span v-if="item.attributes_text" class="text-primary font-weight-medium">{{ item.attributes_text }}</span>
                  </v-list-item-subtitle>

                  <!-- Stock Warning -->
                  <template #append-inner v-if="item.requires_stock && item.quantity > (item.max_quantity || 0)">
                    <div class="text-caption text-error font-weight-bold ms-2">
                      <v-icon icon="ri-error-warning-line" size="14" class="me-1" />
                      المتوفر: {{ item.max_quantity || 0 }}
                    </div>
                  </template>

                  <div
                    v-if="item.requires_stock && item.quantity > (item.max_quantity || 0)"
                    class="text-caption text-error font-weight-bold mt-1 d-md-none"
                  >
                    <v-icon icon="ri-error-warning-line" size="14" class="me-1" />
                    الكمية المطلوبة أكبر من المتوفر ({{ item.max_quantity || 0 }})
                  </div>

                  <!-- Product Type Badge -->
                  <div v-if="item.product_type && item.product_type !== 'physical'" class="mt-1">
                    <v-chip size="x-small" :color="item.product_type === 'digital' ? 'info' : 'secondary'" variant="tonal" label density="compact">
                      {{ item.product_type === 'digital' ? 'منتج رقمي' : 'خدمة' }}
                    </v-chip>
                  </div>
                </v-list-item>
                <!-- Stock Warning (fallback for table cell space) -->
                <div v-if="item.requires_stock && item.quantity > (item.max_quantity || 0)" class="text-caption text-error font-weight-bold mt-1">
                  <v-icon icon="ri-error-warning-line" size="14" class="me-1" />
                  تجاوز المخزون ({{ item.max_quantity || 0 }})
                </div>
              </td>
              <td class="text-center px-2">
                <div class="d-flex justify-center position-relative">
                  <AppInput
                    :model-value="item.quantity"
                    type="number"
                    density="compact"
                    style="width: fit-content"
                    hide-details
                    min="1"
                    class="centered-input"
                    :class="{ 'flash-error': isItemError(item) }"
                    @update:model-value="val => updateQuantity(item, val)"
                  />
                  <v-tooltip :model-value="isItemError(item)" location="top" activator="parent" content-class="bg-error text-white font-weight-bold">
                    الكمية المتاحة: {{ item.max_quantity }}
                  </v-tooltip>
                </div>
              </td>
              <td class="text-center px-2">
                <div class="d-flex justify-center">
                  <AppInput
                    v-model.number="item.unit_price"
                    type="number"
                    density="compact"
                    hide-details
                    style="width: fit-content"
                    class="centered-input"
                    @update:model-value="$emit('calculate', item)"
                  />
                </div>
              </td>
              <td class="text-center px-2">
                <div class="d-flex justify-center">
                  <AppInput
                    v-model.number="item.discount"
                    type="number"
                    density="compact"
                    hide-details
                    style="width: fit-content"
                    class="centered-input"
                    @update:model-value="$emit('calculate', item)"
                  />
                </div>
              </td>
              <td class="text-left pe-6 font-weight-bold text-primary">
                {{ formatCurrency(item.total) }}
              </td>
              <td class="pe-4">
                <AppButton icon="ri-delete-bin-line" variant="text" color="error" density="comfortable" @click="$emit('remove', index)" />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Mobile view -->
      <div class="d-md-none pa-4">
        <v-card v-for="(item, index) in items" :key="'mob-' + index" variant="flat" border class="mobile-item-card pa-3 mb-3 bg-white">
          <v-card-item class="pa-0 mb-3" prepend-icon="ri-shopping-bag-line">
            <template #prepend>
              <AppAvatar :img-url="item.primary_image_url" :name="item.name" size="48" rounded="md" class="me-2 border" />
            </template>
            <v-card-title class="text-body-2 font-weight-bold ps-0">{{ item.name }}</v-card-title>
            <v-card-subtitle v-if="item.variant_name" class="ps-0">{{ item.variant_name }}</v-card-subtitle>
            <template #append>
              <AppButton icon="ri-delete-bin-line" variant="text" color="error" density="compact" @click="$emit('remove', index)" />
            </template>
          </v-card-item>

          <v-row dense align="center">
            <v-col cols="12" sm="6">
              <div class="d-flex align-center gap-2">
                <v-btn
                  icon="ri-subtract-line"
                  size="small"
                  variant="tonal"
                  color="primary"
                  :disabled="item.quantity <= 0.01"
                  @click="updateQuantity(item, (item.quantity || 0) - 1)"
                />
                <div class="flex-grow-1 position-relative">
                  <AppInput
                    :model-value="item.quantity"
                    label="الكمية"
                    type="number"
                    density="compact"
                    hide-details
                    class="compact-input text-center w-100"
                    :class="{ 'flash-error': isItemError(item) }"
                    @update:model-value="val => updateQuantity(item, val)"
                  />
                  <v-tooltip :model-value="isItemError(item)" location="top" activator="parent" content-class="bg-error text-white font-weight-bold">
                    الكمية المتاحة: {{ item.max_quantity }}
                  </v-tooltip>
                </div>
                <v-btn icon="ri-add-line" size="small" variant="tonal" color="primary" @click="updateQuantity(item, (item.quantity || 0) + 1)" />
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <AppInput
                v-model.number="item.unit_price"
                label="السعر"
                type="number"
                density="compact"
                hide-details
                class="compact-input"
                @update:model-value="$emit('calculate', item)"
              />
            </v-col>
            <v-col cols="6" sm="3">
              <AppInput
                v-model.number="item.discount"
                label="الخصم"
                type="number"
                density="compact"
                hide-details
                class="compact-input"
                @update:model-value="$emit('calculate', item)"
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-space-between align-center mt-3 pt-2 border-top">
            <span class="text-caption font-weight-bold">الإجمالي:</span>
            <span class="text-primary font-weight-bold">{{ formatCurrency(item.total) }}</span>
          </div>

          <!-- Mobile Stock Warning -->
          <v-alert
            v-if="item.requires_stock && item.quantity > (item.max_quantity || 0)"
            type="error"
            density="compact"
            variant="tonal"
            class="mt-2 py-1 text-caption font-weight-bold"
            icon="ri-error-warning-line"
          >
            تجاوز المخزون ({{ item.max_quantity || 0 }})
          </v-alert>
        </v-card>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-if="items.length === 0"
        icon="ri-shopping-cart-2-line"
        icon-size="64"
        title="لا توجد أصناف في الفاتورة"
        message="ابدأ بالبحث عن منتجات لإضافتها للفاتورة"
        class="border-top"
      />
    </v-card-text>

    <!-- Installment Section -->
    <v-divider v-if="showInstallmentSection" />
    <v-card-text v-if="showInstallmentSection" class="pa-0">
      <slot name="installment"></slot>
    </v-card-text>
  </v-card>
</template>

<script setup>
import ProductSelector from './ProductSelector.vue';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  taxInclusive: {
    type: Boolean,
    default: false,
  },
  warehouseId: {
    type: [Number, String],
    default: null,
  },
  invoiceType: {
    type: String,
    default: 'sales',
  },
  customerType: {
    type: String,
    default: 'retail',
  },
  showInstallmentSection: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:taxInclusive', 'add', 'calculate', 'remove', 'create-product']);

import { nextTick, ref } from 'vue';

const stockErrorItems = ref(new Set());

const isItemError = item => stockErrorItems.value.has(item);

const updateQuantity = (item, val) => {
  let newVal = parseFloat(val);
  if (isNaN(newVal) || newVal < 0.01) newVal = 0.01;

  if (item.requires_stock && typeof item.max_quantity === 'number') {
    if (newVal > item.max_quantity) {
      const maxQty = item.max_quantity;

      // Trigger Visual Flash Effect & Tooltip
      stockErrorItems.value.add(item);
      setTimeout(() => {
        stockErrorItems.value.delete(item);
      }, 1000);

      // Force Reset to Max (Snapback)
      if (item.quantity === maxQty) {
        if (newVal !== maxQty) item.quantity = newVal; // Temporarily set to invalid
        nextTick(() => {
          item.quantity = maxQty;
          emit('calculate', item);
        });
        return;
      }

      newVal = maxQty;
    }
  }

  item.quantity = newVal;
  emit('calculate', item);
};
</script>

<style scoped>
.border-dashed {
  border-style: dashed !important;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.items-table :deep(th) {
  font-weight: bold !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.centered-input :deep(input) {
  text-align: center;
}

.compact-input :deep(input) {
  text-align: center;
  font-size: 0.875rem;
}

.border-top {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

.mobile-item-card {
  transition: all 0.2s ease;
}

.mobile-item-card:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
}

/* Flash Error Animation */
@keyframes flash-red {
  0% {
    transform: scale(1);
    background-color: transparent;
  }
  50% {
    transform: scale(1.05);
    background-color: rgba(var(--v-theme-error), 0.15);
    border-color: rgb(var(--v-theme-error)) !important;
  }
  100% {
    transform: scale(1);
    background-color: transparent;
  }
}

:deep(.flash-error) .v-field {
  animation: flash-red 0.4s ease-in-out;
  border-color: rgb(var(--v-theme-error)) !important;
}

:deep(.flash-error) input {
  color: rgb(var(--v-theme-error)) !important;
  font-weight: bold;
}
</style>
