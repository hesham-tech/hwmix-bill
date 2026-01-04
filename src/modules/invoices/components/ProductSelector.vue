<template>
  <div>
    <!-- Product autocomplete -->
    <v-autocomplete
      v-model="selectedProduct"
      :items="products"
      :loading="loading"
      :search="searchQuery"
      item-title="name"
      item-value="id"
      label="اختر المنتج *"
      placeholder="ابحث عن المنتج..."
      prepend-inner-icon="ri-search-line"
      clearable
      return-object
      @update:search="handleSearch"
    >
      <!-- Custom item -->
      <template #item="{ props, item }">
        <v-list-item v-bind="props">
          <template #prepend>
            <v-avatar rounded="sm">
              <v-img v-if="item.raw.image" :src="item.raw.image" cover />
              <v-icon v-else icon="ri-product-hunt-line" />
            </v-avatar>
          </template>
          <template #title>
            {{ item.raw.name }}
          </template>
          <template #subtitle>
            <div class="d-flex justify-space-between">
              <span class="text-caption">SKU: {{ item.raw.sku }}</span>
              <span class="text-success font-weight-medium">
                {{ formatCurrency(item.raw.sell_price) }}
              </span>
            </div>
          </template>
        </v-list-item>
      </template>
    </v-autocomplete>

    <!-- Variant selection (if product has variants) -->
    <v-select
      v-if="selectedProduct && hasVariants"
      v-model="selectedVariant"
      :items="selectedProduct.variants || []"
      item-title="name"
      item-value="id"
      label="اختر الشكل"
      prepend-inner-icon="ri-stack-line"
      return-object
      class="mt-4"
    >
      <template #item="{ props, item }">
        <v-list-item v-bind="props">
          <template #title>
            {{ item.raw.name }}
          </template>
          <template #subtitle>
            <div class="d-flex justify-space-between">
              <span>المخزون: {{ item.raw.stock }}</span>
              <span class="text-success">{{ formatCurrency(item.raw.price) }}</span>
            </div>
          </template>
        </v-list-item>
      </template>
    </v-select>

    <!-- Quantity & Price -->
    <v-row v-if="selectedProduct" class="mt-2">
      <v-col cols="12" md="3">
        <v-text-field
          v-model.number="quantity"
          label="الكمية *"
          type="number"
          min="1"
          prepend-inner-icon="ri-add-box-line"
          :error-messages="quantityError"
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field
          v-model.number="unitPrice"
          label="سعر الوحدة"
          type="number"
          prepend-inner-icon="ri-money-dollar-circle-line"
          :hint="`السعر الأصلي: ${formatCurrency(originalPrice)}`"
          persistent-hint
        />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field v-model.number="discount" label="الخصم %" type="number" min="0" max="100" prepend-inner-icon="ri-percent-line" />
      </v-col>

      <v-col cols="12" md="3">
        <v-text-field :model-value="total" label="المجموع" readonly prepend-inner-icon="ri-calculator-line" class="font-weight-bold" />
      </v-col>
    </v-row>

    <!-- Add button -->
    <v-btn v-if="selectedProduct" color="primary" block prepend-icon="ri-add-line" :disabled="!canAdd" @click="addProduct" class="mt-4">
      إضافة المنتج
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';

const emit = defineEmits(['add']);

// API
const productApi = useApi('/api/products');

// State
const products = ref([]);
const loading = ref(false);
const searchQuery = ref('');

const selectedProduct = ref(null);
const selectedVariant = ref(null);
const quantity = ref(1);
const unitPrice = ref(0);
const discount = ref(0);

// Computed
const hasVariants = computed(() => {
  return selectedProduct.value?.variants && selectedProduct.value.variants.length > 0;
});

const originalPrice = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.price;
  }
  return selectedProduct.value?.sell_price || 0;
});

const total = computed(() => {
  const subtotal = quantity.value * unitPrice.value;
  const discountAmount = subtotal * (discount.value / 100);
  return (subtotal - discountAmount).toFixed(2);
});

const quantityError = computed(() => {
  if (quantity.value < 1) {
    return 'الكمية يجب أن تكون 1 على الأقل';
  }
  if (selectedVariant.value && quantity.value > selectedVariant.value.stock) {
    return `المخزون المتاح: ${selectedVariant.value.stock}`;
  }
  if (selectedProduct.value && !hasVariants.value && quantity.value > selectedProduct.value.stock) {
    return `المخزون المتاح: ${selectedProduct.value.stock}`;
  }
  return null;
});

const canAdd = computed(() => {
  return selectedProduct.value && quantity.value >= 1 && unitPrice.value > 0 && !quantityError.value && (!hasVariants.value || selectedVariant.value);
});

// Methods
let searchTimeout;
const handleSearch = query => {
  searchQuery.value = query;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadProducts(query);
  }, 300);
};

const loadProducts = async (search = '') => {
  loading.value = true;
  try {
    const params = search ? { search } : {};
    const response = await productApi.get(params, { showLoading: false, showError: false });
    products.value = response.data || [];
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    loading.value = false;
  }
};

const addProduct = () => {
  if (!canAdd.value) return;

  const item = {
    product_id: selectedProduct.value.id,
    product_name: selectedProduct.value.name,
    variant_id: selectedVariant.value?.id || null,
    variant_name: selectedVariant.value?.name || null,
    quantity: quantity.value,
    unit_price: unitPrice.value,
    discount_percentage: discount.value,
    total: parseFloat(total.value),
  };

  emit('add', item);

  // Reset
  selectedProduct.value = null;
  selectedVariant.value = null;
  quantity.value = 1;
  unitPrice.value = 0;
  discount.value = 0;
};

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

// Watch product selection
watch(selectedProduct, product => {
  if (product) {
    unitPrice.value = product.sell_price;
    selectedVariant.value = null;
  }
});

watch(selectedVariant, variant => {
  if (variant) {
    unitPrice.value = variant.price;
  }
});

// Load on mount
loadProducts();
</script>
