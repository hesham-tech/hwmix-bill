<template>
  <AppDialog
    v-model="isOpen"
    :title="warehouse ? `تفاصيل جرد المخزن: ${warehouse.name}` : 'تفاصيل جرد المخزن'"
    icon="ri-archive-line"
    max-width="1100"
    @close="close"
  >
    <div v-if="warehouse" class="pa-4">
      <!-- Stats Cards -->
      <v-row dense class="mb-4">
        <v-col cols="6" sm="4" md="2" v-for="stat in stats" :key="stat.title">
          <v-card variant="tonal" :color="stat.color" class="pa-3 rounded-lg text-center h-100 border">
            <div class="text-caption text-grey-darken-1 mb-1 d-flex align-center justify-center">
              <v-icon :icon="stat.icon" size="14" class="me-1" />
              {{ stat.title }}
            </div>
            <div class="text-h6 font-weight-bold" :class="stat.valueClass">
              {{ stat.value }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Search bar & actions -->
      <div class="d-flex align-center mb-4">
        <AppInput
          v-model="search"
          label="البحث عن منتج، SKU، باركود، أو دفعة..."
          prepend-inner-icon="ri-search-line"
          class="max-width-400 flex-grow-1"
          hide-details
          clearable
        />
        <v-spacer />
      </div>

      <!-- Inventory Table -->
      <div class="border rounded-lg overflow-hidden">
        <v-table fixed-header height="450px" hover density="comfortable">
          <thead class="bg-grey-lighten-4">
            <tr>
              <th class="text-right font-weight-bold text-slate-800">المنتج / الصنف</th>
              <th class="text-center font-weight-bold text-slate-800">الباركود / SKU</th>
              <th class="text-center font-weight-bold text-slate-800">الدفعة (Batch)</th>
              <th class="text-center font-weight-bold text-slate-800">تاريخ الصلاحية</th>
              <th class="text-center font-weight-bold text-slate-800">الموقع الداخلي</th>
              <th class="text-left font-weight-bold text-slate-800">التكلفة</th>
              <th class="text-left font-weight-bold text-slate-800">سعر الجملة</th>
              <th class="text-left font-weight-bold text-slate-800">سعر القطاعي</th>
              <th class="text-center font-weight-bold text-slate-800">الكمية المتوفرة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stock in filteredStocks" :key="stock.id" :class="{ 'bg-error-lighten-5': isExpired(stock.expiry) }">
              <!-- المنتج -->
              <td class="py-2">
                <div class="font-weight-bold text-body-2 text-slate-800">
                  {{ stock.variant?.product_name || 'منتج غير محدد' }}
                </div>
                <div class="text-caption text-grey d-flex align-center mt-1">
                  <span v-if="stock.variant?.sku" class="me-2">{{ stock.variant.sku }}</span>
                </div>
              </td>

              <!-- الباركود / SKU -->
              <td class="text-center py-2 text-caption">
                <div>{{ stock.variant?.barcode || '-' }}</div>
              </td>

              <!-- :الدفعة -->
              <td class="text-center py-2">
                <v-chip size="x-small" variant="outlined" color="primary" class="font-weight-bold">
                  {{ stock.batch || '-' }}
                </v-chip>
              </td>

              <!-- تاريخ الصلاحية -->
              <td class="text-center py-2">
                <div v-if="stock.expiry" class="d-flex flex-column align-center">
                  <v-chip :color="getExpiryColor(stock.expiry)" size="x-small" variant="flat" class="font-weight-bold">
                    {{ formatDate(stock.expiry) }}
                  </v-chip>
                  <span v-if="isExpired(stock.expiry)" class="text-error font-weight-bold mt-1" style="font-size: 10px;">
                    منتهي الصلاحية
                  </span>
                  <span v-else-if="isExpiringSoon(stock.expiry)" class="text-info font-weight-bold mt-1" style="font-size: 10px;">
                    ينتهي قريباً
                  </span>
                </div>
                <span v-else class="text-grey-lighten-1">-</span>
              </td>

              <!-- الموقع الداخلي -->
              <td class="text-center py-2 text-body-2">
                {{ stock.loc || '-' }}
              </td>

              <!-- التكلفة -->
              <td class="text-left py-2 font-weight-medium">
                {{ formatCurrency(stock.cost || stock.variant?.purchase_price) }}
              </td>

              <!-- سعر الجملة -->
              <td class="text-left py-2 font-weight-medium text-success-darken-1">
                {{ formatCurrency(stock.variant?.wholesale_price) }}
              </td>

              <!-- سعر القطاعي -->
              <td class="text-left py-2 font-weight-medium text-primary">
                {{ formatCurrency(stock.variant?.retail_price) }}
              </td>

              <!-- الكمية المتوفرة -->
              <td class="text-center py-2">
                <div class="d-flex align-center justify-center">
                  <span class="font-weight-black text-body-1 me-2">{{ formatNumber(stock.quantity, 0) }}</span>
                  <v-tooltip v-if="isLowStock(stock)" text="وصل أو تجاوز حد الطلب الأدنى">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" icon="ri-alert-fill" color="warning" size="16" />
                    </template>
                  </v-tooltip>
                </div>
                <div class="text-caption text-grey" style="font-size: 10px;" v-if="getMinQty(stock) > 0">
                  الحد الأدنى: {{ getMinQty(stock) }}
                </div>
              </td>
            </tr>

            <tr v-if="filteredStocks.length === 0">
              <td colspan="9" class="text-center py-8">
                <EmptyState
                  icon="ri-archive-line"
                  title="لا توجد نتائج بحث"
                  message="لم نجد أي بضائع مطابقة لبحثك في هذا المستودع."
                  class="bg-transparent"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import dayjs from 'dayjs';

const props = defineProps({
  modelValue: Boolean,
  warehouse: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const search = ref('');

// Expiry helpers
const isExpired = date => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
};

const isExpiringSoon = date => {
  if (!date) return false;
  const expiry = dayjs(date);
  return expiry.isAfter(dayjs()) && expiry.isBefore(dayjs().add(30, 'day'));
};

const getExpiryColor = date => {
  if (isExpired(date)) return 'error';
  if (isExpiringSoon(date)) return 'info';
  return 'grey-lighten-3';
};

// Stock warnings
const getMinQty = stock => {
  return stock.min_quantity ?? (stock.variant?.min_quantity ?? 0);
};

const isLowStock = stock => {
  const minQty = getMinQty(stock);
  return minQty > 0 && stock.quantity <= minQty;
};

// Computed stats
const stats = computed(() => {
  if (!props.warehouse) return [];
  return [
    {
      title: 'إجمالي القطع',
      value: formatNumber(props.warehouse.total_items, 0),
      icon: 'ri-archive-line',
      color: 'grey',
      valueClass: 'text-slate-800'
    },
    {
      title: 'عدد الأصناف',
      value: formatNumber(props.warehouse.total_unique_items, 0),
      icon: 'ri-price-tag-3-line',
      color: 'secondary',
      valueClass: 'text-grey-darken-3'
    },
    {
      title: 'قيمة الجملة',
      value: formatCurrency(props.warehouse.total_wholesale_value),
      icon: 'ri-money-dollar-circle-line',
      color: 'success',
      valueClass: 'text-success-darken-1'
    },
    {
      title: 'قيمة القطاعي',
      value: formatCurrency(props.warehouse.total_retail_value),
      icon: 'ri-shopping-cart-line',
      color: 'primary',
      valueClass: 'text-primary'
    },
    {
      title: 'النواقص',
      value: formatNumber(props.warehouse.low_stock_items_count, 0),
      icon: 'ri-alert-line',
      color: props.warehouse.low_stock_items_count > 0 ? 'warning' : 'grey',
      valueClass: props.warehouse.low_stock_items_count > 0 ? 'text-warning font-weight-black' : 'text-grey'
    },
    {
      title: 'منتهية الصلاحية',
      value: formatNumber(props.warehouse.expired_items_count, 0),
      icon: 'ri-time-line',
      color: props.warehouse.expired_items_count > 0 ? 'error' : 'grey',
      valueClass: props.warehouse.expired_items_count > 0 ? 'text-error font-weight-black' : 'text-grey'
    }
  ];
});

// Client side filtering
const filteredStocks = computed(() => {
  if (!props.warehouse || !props.warehouse.stocks) return [];
  const query = search.value.toLowerCase().trim();
  if (!query) return props.warehouse.stocks;
  return props.warehouse.stocks.filter(stock => {
    const productName = (stock.variant?.product_name || '').toLowerCase();
    const sku = (stock.variant?.sku || '').toLowerCase();
    const barcode = (stock.variant?.barcode || '').toLowerCase();
    const batch = (stock.batch || '').toLowerCase();
    return productName.includes(query) || sku.includes(query) || barcode.includes(query) || batch.includes(query);
  });
});

const close = () => {
  isOpen.value = false;
  search.value = '';
};
</script>

<style scoped>
.max-width-400 {
  max-width: 400px;
}
.text-success-darken-1 {
  color: #2e7d32 !important;
}
.text-slate-800 {
  color: #1e293b !important;
}
.border-dashed {
  border-style: dashed !important;
}
.bg-error-lighten-5 {
  background-color: rgba(var(--v-theme-error), 0.05) !important;
}
.bg-grey-lighten-4 {
  background-color: #f5f5f5 !important;
}
</style>
