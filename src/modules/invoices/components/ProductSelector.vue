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
      placeholder="ابدأ البحث... (مثلاً: سامسونج)"
      prepend-inner-icon="ri-search-2-line"
      clearable
      return-object
      no-filter
      rounded="xl"
      variant="outlined"
      density="comfortable"
      @update:search="handleSearch"
    >
      <!-- Custom item -->
      <template #item="{ props, item }">
        <v-list-item
          v-bind="props"
          class="py-2 px-4 search-item-hover"
          :disabled="item.raw.requires_stock && item.raw.quantity <= 0"
          :style="item.raw.requires_stock && item.raw.quantity <= 0 ? 'opacity: 0.6; pointer-events: none;' : ''"
        >
          <template #prepend>
            <AppAvatar :img-url="item.raw.primary_image_url" :name="item.raw.product_name" size="44" rounded="lg" type="product" border />
          </template>
          <template #title>
            <div
              class="font-weight-bold text-truncate mb-1"
              style="font-size: 0.95rem"
              v-html="highlightText(item.raw.product_name, searchQuery)"
            ></div>
          </template>
          <template #subtitle>
            <div class="d-flex flex-column gap-1">
              <div class="d-flex align-center gap-2">
                <span class="text-caption text-secondary"> SKU: <span v-html="highlightText(item.raw.sku || 'N/A', searchQuery)"></span> </span>
                <v-divider vertical class="mx-1" length="12" />
                <span class="text-caption text-secondary">
                  الباركود: <span v-html="highlightText(item.raw.barcode || 'N/A', searchQuery)"></span>
                </span>
              </div>
              <div class="d-flex justify-space-between align-center mt-1">
                <v-chip
                  size="x-small"
                  :color="item.raw.quantity > 0 ? 'success' : 'error'"
                  variant="tonal"
                  class="font-weight-bold"
                  :label="item.raw.requires_stock && item.raw.quantity <= 0"
                >
                  <v-icon v-if="item.raw.requires_stock && item.raw.quantity <= 0" start icon="ri-close-circle-line" size="12" />
                  {{ item.raw.quantity > 0 ? 'متوفر: ' + item.raw.quantity : 'نفذ المخزون' }}
                </v-chip>
                <div class="text-primary font-weight-bold" style="font-size: 1rem">
                  {{ formatCurrency(getVariantPrice(item.raw)) }}
                </div>
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

  // Start search after 1 character or if empty
  if (query && query.length > 0 && query.length < 1) return;

  searchTimeout = setTimeout(() => {
    loadVariants(query || '');
  }, 300); // Faster search
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
    max_quantity: variant.quantity || 0,
    unit_price: getVariantPrice(variant),
    // Prices for dynamic switching
    retail_price: variant.retail_price || variant.price || 0,
    wholesale_price: variant.wholesale_price || 0,
    purchase_price: variant.purchase_price || 0,
    discount_percentage: 0,
    total: getVariantPrice(variant),
    primary_image_url: variant.primary_image_url,
    product_type: variant.product_type,
    requires_stock: variant.requires_stock,
  };

  emit('add', item);

  // Reset selection and keep search open/reset
  setTimeout(() => {
    selectedVariant.value = null;
    searchQuery.value = '';
  }, 10);
};

// Watch variant selection for instant add
watch(selectedVariant, variant => {
  if (variant) {
    addVariantInstant(variant);
  }
});

// Load "most used" on mount
loadVariants();
</script>

<style scoped>
.search-item-hover {
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.search-item-hover:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}
</style>
