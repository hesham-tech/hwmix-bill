<template>
  <div class="pa-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold">المنتجات</h1>
      <p class="text-body-1 text-grey">إدارة منتجات المخزون والأسعار والمستويات</p>
    </div>

    <!-- Filters -->
    <ProductFilters v-model:filters="filters" @filter-change="handleFilterChange" />

    <!-- Data Table -->
    <ProductDataTable
      :items="products"
      :loading="loading"
      :page="page"
      :items-per-page="itemsPerPage"
      :total="total"
      @create="handleCreate"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @update:page="
        page = $event;
        loadProducts();
      "
      @update:items-per-page="handleItemsPerPageChange"
    />

    <!-- Delete Confirmation -->
    <AppDialog
      v-model="showDeleteDialog"
      title="تأكيد حذف المنتج"
      icon="ri-delete-bin-line"
      confirm-color="error"
      confirm-text="حذف المنتج"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      هل أنت متأكد من حذف المنتج "<strong>{{ selectedProduct?.name }}</strong
      >"؟
      <div class="mt-2 text-error font-weight-medium">
        <v-icon icon="ri-error-warning-line" size="small" class="me-1" />
        سيتم حذف جميع البيانات المتعلقة بهذا المنتج نهائياً.
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductsData } from '../composables/useProductsData';
import ProductFilters from '../components/ProductFilters.vue';
import ProductDataTable from '../components/ProductDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';

const router = useRouter();
const { products, loading, total, fetchProducts, deleteProduct } = useProductsData();

// Pagination
const page = ref(1);
const itemsPerPage = ref(10);

// Filters
const filters = reactive({
  search: '',
  category_id: null,
  brand_id: null,
  stock_status: null,
});

// Delete dialog
const showDeleteDialog = ref(false);
const selectedProduct = ref(null);
const deleting = ref(false);

// Handlers
const handleCreate = () => {
  router.push('/products/create');
};

const handleView = product => {
  router.push(`/products/${product.id}`);
};

const handleEdit = product => {
  router.push(`/products/${product.id}/edit`);
};

const handleDelete = product => {
  selectedProduct.value = product;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteProduct(selectedProduct.value.id);
    showDeleteDialog.value = false;
    await loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
  } finally {
    deleting.value = false;
  }
};

const handleFilterChange = () => {
  page.value = 1;
  loadProducts();
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadProducts();
};

// Load products
const loadProducts = async () => {
  const params = {
    page: page.value,
    per_page: itemsPerPage.value,
    ...filters,
  };

  // Remove empty filters
  Object.keys(params).forEach(key => {
    if (params[key] === null || params[key] === '') {
      delete params[key];
    }
  });

  await fetchProducts(params);
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.products-page {
  padding: 24px;
}
</style>
