<template>
  <div>
    <!-- Variant autocomplete -->
    <AppAutocomplete
      v-model="selectedItem"
      :items="combinedItems"
      :loading="loading"
      :search="searchQuery"
      item-title="display_name"
      item-value="id"
      label="ابحث عن الصنف أو الخدمة *"
      placeholder="ابدأ البحث... (مثلاً: سامسونج)"
      prepend-inner-icon="ri-search-2-line"
      clearable
      return-object
      no-filter
      rounded="md"
      variant="outlined"
      density="comfortable"
      @update:search="handleSearch"
    >
      <!-- Custom item -->
      <template #item="{ props, item }">
        <v-list-item
          v-bind="props"
          class="py-2 px-4 search-item-hover"
          :disabled="item.raw.type === 'product' && invoiceType !== 'purchases' && item.raw.requires_stock && item.raw.quantity <= 0"
          :style="
            item.raw.type === 'product' && invoiceType !== 'purchases' && item.raw.requires_stock && item.raw.quantity <= 0
              ? 'opacity: 0.6; pointer-events: none;'
              : ''
          "
        >
          <template #prepend>
            <AppAvatar
              :img-url="item.raw.type === 'product' ? item.raw.primary_image_url : null"
              :name="item.raw.display_name"
              size="44"
              rounded="md"
              :type="item.raw.type === 'product' ? 'product' : 'service'"
              border
            />
          </template>
          <template #title>
            <div
              class="font-weight-bold text-truncate mb-1"
              style="font-size: 0.95rem"
              v-html="highlightText(item.raw.display_name, searchQuery)"
            ></div>
          </template>
          <template #subtitle>
            <div class="d-flex flex-column gap-1">
              <div class="d-flex align-center gap-2">
                <span class="text-caption text-secondary">
                  {{ item.raw.type === 'product' ? 'SKU:' : 'النوع:' }}
                  <span v-html="highlightText(item.raw.display_subtitle || 'N/A', searchQuery)"></span>
                </span>
                <v-divider v-if="item.raw.type === 'product'" vertical class="mx-1" length="12" />
                <span v-if="item.raw.type === 'product'" class="text-caption text-secondary">
                  الباركود: <span v-html="highlightText(item.raw.barcode || 'N/A', searchQuery)"></span>
                </span>
              </div>
              <div class="d-flex justify-space-between align-center mt-1">
                <v-chip
                  v-if="item.raw.type === 'product'"
                  size="x-small"
                  :color="item.raw.quantity > 0 ? 'success' : 'error'"
                  variant="tonal"
                  class="font-weight-bold"
                  :label="item.raw.requires_stock && item.raw.quantity <= 0"
                >
                  <v-icon v-if="item.raw.requires_stock && item.raw.quantity <= 0" start icon="ri-close-circle-line" size="12" />
                  {{ item.raw.quantity > 0 ? 'متوفر: ' + item.raw.quantity : 'نفذ المخزون' }}
                </v-chip>
                <v-chip v-else size="x-small" color="secondary" variant="tonal" class="font-weight-bold">
                  <v-icon start icon="ri-customer-service-2-line" size="12" />
                  خدمة
                </v-chip>
                <div class="text-primary font-weight-bold" style="font-size: 1rem">
                  {{ formatCurrency(item.raw.type === 'product' ? getVariantPrice(item.raw) : item.raw.default_price) }}
                </div>
              </div>
            </div>
          </template>
        </v-list-item>
      </template>

      <!-- Append Item for Quick Add -->
      <template #append-item>
        <v-divider />
        <v-list-item class="py-3" @click="$emit('create-product')">
          <template #prepend>
            <v-avatar color="primary-lighten-5" size="32">
              <v-icon icon="ri-add-line" color="primary" />
            </v-avatar>
          </template>
          <v-list-item-title class="text-primary font-weight-bold">إضافة منتج غير موجود...</v-list-item-title>
          <v-list-item-subtitle>سيفتح نافذة إضافة منتج سريع</v-list-item-subtitle>
        </v-list-item>
      </template>

      <!-- No data state -->
      <template #no-data>
        <v-list-item class="py-3" @click="$emit('create-product')">
          <template #prepend>
            <v-avatar color="primary-lighten-5" size="32">
              <v-icon icon="ri-add-line" color="primary" />
            </v-avatar>
          </template>
          <v-list-item-title class="text-primary font-weight-bold">لا توجد نتائج. إضافة منتج جديد؟</v-list-item-title>
          <v-list-item-subtitle>اضغط هنا لإنشاء "{{ searchQuery }}" كمنتج جديد</v-list-item-subtitle>
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

const emit = defineEmits(['add', 'create-product']);

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
    result.push({
      ...v,
      id: `v-${v.id}`,
      originalId: v.id,
      type: 'product',
      display_name: v.product_name,
      display_subtitle: v.sku || 'N/A',
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
  }, 400);
};

const loadResults = async (search = '') => {
  loading.value = true;
  try {
    // has_stock: 0 means show everything (for purchases)
    // has_stock: 1 means show only available (for sales)
    const params = {
      search,
      has_stock: props.invoiceType === 'purchase' ? 0 : 1,
    };

    const [variantsRes, servicesRes] = await Promise.all([
      variantApi.get(params, { showLoading: false, showError: false }),
      serviceApi.get({ name: search }, { showLoading: false, showError: false }),
    ]);

    variants.value = variantsRes.data || [];
    services.value = servicesRes.data || [];
  } catch (error) {
    console.error('Error loading search results:', error);
  } finally {
    loading.value = false;
  }
};

const addItemInstant = item => {
  if (!item) return;

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
      primary_image_url: null, // Services might not have images in the current schema
    };
  } else {
    const variant = item;
    const attributesText = variant.attributes
      ?.map(attr => attr.attribute_value?.name)
      .filter(Boolean)
      .join(' - ');

    finalItem = {
      product_id: variant.product_id,
      product_name: variant.product_name,
      name: variant.product_name,
      variant_id: variant.originalId,
      variant_name: variant.sku,
      attributes_text: attributesText,
      quantity: 1,
      max_quantity: variant.quantity || 0,
      unit_price: getVariantPrice(variant),
      retail_price: variant.retail_price || variant.price || 0,
      wholesale_price: variant.wholesale_price || 0,
      purchase_price: variant.purchase_price || 0,
      discount_percentage: 0,
      total: getVariantPrice(variant),
      primary_image_url: variant.primary_image_url,
      product_type: variant.product_type,
      requires_stock: variant.requires_stock,
    };
  }

  emit('add', finalItem);

  // Reset selection
  setTimeout(() => {
    selectedItem.value = null;
    searchQuery.value = '';
  }, 10);
};

// Watch selection for instant add
watch(selectedItem, item => {
  if (item) {
    addItemInstant(item);
  }
});

// Load empty or default on mount
loadResults();
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
