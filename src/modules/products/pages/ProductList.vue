<template>
  <div class="product-list-page">
    <AppPageHeader title="قائمة المنتجات" subtitle="إدارة المخزون والمنتجات والمتغيرات" icon="ri-box-3-line" sticky>
      <template #append>
        <AppButton
          v-if="canAny(PERMISSIONS.PRODUCTS_CREATE)"
          color="primary"
          prepend-icon="ri-add-line"
          size="large"
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
            class="rounded-md"
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="auto" class="d-md-none">
          <AppButton icon="ri-filter-line" color="primary" @click="showAdvanced = !showAdvanced" />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center justify-end gap-2">
          <v-btn-toggle v-if="mobile" v-model="viewMode" mandatory color="primary" variant="tonal" density="comfortable" class="rounded-md">
            <v-btn value="table" icon="ri-table-line" />
            <v-btn value="grid" icon="ri-layout-grid-line" />
          </v-btn-toggle>

          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="ri-equalizer-line"
            class="rounded-md font-weight-bold"
            @click="showAdvanced = !showAdvanced"
          >
            {{ showAdvanced ? 'إخفاء البحث' : 'بحث متقدم' }}
          </v-btn>
        </v-col>
      </template>
    </AppPageHeader>

    <v-container fluid class="pa-0">
      <!-- Advanced Filters (Expandable on Mobile) -->
      <div>
        <v-expand-transition>
          <div v-show="showAdvanced || !mobile" class="d-md-none">
            <ProductFilters @apply="handleFiltersChange" />
          </div>
        </v-expand-transition>
      </div>

      <!-- Desktop: Side-by-side Layout -->
      <v-row class="d-none d-md-flex ma-0">
        <!-- Main Content Column (8/12) -->
        <v-col cols="12" md="8" class="pa-0">
          <!-- View Mode Toggle (In Main Content for context) -->
          <div v-if="!mobile" class="d-flex align-center justify-end mb-4 px-2">
            <v-card variant="tonal" border class="rounded-pill pa-1 d-flex align-center">
              <v-btn
                :variant="viewMode === 'table' ? 'elevated' : 'text'"
                :color="viewMode === 'table' ? 'primary' : 'grey'"
                size="small"
                rounded="pill"
                class="px-4"
                prepend-icon="ri-table-line"
                @click="viewMode = 'table'"
              >
                جدول
              </v-btn>
              <v-btn
                :variant="viewMode === 'grid' ? 'elevated' : 'text'"
                :color="viewMode === 'grid' ? 'primary' : 'grey'"
                size="small"
                rounded="pill"
                class="px-4 ms-1"
                prepend-icon="ri-layout-grid-line"
                @click="viewMode = 'grid'"
              >
                شبكة
              </v-btn>
            </v-card>
          </div>

          <v-card v-if="viewMode === 'table'" rounded="md" class="border shadow-sm overflow-hidden">
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
              <template #item.name="{ item }">
                <div @click="viewProduct(item)" class="d-flex align-center gap-3 py-2">
                  <AppAvatar :img-url="item.primary_image_url || item.main_image" :name="item.name" size="44" rounded="md" type="product" hoverable />
                  <div class="d-flex flex-column">
                    <div class="d-flex align-center gap-1">
                      <span class="text-subtitle-2 font-weight-bold text-primary">{{ item.name }}</span>
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
                <v-chip :color="item.active ? 'success' : 'error'" size="x-small" variant="flat" class="px-2 font-weight-bold">
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
                  {{ new Date(item.created_at).toLocaleDateString('ar-EG') }}
                </div>
              </template>
              <template #extra-actions="{ item }">
                <AppButton
                  v-if="can(PERMISSIONS.PRODUCTS_PRINT_LABELS)"
                  icon="ri-ticket-line"
                  variant="text"
                  color="warning"
                  tooltip="طباعة ملصقات"
                  @click="stickerDialog?.open(item.id)"
                />
              </template>
            </AppDataTable>
          </v-card>

          <!-- Grid View -->
          <v-row v-else class="mx-0">
            <v-col v-for="item in products" :key="item.id" cols="12" sm="6" md="4" lg="4">
              <v-card border flat class="rounded-md overflow-hidden hover-shadow transition-swing" @click="viewProduct(item)">
                <div class="pa-4">
                  <div class="d-flex gap-4">
                    <AppAvatar
                      :img-url="item.primary_image_url || item.main_image"
                      :name="item.name"
                      size="100"
                      rounded="md"
                      type="product"
                      class="border"
                    />
                    <div class="d-flex flex-column flex-grow-1 overflow-hidden">
                      <div class="d-flex justify-space-between align-start mb-1">
                        <div class="font-weight-bold text-body-1 text-truncate">{{ item.name }}</div>
                        <v-chip :color="item.active ? 'success' : 'error'" size="x-small" variant="tonal">{{ item.active ? 'نشط' : 'مؤرشف' }}</v-chip>
                      </div>
                      <div class="text-caption text-grey mb-2">{{ item.category?.name || 'بدون تصنيف' }}</div>

                      <div class="mt-auto pt-2 border-top d-flex justify-space-between align-center">
                        <span class="text-primary font-weight-bold">{{ formatCurrency(item.min_price || 0) }}</span>
                        <v-chip
                          v-if="item.product_type === 'physical'"
                          :color="item.total_available_quantity > 10 ? 'success' : 'warning'"
                          size="x-small"
                          variant="flat"
                          class="px-2"
                        >
                          {{ item.total_available_quantity }} قطعة
                        </v-chip>
                        <v-icon v-else icon="ri-infinity-line" color="info" size="18" />
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" class="d-flex justify-center mt-4">
              <v-pagination
                v-model="page"
                :length="Math.ceil(totalItems / itemsPerPage)"
                density="comfortable"
                rounded="pill"
                @update:model-value="refresh"
              />
            </v-col>
          </v-row>
        </v-col>

        <!-- Sidebar Column (Filters) -->
        <v-col cols="12" lg="3" order="0" order-lg="2">
          <div class="sticky-sidebar">
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-subtitle-1 font-weight-bold d-flex align-center gap-2">
                <v-icon icon="ri-filter-3-line" color="primary" />
                خيارات البحث والتصفية
              </h3>
            </div>

            <v-card variant="flat" border class="rounded-md pa-4 bg-grey-lighten-5">
              <ProductFilters @apply="handleFiltersChange" />
            </v-card>

            <!-- Quick Stats in Sidebar -->
            <v-card variant="flat" border class="rounded-md pa-4 mt-6 bg-primary-lighten-5 border-primary">
              <div class="d-flex align-center gap-3">
                <v-avatar color="primary" rounded="md" size="40">
                  <v-icon icon="ri-box-3-line" color="white" />
                </v-avatar>
                <div>
                  <div class="text-caption text-primary-darken-1 font-weight-bold">إجمالي المنتجات</div>
                  <div class="text-h6 font-weight-black">{{ totalItems }}</div>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>

      <AppConfirmDialog
        ref="confirmDialog"
        title="حذف المنتج"
        message="هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف كافة المتغيرات والمخزون المرتبط به."
      />
      <v-divider />
      <PrintStickerDialog ref="stickerDialog" />
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
import PrintStickerDialog from '../components/PrintStickerDialog.vue';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();
const productStore = useProductStore();
const { can, canAny } = usePermissions();
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
const stickerDialog = ref(null);

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
.product-list-page :deep(.v-container) {
  max-width: 100% !important;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
