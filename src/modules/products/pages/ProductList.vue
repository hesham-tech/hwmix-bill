<template>
  <div class="product-list-page">
    <AppPageHeader title="قائمة المنتجات" subtitle="إدارة المخزون والمنتجات والمتغيرات" icon="ri-box-3-line">
      <template #append>
        <AppButton
          v-if="can(PERMISSIONS.PRODUCTS_CREATE)"
          color="primary"
          prepend-icon="ri-add-line"
          size="large"
          class="gradient-add-btn elevation-6"
          @click="router.push({ name: 'product-create' })"
        >
          إضافة منتج
        </AppButton>
      </template>

      <template #controls>
        <v-col cols="12" md="8">
          <AppInput
            v-model="search"
            placeholder="بحث سريع بالاسم أو الكود..."
            prepend-inner-icon="ri-search-line"
            clearable
            hide-details
            variant="solo-filled"
            density="comfortable"
            flat
            class="rounded-lg px-0"
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center justify-end gap-2">
          <v-btn-toggle v-if="mobile" v-model="viewMode" mandatory color="primary" variant="tonal" density="comfortable" class="rounded-lg">
            <v-btn value="table" icon="ri-table-line" />
            <v-btn value="grid" icon="ri-layout-grid-line" />
          </v-btn-toggle>

          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="ri-equalizer-line"
            class="rounded-lg font-weight-bold"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? 'إخفاء البحث' : 'بحث متقدم' }}
          </v-btn>
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <v-expand-transition>
        <div v-if="showAdvanced" class="mb-6">
          <ProductFilters @apply="handleFiltersChange" />
        </div>
      </v-expand-transition>

      <v-row v-if="!mobile || viewMode === 'table'">
        <v-col cols="12">
          <AppDataTable
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            v-model:sort-by="sortByVuetify"
            :headers="headers"
            :items="products"
            :total-items="totalItems"
            :loading="loading"
            permission-module="products"
            @view="viewProduct"
            @edit="editProduct"
            @delete="confirmDelete"
            @update:options="changeSort"
          >
            <!-- Same table templates as before -->
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
              <template v-if="item.product_type === 'physical'">
                <v-chip
                  :color="item.total_available_quantity > 10 ? 'success' : item.total_available_quantity > 0 ? 'warning' : 'error'"
                  size="x-small"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ item.total_available_quantity }}
                </v-chip>
              </template>
              <template v-else>
                <v-chip color="info" size="x-small" variant="text" class="font-weight-bold">
                  <v-icon icon="ri-infinity-line" size="14" class="me-1" />
                  غير محدود
                </v-chip>
              </template>
            </template>

            <template #item.price_range="{ item }">
              <div class="d-flex flex-column">
                <div v-if="item.min_price && item.max_price && item.min_price !== item.max_price" class="d-flex flex-column">
                  <span class="text-caption text-grey"
                    >من: <span class="font-weight-bold text-primary">{{ formatCurrency(item.min_price) }}</span></span
                  >
                  <span class="text-caption text-grey"
                    >إلى: <span class="font-weight-bold text-primary">{{ formatCurrency(item.max_price) }}</span></span
                  >
                </div>
                <div v-else class="text-subtitle-2 font-weight-bold text-primary">
                  {{ formatCurrency(item.min_price || item.retail_price || 0) }}
                </div>
              </div>
            </template>

            <template #item.created_at="{ item }">
              <div class="text-caption text-grey">
                {{ new Date(item.created_at).toLocaleDateString('en-US').replace(/,/g, "'") }}
              </div>
            </template>
          </AppDataTable>
        </v-col>
      </v-row>

      <!-- Grid View (Mobile Only) -->
      <v-row v-else class="mx-0">
        <v-col v-for="item in products" :key="item.id" cols="12" sm="6">
          <v-card border flat class="rounded-lg overflow-hidden" @click="viewProduct(item)">
            <div class="d-flex pa-3 gap-3">
              <AppAvatar :img-url="item.primary_image_url || item.main_image" :name="item.name" size="80" rounded="lg" type="product" />
              <div class="d-flex flex-column flex-grow-1">
                <div class="d-flex justify-space-between align-start">
                  <div class="font-weight-bold text-body-1">{{ item.name }}</div>
                  <v-chip :color="item.active ? 'success' : 'error'" size="x-small" variant="tonal">{{ item.active ? 'نشط' : 'مؤرشف' }}</v-chip>
                </div>
                <div class="text-caption text-grey mb-2">{{ item.category?.name || 'بدون تصنيف' }}</div>
                <div class="d-flex justify-space-between align-center mt-auto">
                  <span class="text-primary font-weight-bold">{{ formatCurrency(item.min_price || 0) }}</span>
                  <v-chip
                    v-if="item.product_type === 'physical'"
                    :color="item.total_available_quantity > 10 ? 'success' : 'warning'"
                    size="x-small"
                    variant="flat"
                  >
                    {{ item.total_available_quantity }} قطعة
                  </v-chip>
                  <v-icon v-else icon="ri-infinity-line" color="info" size="18" />
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-pagination v-model="page" :length="Math.ceil(totalItems / itemsPerPage)" density="comfortable" @update:model-value="refresh" />
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
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { storeToRefs } from 'pinia';
import { useProductStore } from '../store/product.store';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import productService from '@/api/services/product.service';
import { PERMISSIONS } from '@/config/permissions';
import ProductFilters from '../components/ProductFilters.vue';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();
const productStore = useProductStore();
const { can } = usePermissions();
const { mobile } = useDisplay();

const viewMode = ref('table');

// API fetch function for useDataTable
const fetchProductsApi = async params => {
  return await productService.getAll(params);
};

// DataTable logic
const {
  items: products,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total: totalItems,
  search,
  filters,
  sortBy,
  sortByVuetify,
  changePage,
  changeSort,
  applyFilters,
  refresh,
} = useDataTable(fetchProductsApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: false,
});

const headers = [
  { title: 'المنتج', key: 'name', sortable: true },
  { title: 'التصنيف / الماركة', key: 'category_brand', sortable: false },
  { title: 'السعر', key: 'price_range', sortable: false },
  { title: 'المخزون', key: 'total_available_quantity', sortable: true, align: 'center' },
  { title: 'الحالة', key: 'active', sortable: true, align: 'center' },
  { title: 'تاريخ الإضافة', key: 'created_at', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const viewProduct = item => {
  router.push({ name: 'product-view', params: { id: item.id } });
};

const editProduct = item => {
  router.push({ name: 'product-edit', params: { id: item.id } });
};

// UI State
const showAdvanced = ref(false);

const confirmDialog = ref(null);
const confirmDelete = async item => {
  const confirmed = await confirmDialog.value.open();
  if (confirmed) {
    await productStore.deleteProduct(item.id);
    refresh();
  }
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500);
};

const handleFiltersChange = newFilters => {
  applyFilters(newFilters);
};
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
