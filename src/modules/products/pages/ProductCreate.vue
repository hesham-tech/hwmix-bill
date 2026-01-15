<template>
  <div class="product-create-container">
    <ProductForm
      v-model="formData"
      :categories="categories"
      :brands="brands"
      :warehouses="warehouses"
      :available-attributes="attributes"
      :loading="saving"
      :errors="errors"
      :is-edit="isEdit"
      @submit="handleSubmit"
      @cancel="handleCancel"
      @refresh-categories="loadCategories"
      @refresh-brands="loadBrands"
      @refresh-attributes="loadAttributes"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductsData } from '../composables/useProductsData';
import { useApi } from '@/composables/useApi';
import ProductForm from '../components/ProductForm.vue';

const router = useRouter();
const route = useRoute();
const { getProduct, createProduct, updateProduct } = useProductsData();

const categoriesApi = useApi('/api/categories');
const brandsApi = useApi('/api/brands');
const warehousesApi = useApi('/api/warehouses');
const attributesApi = useApi('/api/attributes');

const saving = ref(false);
const errors = ref({});

const categories = ref([]);
const brands = ref([]);
const warehouses = ref([]);
const attributes = ref([]);

const formData = ref({
  name: '',
  sku: '',
  barcode: '',
  category_id: null,
  brand_id: null,
  desc: '',
  desc_long: '',
  retail_price: 0,
  wholesale_price: 0,
  tax: 0,
  warehouse_id: null,
  min_quantity: 1,
  weight: 0,
  active: true,
  featured: false,
  returnable: true,
  images: [],
  variants: [],
  tags: [],
  internal_note: '',
});

const isEdit = computed(() => !!route.params.id);

const loadCategories = async () => {
  const res = await categoriesApi.get({ per_page: 100 }, { showLoading: false });
  categories.value = res.data || [];
};

const loadBrands = async () => {
  const res = await brandsApi.get({ per_page: 100 }, { showLoading: false });
  brands.value = res.data || [];
};

const loadWarehouses = async () => {
  const res = await warehousesApi.get({ per_page: 100 }, { showLoading: false });
  warehouses.value = res.data || [];
};

const loadAttributes = async () => {
  const res = await attributesApi.get({ per_page: 100 }, { showLoading: false });
  attributes.value = res.data || [];
};

const loadInitialData = async () => {
  try {
    await Promise.all([loadCategories(), loadBrands(), loadWarehouses(), loadAttributes()]);
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
};

const loadProduct = async () => {
  if (!isEdit.value) return;

  try {
    const response = await getProduct(route.params.id);
    const p = response.data;
    formData.value = {
      ...p,
      images: p.images || [],
      variants: p.variants || [],
      tags: p.tags || [],
    };
  } catch (error) {
    console.error('Error loading product:', error);
    router.push('/products');
  }
};

const handleSubmit = async data => {
  saving.value = true;
  errors.value = {};

  try {
    // Note: useProductsData will handle the complex FormData/JSON conversion
    if (isEdit.value) {
      await updateProduct(route.params.id, data);
    } else {
      await createProduct(data);
    }
    router.push('/products');
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push('/products');
};

onMounted(async () => {
  await loadInitialData();
  if (isEdit.value) {
    await loadProduct();
  }
});
</script>

<style scoped>
.product-create-container {
  /* Offset parent padding for full-width sticky header on desktop */
  margin: 0;
}

@media (min-width: 960px) {
  .product-create-container {
    margin: -24px;
  }
}
</style>
