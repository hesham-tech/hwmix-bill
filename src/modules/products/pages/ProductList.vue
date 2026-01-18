<template>
  <div class="product-list-page">
    <AppPageHeader title="قائمة المنتجات" subtitle="إدارة المخزون والمنتجات والمتغيرات">
      <template #controls>
        <v-col cols="12" class="d-flex justify-center">
          <v-btn
            v-if="can(PERMISSIONS.PRODUCTS_CREATE)"
            color="primary"
            prepend-icon="ri-add-line"
            size="large"
            class="gradient-add-btn elevation-6"
            @click="router.push({ name: 'product-create' })"
          >
            إضافة منتج
          </v-btn>
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <v-row>
        <v-col cols="12">
          <v-card class="mb-6 border-slate-50" flat>
            <v-card-text>
              <ProductFilters />
            </v-card-text>
          </v-card>

          <AppDataTable
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            v-model:sort-by="sortBy"
            v-model:search="search"
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
            <template #item.name="{ item }">
              <div @click="viewProduct(item)" class="d-flex align-center gap-3 py-2">
                <AppAvatar :img-url="item.primary_image_url || item.main_image" :name="item.name" size="44" rounded="lg" type="product" hoverable />
                <div class="d-flex flex-column">
                  <div class="d-flex align-center gap-1">
                    <span class="text-subtitle-2 font-weight-bold">{{ item.name }}</span>
                    <v-icon v-if="item.featured" icon="ri-star-fill" color="warning" size="14" />
                  </div>
                  <span class="text-caption text-grey line-clamp-1" v-if="item.desc">{{ item.desc }}</span>
                </div>
              </div>
            </template>

            <template #item.category_brand="{ item }">
              <div class="d-flex flex-column">
                <span class="text-caption font-weight-bold" v-if="item.category">{{ item.category.name }}</span>
                <span class="text-caption text-primary" v-if="item.brand">{{ item.brand.name }}</span>
                <span class="text-caption text-grey" v-if="!item.category && !item.brand">-</span>
              </div>
            </template>

            <template #item.active="{ item }">
              <v-chip :color="item.active ? 'success' : 'error'" size="x-small" variant="flat" class="px-2">
                {{ item.active ? 'نشط' : 'مؤرشف' }}
              </v-chip>
            </template>

            <template #item.total_available_quantity="{ item }">
              <v-chip
                :color="item.total_available_quantity > 10 ? 'success' : item.total_available_quantity > 0 ? 'warning' : 'error'"
                size="x-small"
                variant="tonal"
                class="font-weight-bold"
              >
                {{ item.total_available_quantity }}
              </v-chip>
            </template>

            <template #item.price_range="{ item }">
              <div class="text-subtitle-2 font-weight-black text-primary">
                {{ formatPrice(item.min_price || 0) }}
                <template v-if="item.min_price !== item.max_price">
                  <span class="text-caption text-grey font-weight-medium"> - {{ formatPrice(item.max_price) }}</span>
                </template>
              </div>
            </template>

            <template #item.created_at="{ item }">
              <div class="text-caption text-grey">
                {{ new Date(item.created_at).toLocaleDateString('ar-EG') }}
              </div>
            </template>
          </AppDataTable>
        </v-col>
      </v-row>

      <AppConfirmDialog
        ref="confirmDialog"
        title="حذف المنتج"
        message="هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف كافة المتغيرات والمخزون المرتبط به."
      />
    </v-container>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '../store/product.store';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import ProductFilters from '../components/ProductFilters.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';

const router = useRouter();
const productStore = useProductStore();
const { can } = usePermissions();
const { products, loading, totalItems, page, itemsPerPage, search, sortBy, filters } = storeToRefs(productStore);
const { fetchProducts, deleteProduct } = productStore;

const headers = [
  { title: 'المنتج', key: 'name', sortable: true },
  { title: 'التصنيف / الماركة', key: 'category_brand', sortable: false },
  { title: 'السعر', key: 'price_range', sortable: false },
  { title: 'المخزون', key: 'total_available_quantity', sortable: true, align: 'center' },
  { title: 'الحالة', key: 'active', sortable: true, align: 'center' },
  { title: 'تاريخ الإضافة', key: 'created_at', sortable: true },
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
