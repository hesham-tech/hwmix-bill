<template>
  <div>
    <!-- Variant autocomplete -->
    <AppAutocomplete
      v-model="selectedVariant"
      :items="variants"
      :loading="loading"
      :search="searchQuery"
      item-title="product_name"
      item-value="id"
      label="ابحث عن الصنف (اسم، باركود، SKU) *"
      placeholder="ابدأ البحث..."
      prepend-inner-icon="ri-search-line"
      clearable
      return-object
      no-filter
      @update:search="handleSearch"
    >
      <!-- Custom item -->
      <template #item="{ props, item }">
        <v-list-item v-bind="props" class="py-2">
          <template #prepend>
            <AppAvatar :img-url="item.raw.primary_image_url" :name="item.raw.product_name" size="48" rounded="lg" type="product" border />
          </template>
          <template #title>
            <div class="font-weight-bold text-truncate" v-html="highlightText(item.raw.product_name + ' - ' + item.raw.sku, searchQuery)"></div>
          </template>
          <template #subtitle>
            <div class="d-flex justify-space-between align-center mt-1">
              <span class="text-caption text-secondary">
                الباركود: <span v-html="highlightText(item.raw.barcode || 'N/A', searchQuery)"></span>
              </span>
              <div class="d-flex align-center gap-2">
                <span class="text-caption text-info">المخزون: {{ item.raw.quantity ?? 0 }}</span>
                <span class="text-primary font-weight-bold">
                  {{ formatCurrency(getVariantPrice(item.raw)) }}
                </span>
              </div>
            </div>
          </template>
        </v-list-item>
      </template>
    </AppAutocomplete>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
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

const emit = defineEmits(['add']);

// API - Using the new variant search endpoint
const variantApi = useApi('/api/product-variants/search-by-product');

// State
const variants = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedVariant = ref(null);

// Methods
const getVariantPrice = variant => {
  if (props.invoiceType === 'purchases') {
    return variant.purchase_price || 0;
  }

  if (props.customerType === 'wholesale') {
    return variant.wholesale_price || variant.retail_price || 0;
  }

  return variant.retail_price || variant.price || 0;
};

let searchTimeout;
const handleSearch = query => {
  searchQuery.value = query;
  clearTimeout(searchTimeout);

  // Start search after 3 characters or if empty (to reset/most used)
  if (query && query.length > 0 && query.length < 3) return;

  searchTimeout = setTimeout(() => {
    loadVariants(query || '');
  }, 500);
};

const loadVariants = async (search = '') => {
  loading.value = true;
  try {
    const params = search ? { search } : {};
    const response = await variantApi.get(params, { showLoading: false, showError: false });
    variants.value = response.data || [];
  } catch (error) {
    console.error('Error loading variants:', error);
  } finally {
    loading.value = false;
  }
};

const addVariantInstant = variant => {
  if (!variant) return;

  const attributesText = variant.attributes
    ?.map(attr => attr.attribute_value?.name)
    .filter(Boolean)
    .join(' - ');

  const item = {
    product_id: variant.product_id,
    product_name: variant.product_name,
    name: variant.product_name, // Compatibility with InvoiceForm display
    variant_id: variant.id,
    variant_name: variant.sku,
    attributes_text: attributesText,
    quantity: 1,
    unit_price: getVariantPrice(variant),
    discount_percentage: 0,
    total: getVariantPrice(variant),
    primary_image_url: variant.primary_image_url,
  };

  emit('add', item);

  // Reset selection and keep search open/reset
  setTimeout(() => {
    selectedVariant.value = null;
    searchQuery.value = '';
  }, 10);
};

// Watch variant selection for instant add

// Watch variant selection for instant add
watch(selectedVariant, variant => {
  if (variant) {
    addVariantInstant(variant);
  }
});

// Load "most used" on mount
loadVariants();
</script>
