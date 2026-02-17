<template>
  <div class="product-list-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm overflow-hidden mb-4">
            <AppDataTable
              v-model:sort-by="sortByVuetify"
              v-model:search="search"
              :filters="advancedFilters"
              @update:filters="val => Object.assign(filters, val)"
              :headers="headers"
              :items="products"
              :total-items="totalItems"
              :loading="loading"
              :virtual="true"
              permission-module="products"
              table-height="calc(100vh - 220px)"
              show-view-toggle
              grid-enabled
              :grid-options="{
                titleKey: 'name',
                imageKey: 'primary_image_url',
                bodyKeys: ['price_range', 'total_available_quantity', 'category_brand', 'active'],
              }"
              title="المنتجات"
              subtitle="إدارة المخزون والمنتجات والمتغيرات مع ميزات البحث المتقدم"
              icon="ri-box-3-line"
              @view="viewProduct"
              @edit="editProduct"
              @delete="confirmDelete"
            >
              <!-- Actions Slot -->
              <template #actions>
                <div class="d-flex gap-2">
                  <AppButton
                    color="grey-darken-1"
                    variant="tonal"
                    prepend-icon="ri-download-2-line"
                    size="small"
                    class="rounded-pill shadow-sm"
                    style="height: 40px"
                    :loading="exportLoading"
                    @click="handleExport"
                  >
                    تحميل منتجات
                  </AppButton>
                  <AppButton
                    v-if="canAny(PERMISSIONS.PRODUCTS_CREATE)"
                    color="secondary"
                    variant="tonal"
                    prepend-icon="ri-upload-cloud-2-line"
                    size="small"
                    class="rounded-pill shadow-sm"
                    style="height: 40px"
                    @click="importDialog?.open()"
                  >
                    رفع منتجات
                  </AppButton>
                  <AppButton
                    v-if="canAny(PERMISSIONS.PRODUCTS_CREATE)"
                    color="primary"
                    prepend-icon="ri-add-line"
                    size="small"
                    class="rounded-pill shadow-sm"
                    style="height: 40px"
                    @click="router.push({ name: 'product-create' })"
                  >
                    إضافة منتج
                  </AppButton>
                </div>
              </template>

              <!-- ... existing slots ... -->
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>

      <AppConfirmDialog
        ref="confirmDialog"
        title="حذف المنتج"
        message="هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف كافة المتغيرات والمخزون المرتبط به."
      />
      <PrintStickerDialog ref="stickerDialog" />
      <ProductImportDialog ref="importDialog" @imported="refresh" />
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../store/product.store';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import productService from '@/api/services/product.service';
import { PERMISSIONS } from '@/config/permissions';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import PrintStickerDialog from '../components/PrintStickerDialog.vue';
import ProductImportDialog from '../components/ProductImportDialog.vue';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();
const productStore = useProductStore();
const { can, canAny } = usePermissions();

// Advanced Filters Definition
const advancedFilters = [
  {
    key: 'category_id',
    title: 'التصنيف',
    type: 'autocomplete',
    apiEndpoint: 'categories',
  },
  {
    key: 'brand_id',
    title: 'العلامة التجارية',
    type: 'autocomplete',
    apiEndpoint: 'brands',
  },
  {
    key: 'product_type',
    title: 'نوع المنتج',
    type: 'select',
    items: [
      { title: 'منتج ملموس', value: 'physical' },
      { title: 'منتج رقمي', value: 'digital' },
      { title: 'خدمة', value: 'service' },
      { title: 'اشتراك', value: 'subscription' },
    ],
  },
  {
    key: 'active',
    title: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: 1 },
      { title: 'مؤرشف', value: 0 },
    ],
  },
  {
    key: 'featured',
    title: 'المميزة',
    type: 'select',
    items: [
      { title: 'نعم', value: 1 },
      { title: 'لا', value: 0 },
    ],
  },
  {
    key: 'stock_status',
    title: 'حالة المخزون',
    type: 'select',
    items: [
      { title: 'متوفر', value: 'in_stock' },
      { title: 'منخفض', value: 'low_stock' },
      { title: 'نفذت الكمية', value: 'out_of_stock' },
    ],
  },
  {
    key: 'min_price',
    title: 'أقل سعر',
    type: 'text',
    inputType: 'number',
  },
  {
    key: 'max_price',
    title: 'أعلى سعر',
    type: 'text',
    inputType: 'number',
  },
  {
    key: 'date_from',
    title: 'من تاريخ',
    type: 'date',
  },
  {
    key: 'date_to',
    title: 'إلى تاريخ',
    type: 'date',
  },
];

// API fetch function
const fetchProductsApi = async params => {
  return await productService.getAll(params);
};

// DataTable logic
const {
  items: products,
  loading,
  currentPage: page,
  total: totalItems,
  lastPage,
  search,
  filters,
  sortByVuetify,
  changeSort,
  fetchData,
  refresh,
} = useDataTable(fetchProductsApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  initialFilters: { ...productStore.filters },
  immediate: true,
});

const handleLoadMore = () => {
  if (loading.value || products.value.length >= totalItems.value || page.value >= (lastPage.value || Infinity)) return;
  page.value++;
  fetchData({ append: true });
};

const onTableOptionsUpdate = options => {
  changeSort(options);
};

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

const stickerDialog = ref(null);
const importDialog = ref(null);
const confirmDialog = ref(null);

const confirmDelete = async item => {
  const confirmed = await confirmDialog.value.open();
  if (confirmed) {
    await productStore.deleteProduct(item.id);
    refresh();
  }
};

const exportLoading = ref(false);

const handleExport = async () => {
  exportLoading.value = true;
  try {
    const response = await productService.export({
      ...filters.value,
      search: search.value,
      sort_by: sortByVuetify.value[0]?.key || 'created_at',
      sort_order: sortByVuetify.value[0]?.order || 'desc',
    });

    // Create a download link for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export error:', error);
  } finally {
    exportLoading.value = false;
  }
};
</script>

<style scoped>
.product-list-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
