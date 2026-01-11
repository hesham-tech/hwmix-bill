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

const loadInitialData = async () => {
  try {
    const [catRes, brandRes, whRes, attrRes] = await Promise.all([
      categoriesApi.get({ per_page: 100 }, { showLoading: false }),
      brandsApi.get({ per_page: 100 }, { showLoading: false }),
      warehousesApi.get({ per_page: 100 }, { showLoading: false }),
      attributesApi.get({ per_page: 100 }, { showLoading: false }),
    ]);

    categories.value = catRes.data || [];
    brands.value = brandRes.data || [];
    warehouses.value = whRes.data || [];
    attributes.value = attrRes.data || [];
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
  margin: -24px; /* Offset parent padding for full-width sticky header if needed */
}
</style>
