<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6" elevation="1">
          <v-card-text>
            <ProductFilters />
          </v-card-text>
        </v-card>

        <AppDataTable
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortBy"
          v-model:search="search"
          title="قائمة المنتجات"
          icon="ri-product-hunt-line"
          :headers="headers"
          :items="products"
          :total-items="totalItems"
          :loading="loading"
          permission-module="products"
          @view="viewProduct"
          @edit="editProduct"
          @delete="confirmDelete"
          @update:options="fetchProducts"
        >
          <template #actions>
            <v-btn v-if="can('products.create')" color="primary" prepend-icon="ri-add-line" @click="router.push({ name: 'product-create' })">
              إضافة منتج
            </v-btn>
          </template>

          <template #item.name="{ item }">
            <div class="d-flex align-center gap-2">
              <v-avatar size="40" rounded="lg">
                <v-img :src="item.main_image || '/placeholder-product.png'" cover />
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="text-subtitle-2 font-weight-bold">{{ item.name }}</span>
                <span class="text-caption text-grey">{{ item.category?.name }}</span>
              </div>
            </div>
          </template>

          <template #item.active="{ item }">
            <v-chip :color="item.active ? 'success' : 'error'" size="small" variant="tonal">
              {{ item.active ? 'نشط' : 'غير نشط' }}
            </v-chip>
          </template>

          <template #item.price_range="{ item }">
            <div class="text-subtitle-2">
              {{ formatPrice(item.min_price) }}
              <template v-if="item.min_price !== item.max_price"> - {{ formatPrice(item.max_price) }} </template>
            </div>
          </template>
        </AppDataTable>
      </v-col>
    </v-row>

    <ConfirmDialog ref="confirmDialog" title="حذف المنتج" message="هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف كافة المتغيرات والمخزون المرتبط به." />
  </v-container>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '../store/product.store';
import { usePermissions } from '@/composables/usePermissions';
import ProductFilters from '../components/ProductFilters.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const router = useRouter();
const productStore = useProductStore();
const { can } = usePermissions();
const { products, loading, totalItems, page, itemsPerPage, search, sortBy, filters } = storeToRefs(productStore);
const { fetchProducts, deleteProduct } = productStore;

const headers = [
  { title: 'المنتج', key: 'name', sortable: true },
  { title: 'السعر', key: 'price_range', sortable: false },
  { title: 'الماركة', key: 'brand.name', sortable: false },
  { title: 'الحالة', key: 'active', sortable: true },
  { title: 'تاريخ الإنشاء', key: 'created_at', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const formatPrice = price => {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
};

const viewProduct = item => {
  router.push({ name: 'product-view', params: { id: item.id } });
};

const editProduct = item => {
  router.push({ name: 'product-edit', params: { id: item.id } });
};

const confirmDialog = ref(null);
const confirmDelete = async item => {
  const confirmed = await confirmDialog.value.open();
  if (confirmed) {
    await deleteProduct(item.id);
  }
};

// Watch for filter changes and reload
watch(
  filters,
  () => {
    page.value = 1;
    fetchProducts();
  },
  { deep: true }
);

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
