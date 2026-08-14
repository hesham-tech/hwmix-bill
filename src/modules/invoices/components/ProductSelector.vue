<template>
  <div class="product-selector-wrapper">
    <!-- Variant autocomplete -->
    <AppAutocomplete
      ref="autocompleteRef"
      v-model="selectedItem"
      :items="combinedItems"
      :loading="loading"
      :search="searchQuery"
      item-title="display_name"
      item-value="id"
      label="ابحث باسم الصنف أو الباركود..."
      placeholder="اسم الصنف أو الباركود... (مثال: سامسونج)"
      prepend-inner-icon="ri-search-2-line"
      clearable
      return-object
      no-filter
      rounded="md"
      variant="outlined"
      density="compact"
      class="inline-product-autocomplete"
      @update:search="handleSearch"
      @keydown.enter="handleEnterKey"
    >
      <!-- Custom item -->
      <template #item="{ props, item }">
        <v-list-item
          v-bind="props"
          class="py-2 px-3 search-item-hover"
          :disabled="item.raw.type === 'product' && invoiceType !== 'purchase' && item.raw.requires_stock && item.raw.quantity <= 0"
          :style="
            item.raw.type === 'product' && invoiceType !== 'purchase' && item.raw.requires_stock && item.raw.quantity <= 0
              ? 'opacity: 0.6; pointer-events: none;'
              : ''
          "
        >
          <template #prepend>
            <AppAvatar
              :img-url="item.raw.type === 'product' ? item.raw.primary_image_url : null"
              :name="item.raw.display_name"
              size="38"
              rounded="md"
              :type="item.raw.type === 'product' ? 'product' : 'service'"
              border
              class="me-2"
            />
          </template>
          <template #title>
            <div class="d-flex align-center justify-space-between gap-2">
              <div
                class="font-weight-bold text-truncate"
                style="font-size: 0.9rem"
                v-html="highlightText(item.raw.display_name, searchQuery)"
              ></div>
              <div class="text-primary font-weight-black text-no-wrap" style="font-size: 0.95rem">
                {{ formatCurrency(item.raw.type === 'product' ? getVariantPrice(item.raw) : item.raw.default_price) }}
              </div>
            </div>
          </template>
          <template #subtitle>
            <div class="d-flex flex-column gap-1 mt-1">
              <div class="d-flex align-center gap-2 flex-wrap text-caption text-secondary">
                <template v-if="item.raw.type === 'product'">
                  <span v-if="item.raw.attributes_text" class="text-caption text-primary font-weight-medium">
                    <v-icon icon="ri-price-tag-3-line" size="12" class="me-1" />
                    <span v-html="highlightText(item.raw.attributes_text, searchQuery)"></span>
                  </span>
                  <span v-else class="text-caption text-secondary">
                    SKU: <span v-html="highlightText(item.raw.display_subtitle || 'N/A', searchQuery)"></span>
                  </span>
                  <v-divider vertical class="mx-1" length="12" />
                  <span v-if="item.raw.barcode">
                    الباركود: <span class="font-weight-bold text-grey-darken-2" v-html="highlightText(item.raw.barcode, searchQuery)"></span>
                  </span>
                </template>
                <template v-else>
                  <span>خدمة إضافية</span>
                </template>
              </div>
              <div class="d-flex justify-space-between align-center mt-1">
                <v-chip
                  v-if="item.raw.type === 'product'"
                  size="x-small"
                  :color="item.raw.quantity > 0 ? 'success' : 'error'"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  <v-icon v-if="item.raw.requires_stock && item.raw.quantity <= 0" start icon="ri-close-circle-line" size="10" />
                  {{ item.raw.quantity > 0 ? 'متوفر: ' + item.raw.quantity : (item.raw.requires_stock ? 'نفذ المخزون' : 'غير محدود') }}
                </v-chip>
                <v-chip v-else size="x-small" color="secondary" variant="tonal" class="font-weight-bold">
                  <v-icon start icon="ri-customer-service-2-line" size="10" />
                  خدمة
                </v-chip>
              </div>
            </div>
          </template>
        </v-list-item>
      </template>



      <!-- No data state -->
      <template #no-data>
        <v-list-item class="py-2" @click="$emit('create-product', searchQuery)">
          <template #prepend>
            <v-avatar color="primary-lighten-5" size="28">
              <v-icon icon="ri-add-line" color="primary" size="16" />
            </v-avatar>
          </template>
          <v-list-item-title class="text-primary font-weight-bold text-caption">
            لا توجد نتائج. إضافة "{{ searchQuery }}" كمنتج جديد؟
          </v-list-item-title>
        </v-list-item>
      </template>
    </AppAutocomplete>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useApi } from '@/composables/useApi';
import { highlightText } from '@/utils/helpers';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  invoiceType: {
    type: String,
    default: 'sales', // 'sales' or 'purchases'
  },
  customerType: {
    type: String,
    default: 'retail', // 'retail' or 'wholesale'
  },
});

const emit = defineEmits(['add', 'select-item', 'create-product']);

// Ref for autocomplete component
const autocompleteRef = ref(null);

// API
const variantApi = useApi('/api/product-variants/search-by-product');
const serviceApi = useApi('/api/services');

// State
const variants = ref([]);
const services = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedItem = ref(null);
let searchTimeout = null;

const combinedItems = computed(() => {
  const result = [];

  // Map variants to common structure
  variants.value.forEach(v => {
    const attrsFormatted = v.attributes_text || (v.attributes?.map(a => {
      const name = a.attribute?.name;
      const val = a.attribute_value?.name;
      return (name && val) ? `${name}: ${val}` : (val || '');
    }).filter(Boolean).join(' | ') || '');

    result.push({
      ...v,
      id: `v-${v.id}`,
      originalId: v.id,
      type: 'product',
      display_name: v.product_name,
      display_subtitle: attrsFormatted || v.sku || 'N/A',
      attributes_text: attrsFormatted,
    });
  });

  // Map services to common structure
  services.value.forEach(s => {
    result.push({
      ...s,
      id: `s-${s.id}`,
      originalId: s.id,
      type: 'service',
      display_name: s.name,
      display_subtitle: 'خدمة إضافية',
    });
  });

  return result;
});

// Methods
const getVariantPrice = variant => {
  if (props.invoiceType === 'purchase') {
    return variant.purchase_price || 0;
  }

  if (props.customerType === 'wholesale') {
    return variant.wholesale_price || variant.retail_price || 0;
  }

  return variant.retail_price || variant.price || 0;
};

const handleSearch = query => {
  searchQuery.value = query;
  clearTimeout(searchTimeout);

  if (!query) {
    variants.value = [];
    services.value = [];
    return;
  }

  searchTimeout = setTimeout(() => {
    loadResults(query);
  }, 300);
};

const loadResults = async (search = '') => {
  loading.value = true;
  try {
    const params = {
      search,
      has_stock: props.invoiceType === 'purchase' ? 0 : 1,
      in_sales: props.invoiceType !== 'purchase' ? 1 : undefined,
    };

    const [variantsRes, servicesRes] = await Promise.all([
      variantApi.get(params, { showLoading: false, showError: false }),
      serviceApi.get({ name: search }, { showLoading: false, showError: false }),
    ]);

    variants.value = variantsRes.data || [];
    services.value = servicesRes.data || [];

    // If exactly 1 match (e.g. barcode scan), auto-select it if user presses enter
    if (search && combinedItems.value.length === 1 && searchQuery.value === search) {
      // Keep ready for selection
    }
  } catch (error) {
    console.error('Error loading search results:', error);
  } finally {
    loading.value = false;
  }
};

const handleEnterKey = e => {
  // If only 1 result matches the barcode/search and no item is selected yet
  if (!selectedItem.value && combinedItems.value.length === 1) {
    const singleMatch = combinedItems.value[0];
    if (singleMatch.type === 'product' && props.invoiceType !== 'purchase' && singleMatch.requires_stock && singleMatch.quantity <= 0) {
      return;
    }
    selectedItem.value = singleMatch;
  }
};

const prepareFinalItem = item => {
  if (!item) return null;

  let finalItem = {};

  if (item.type === 'service') {
    finalItem = {
      service_id: item.originalId,
      name: item.name,
      product_name: item.name,
      quantity: 1,
      unit_price: item.default_price || 0,
      total: item.default_price || 0,
      product_type: 'service',
      requires_stock: false,
      primary_image_url: null,
    };
  } else {
    const variant = item;
    const attributesText = variant.attributes_text || variant.attributes
      ?.map(attr => {
        const name = attr.attribute?.name;
        const val = attr.attribute_value?.name;
        return (name && val) ? `${name}: ${val}` : (val || '');
      })
      .filter(Boolean)
      .join(' | ');

    const allowedUnits = [];
    if (variant.base_unit) allowedUnits.push(variant.base_unit);
    if (variant.purchase_unit && !allowedUnits.some(u => u.id === variant.purchase_unit.id)) allowedUnits.push(variant.purchase_unit);
    if (variant.display_unit && !allowedUnits.some(u => u.id === variant.display_unit.id)) allowedUnits.push(variant.display_unit);

    if (variant.units && Array.isArray(variant.units)) {
      variant.units.forEach(vu => {
        if (vu.unit && !allowedUnits.some(u => u.id === vu.unit.id)) {
          allowedUnits.push(vu.unit);
        }
      });
    }

    finalItem = {
      product_id: variant.product_id,
      product_name: variant.product_name,
      name: variant.product_name,
      variant_id: variant.originalId,
      variant_name: variant.sku,
      sku: variant.sku,
      barcode: variant.barcode,
      attributes_text: attributesText,
      quantity: 1,
      max_quantity: variant.quantity || 0,
      unit_price: getVariantPrice(variant),
      retail_price: variant.retail_price || variant.price || 0,
      wholesale_price: variant.wholesale_price || 0,
      purchase_price: variant.purchase_price || 0,
      discount: 0,
      total: getVariantPrice(variant),
      primary_image_url: variant.primary_image_url,
      product_type: variant.product_type,
      requires_stock: variant.requires_stock,
      base_unit_id: variant.base_unit_id,
      unit_id: props.invoiceType === 'purchase' ? (variant.purchase_unit_id || variant.base_unit_id) : (variant.display_unit_id || variant.base_unit_id),
      allowed_units: allowedUnits,
      units: variant.units || [],
      unit_prices: variant.unit_prices || [],
      allow_decimal_quantities: !!variant.allow_decimal_quantities,
      quantity_precision: variant.quantity_precision || 0,
    };
  }
  return finalItem;
};

// Watch selection
watch(selectedItem, item => {
  if (item) {
    const finalItem = prepareFinalItem(item);
    if (finalItem) {
      emit('select-item', finalItem);
      emit('add', finalItem);
    }
    nextTick(() => {
      selectedItem.value = null;
      searchQuery.value = '';
    });
  }
});

const focus = () => {
  nextTick(() => {
    if (autocompleteRef.value?.$el) {
      const inputEl = autocompleteRef.value.$el.querySelector('input');
      if (inputEl) {
        inputEl.focus();
        inputEl.select?.();
      }
    }
  });
};

const reset = () => {
  selectedItem.value = null;
  searchQuery.value = '';
};

defineExpose({
  focus,
  reset,
});

loadResults();
</script>

<style scoped>
.search-item-hover {
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.search-item-hover:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.inline-product-autocomplete :deep(.v-field) {
  border-radius: 6px;
  background-color: rgb(var(--v-theme-surface));
}
</style>
