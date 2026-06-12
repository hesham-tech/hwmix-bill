<template>
  <div class="product-list-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm overflow-hidden mb-4">
            <AppDataTable
              class="tour-product-table"
              table-key="products.index"
              v-model:sort-by="sortByVuetify"
              v-model:search="search"
              v-model:page="page"
              v-model:items-per-page="itemsPerPage"
              :filters="advancedFilters"
              @update:filters="val => Object.assign(filters, val)"
              :headers="headers"
              :items="products"
              :total-items="totalItems"
              :loading="loading"
              permission-module="products"
              show-view-toggle
              :grid-options="{
                titleKey: 'name',
                imageKey: 'primary_image_url',
                bodyKeys: ['price_range', 'total_available_quantity', 'category_brand', 'active'],
              }"
              show-expand
              :enable-mobile-expansion="false"
              :expanded="expandedItems"
              @update:expanded="handleExpand"
              :row-props="getProductRowProps"
              @click:row="handleRowClick"
              title="المنتجات"
              subtitle="إدارة المخزون والمنتجات والمتغيرات مع ميزات البحث المتقدم"
              icon="ri-box-3-line"
              empty-state-type="products"
              :empty-state-show-cta="canAny(PERMISSIONS.PRODUCTS_CREATE)"
              @empty-action="router.push({ name: 'product-create' })"
              @view="viewProduct"
              @edit="editProduct"
              @delete="confirmDelete"
            >
              <!-- Actions Slot -->
              <template #actions>
                <div class="d-flex gap-2">
                  <AppButton
                    v-if="canAny(PERMISSIONS.PRODUCTS_EXPORT)"
                    color="grey-darken-1"
                    variant="tonal"
                    prepend-icon="ri-download-2-line"
                    size="small"
                    class="rounded-pill shadow-sm"
                    style="height: 40px"
                    :loading="exportLoading"
                    tooltip="تحميل منتجات"
                    @click="handleExport"
                  >
                    <span class="d-none d-sm-inline">تحميل منتجات</span>
                  </AppButton>
                  <AppButton
                    v-if="canAny(PERMISSIONS.PRODUCTS_IMPORT)"
                    color="secondary"
                    variant="tonal"
                    prepend-icon="ri-upload-cloud-2-line"
                    size="small"
                    class="rounded-pill shadow-sm"
                    style="height: 40px"
                    tooltip="رفع منتجات"
                    @click="importDialog?.open()"
                  >
                    <span class="d-none d-sm-inline">رفع منتجات</span>
                  </AppButton>
                  <AppButton
                    v-if="canAny(PERMISSIONS.PRODUCTS_CREATE)"
                    color="primary"
                    prepend-icon="ri-add-line"
                    size="small"
                    class="rounded-pill shadow-sm tour-product-add"
                    style="height: 40px"
                    @click="router.push({ name: 'product-create' })"
                  >
                    <span>إضافة منتج</span>
                  </AppButton>
                </div>
              </template>

              <!-- Category & Brand Column -->
              <template #item.category_brand="{ item }">
                <div class="d-flex flex-column">
                  <span class="text-caption font-weight-bold text-primary">{{ item.category?.name || 'بدون تصنيف' }}</span>
                  <span class="text-caption text-grey">{{ item.brand?.name || 'بدون ماركة' }}</span>
                </div>
              </template>

              <!-- Price Column -->
              <template #item.price_range="{ item }">
                <span class="font-weight-bold text-body-2">{{ formatCurrency(item.price_range) }}</span>
              </template>

              <!-- Active/Status Column -->
              <template #item.active="{ item }">
                <v-chip :color="item.active ? 'success' : 'grey-darken-1'" size="small" variant="flat" class="font-weight-bold px-3">
                  {{ item.active ? 'نشط' : 'مؤرشف' }}
                </v-chip>
              </template>

              <!-- Slug Column -->
              <template #item.slug="{ item }">
                <code class="text-caption bg-grey-lighten-4 px-2 py-0.5 rounded text-secondary">{{ item.slug }}</code>
              </template>

              <!-- Product Type Column -->
              <template #item.product_type="{ item }">
                <span class="text-body-2">{{ formatProductType(item.product_type) }}</span>
              </template>

              <!-- Min Price Column -->
              <template #item.min_price="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.min_price > 0 ? formatCurrency(item.min_price) : '---' }}</span>
              </template>

              <!-- Max Price Column -->
              <template #item.max_price="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.max_price > 0 ? formatCurrency(item.max_price) : '---' }}</span>
              </template>

              <!-- Avg Purchase Price Column -->
              <template #item.avg_purchase_price="{ item }">
                <span class="text-caption text-grey-darken-2 font-weight-medium">
                  {{ item.avg_purchase_price > 0 ? formatCurrency(item.avg_purchase_price) : '---' }}
                </span>
              </template>

              <!-- Avg Wholesale Price Column -->
              <template #item.avg_wholesale_price="{ item }">
                <span class="text-caption text-grey-darken-2 font-weight-medium">
                  {{ item.avg_wholesale_price > 0 ? formatCurrency(item.avg_wholesale_price) : '---' }}
                </span>
              </template>

              <!-- Avg Retail Price Column -->
              <template #item.avg_retail_price="{ item }">
                <span class="text-caption text-grey-darken-2 font-weight-medium">
                  {{ item.avg_retail_price > 0 ? formatCurrency(item.avg_retail_price) : '---' }}
                </span>
              </template>

              <!-- Require Stock Column -->
              <template #item.require_stock="{ item }">
                <v-icon
                  :icon="item.require_stock ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                  :color="item.require_stock ? 'success' : 'grey-lighten-1'"
                  size="18"
                />
              </template>

              <!-- Featured Column -->
              <template #item.featured="{ item }">
                <v-icon
                  :icon="item.featured ? 'ri-star-fill' : 'ri-star-line'"
                  :color="item.featured ? 'warning' : 'grey-lighten-1'"
                  size="18"
                />
              </template>

              <!-- Returnable Column -->
              <template #item.returnable="{ item }">
                <v-icon
                  :icon="item.returnable ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                  :color="item.returnable ? 'success' : 'grey-lighten-1'"
                  size="18"
                />
              </template>

              <!-- Downloadable Column -->
              <template #item.is_downloadable="{ item }">
                <v-icon
                  :icon="item.is_downloadable ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                  :color="item.is_downloadable ? 'success' : 'grey-lighten-1'"
                  size="18"
                />
              </template>

              <!-- Download Limit Column -->
              <template #item.download_limit="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.is_downloadable ? (item.download_limit || 'لا نهائي') : '---' }}</span>
              </template>

              <!-- License Keys Count Column -->
              <template #item.available_keys_count="{ item }">
                <v-chip
                  v-if="item.product_type === 'digital'"
                  size="x-small"
                  variant="tonal"
                  :color="item.available_keys_count > 0 ? 'success' : 'error'"
                  class="font-weight-bold"
                >
                  {{ item.available_keys_count }} مفتاح
                </v-chip>
                <span v-else class="text-grey-lighten-1">---</span>
              </template>

              <!-- Validity Days Column -->
              <template #item.validity_days="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.validity_days || '---' }}</span>
              </template>

              <!-- Expires At Column -->
              <template #item.expires_at="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.expires_at || '---' }}</span>
              </template>

              <!-- Published At Column -->
              <template #item.published_at="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.published_at || '---' }}</span>
              </template>

              <!-- Desc Column -->
              <template #item.desc="{ item }">
                <div class="text-truncate text-caption text-grey-darken-1" style="max-width: 250px;" :title="item.desc">
                  {{ item.desc || '---' }}
                </div>
              </template>

              <!-- Updated At Column -->
              <template #item.updated_at="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.updated_at || '---' }}</span>
              </template>

              <!-- Sales Count Column -->
              <template #item.sales_count="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.sales_count ?? 0 }}</span>
              </template>

              <!-- Long Description Column -->
              <template #item.desc_long="{ item }">
                <div class="text-truncate text-caption text-grey-darken-1" style="max-width: 250px;" :title="item.desc_long">
                  {{ item.desc_long || '---' }}
                </div>
              </template>

              <!-- Created By Column -->
              <template #item.created_by_name="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.creator?.name || '---' }}</span>
              </template>

              <!-- Visibility Icons Column -->
              <template #item.visibility="{ item }">
                <div class="d-flex align-center gap-1">
                  <v-tooltip text="يظهر في المتجر" location="top">
                    <template #activator="{ props }">
                      <v-icon 
                        v-bind="props"
                        :icon="item.is_active_in_store ? 'ri-global-line' : 'ri-global-line'" 
                        :color="item.is_active_in_store ? 'info' : 'grey-lighten-2'" 
                        size="16" 
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip text="يظهر في المبيعات / POS" location="top">
                    <template #activator="{ props }">
                      <v-icon 
                        v-bind="props"
                        :icon="item.is_active_in_sales ? 'ri-shopping-cart-2-line' : 'ri-shopping-cart-2-line'" 
                        :color="item.is_active_in_sales ? 'secondary' : 'grey-lighten-2'" 
                        size="16" 
                      />
                    </template>
                  </v-tooltip>
                </div>
              </template>

              <!-- Expanded Row for Variants -->
              <template #expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length" class="pa-4 bg-grey-lighten-4 border-bottom">
                    <div v-if="item.variants && item.variants.length > 0" class="border rounded-md bg-white overflow-hidden shadow-sm">
                      <v-table density="compact" class="variants-table">
                        <thead class="bg-grey-lighten-5">
                          <tr>
                            <th class="text-center font-weight-bold text-caption px-2 py-1">SKU</th>
                            <th v-if="mdAndUp" class="text-center font-weight-bold text-caption px-2 py-1">التكلفة</th>
                            <th class="text-center font-weight-bold text-caption px-2 py-1">سعر البيع</th>
                            <th v-if="mdAndUp" class="text-center font-weight-bold text-caption px-2 py-1">سعر الجملة</th>
                            <th v-if="mdAndUp" class="text-center font-weight-bold text-caption px-2 py-1">الخصم</th>
                            <th class="text-center font-weight-bold text-caption px-2 py-1">المخزون</th>
                            <th v-if="mdAndUp" class="text-center font-weight-bold text-caption px-2 py-1">الحد الأدنى</th>
                            <th v-if="mdAndUp" class="text-left font-weight-bold text-caption px-2 py-1">الباركود</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="variant in item.variants" :key="variant.id">
                            <td class="text-center text-caption text-grey-darken-1 px-2 py-1">{{ variant.sku || '---' }}</td>
                            <td v-if="mdAndUp" class="text-center text-caption px-2 py-1">{{ variant.cost > 0 ? formatCurrency(variant.cost) : '---' }}</td>
                            <td class="text-center text-primary font-weight-bold text-caption px-2 py-1">{{ formatCurrency(variant.retail_price) }}</td>
                            <td v-if="mdAndUp" class="text-center text-success font-weight-bold text-caption px-2 py-1">{{ variant.wholesale_price ? formatCurrency(variant.wholesale_price) : '---' }}</td>
                            <td v-if="mdAndUp" class="text-center text-caption text-error px-2 py-1">{{ variant.discount ? variant.discount : '---' }}</td>
                            <td class="text-center px-2 py-1">
                              <v-chip
                                size="x-small"
                                variant="flat"
                                :color="variant.quantity > 0 ? 'success' : 'error'"
                                class="font-weight-bold px-1 py-0 h-auto"
                              >
                                {{ variant.quantity || 0 }}
                              </v-chip>
                            </td>
                            <td v-if="mdAndUp" class="text-center text-caption text-grey-darken-1 px-2 py-1">{{ variant.min_quantity || '---' }}</td>
                            <td v-if="mdAndUp" class="text-left text-caption code-font px-2 py-1">{{ variant.barcode || '---' }}</td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>
                    <div v-else class="text-center py-4 text-grey">
                      <v-icon icon="ri-information-line" class="me-2" />
                      لا توجد متغيرات مسجلة لهذا المنتج.
                    </div>
                  </td>
                </tr>
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

      <!-- Export Progress Dialog -->
      <v-dialog v-model="exportDialogOpen" max-width="500" persistent>
        <v-card class="rounded-xl pa-6 text-center">
          <v-card-title class="text-h5 font-weight-bold mb-2">تصدير المنتجات</v-card-title>
          
          <v-card-text class="py-4">
            <v-progress-linear
              v-model="exportProgress"
              color="primary"
              height="15"
              rounded
              striped
              class="mb-4"
            />
            
            <div class="text-body-1 font-weight-bold mb-2">{{ exportStatusText }}</div>
            <p class="text-caption text-grey">يرجى الانتظار حتى اكتمال عملية توليد ملف التصدير بالخلفية.</p>
          </v-card-text>

          <v-card-actions class="d-flex justify-center gap-2">
            <v-btn
              v-if="exportDownloadUrl"
              color="success"
              variant="flat"
              prepend-icon="ri-download-2-line"
              class="px-8 font-weight-bold rounded-pill"
              @click="triggerFileDownload(exportDownloadUrl)"
            >
              تحميل الملف الناتج
            </v-btn>
            <v-btn
              variant="text"
              color="grey"
              @click="closeExportDialog"
            >
              إغلاق
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
/**
 * صفحة عرض قائمة المنتجات وإدارة المخزون
 */
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../store/product.store';
import { usePermissions } from '@/composables/usePermissions';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import productService from '@/api/services/product.service';
import { PERMISSIONS } from '@/config/permissions';
import { useUserStore } from '@/stores/user';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import PrintStickerDialog from '../components/PrintStickerDialog.vue';
import ProductImportDialog from '../components/ProductImportDialog.vue';
import { useDisplay } from 'vuetify';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();
const productStore = useProductStore();
const { mdAndUp } = useDisplay();
const userStore = useUserStore();
const { can, canAny } = usePermissions();

// Advanced Filters Definition
const advancedFilters = computed(() => {
  const isDigitalEnabled = userStore.currentCompany?.settings?.enable_digital_products;
  const productTypeItems = [
    { title: 'منتج ملموس', value: 'physical' },
    ...(isDigitalEnabled ? [{ title: 'منتج رقمي', value: 'digital' }] : []),
    { title: 'خدمة', value: 'service' },
    { title: 'اشتراك', value: 'subscription' },
  ];

  return [
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
      items: productTypeItems,
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
      title: 'إلى تاريخ',
      type: 'date',
    },
    {
      key: 'in_store',
      title: 'متاح في المتجر',
      type: 'select',
      items: [
        { title: 'نعم', value: 1 },
        { title: 'لا', value: 0 },
      ],
    },
    {
      key: 'in_sales',
      title: 'متاح في المبيعات',
      type: 'select',
      items: [
        { title: 'نعم', value: 1 },
        { title: 'لا', value: 0 },
      ],
    },
  ];
});

// API fetch function
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

const expandedItems = ref([]);

const handleExpand = (newExpanded) => {
  // Keep only the last expanded item to ensure single-row expansion
  expandedItems.value = newExpanded.length ? [newExpanded[newExpanded.length - 1]] : [];
};

const getProductRowProps = ({ item, internalItem }) => {
  const itemId = internalItem ? internalItem.value : (item.id || item.raw?.id);
  if (expandedItems.value.includes(itemId)) {
    return { class: 'expanded-active-row text-primary' };
  }
  return {};
};

const handleRowClick = (item) => {
  const itemId = item.id || item.raw?.id;
  const isExpanded = expandedItems.value.includes(itemId);
  
  if (isExpanded) {
    expandedItems.value = [];
  } else {
    expandedItems.value = [itemId];
  }
};

const handleLoadMore = () => {
  if (loading.value || products.value.length >= totalItems.value || page.value >= (lastPage.value || Infinity)) return;
  page.value++;
  fetchData({ append: true });
};

const onTableOptionsUpdate = options => {
  changeSort(options);
};

const headers = computed(() => {
  const isDigitalEnabled = userStore.currentCompany?.settings?.enable_digital_products;
  const list = [
    { title: '', key: 'data-table-expand', align: 'start', sortable: false, width: '48px', mandatory: true },
    { title: 'المنتج', key: 'name', sortable: true, minWidth: '200px', mandatory: true },
    { title: 'الرابط البديل (Slug)', key: 'slug', sortable: true, minWidth: '150px', defaultHide: true },
    { title: 'نوع المنتج', key: 'product_type', sortable: true, minWidth: '120px', defaultHide: !isDigitalEnabled },
    { title: 'التصنيف / الماركة', key: 'category_brand', sortable: false, minWidth: '150px' },
    { title: 'السعر', key: 'price_range', sortable: false, minWidth: '100px', showOnMobile: true },
    { title: 'أقل سعر', key: 'min_price', sortable: true, minWidth: '100px', defaultHide: true },
    { title: 'أعلى سعر', key: 'max_price', sortable: true, minWidth: '100px', defaultHide: true },
  ];

  if (can('products.view_purchase_price') || userStore.isAdmin) {
    list.push({ title: 'متوسط سعر الشراء', key: 'avg_purchase_price', sortable: true, minWidth: '130px' });
  }

  if (can('products.view_wholesale_price') || userStore.isAdmin) {
    list.push({ title: 'متوسط سعر الجملة', key: 'avg_wholesale_price', sortable: true, minWidth: '130px' });
  }

  list.push({ title: 'متوسط سعر القطاعي', key: 'avg_retail_price', sortable: true, minWidth: '130px' });

  list.push(
    { title: 'المخزون', key: 'total_available_quantity', sortable: true, align: 'center', minWidth: '100px', showOnMobile: true },
    { title: 'يتطلب مخزون', key: 'require_stock', sortable: true, align: 'center', minWidth: '120px', defaultHide: !isDigitalEnabled },
    { title: 'مميز', key: 'featured', sortable: true, align: 'center', minWidth: '90px', defaultHide: true },
    { title: 'عدد المبيعات', key: 'sales_count', sortable: true, align: 'center', minWidth: '120px', defaultHide: true },
    { title: 'قابل للإرجاع', key: 'returnable', sortable: true, align: 'center', minWidth: '120px', defaultHide: true },
    { title: 'قابل للتنزيل', key: 'is_downloadable', sortable: true, align: 'center', minWidth: '120px', defaultHide: !isDigitalEnabled },
    { title: 'حد التنزيل', key: 'download_limit', sortable: true, align: 'center', minWidth: '100px', defaultHide: !isDigitalEnabled },
    { title: 'مفاتيح التراخيص', key: 'available_keys_count', sortable: true, align: 'center', minWidth: '150px', defaultHide: !isDigitalEnabled },
    { title: 'صلاحية الأيام', key: 'validity_days', sortable: true, align: 'center', minWidth: '120px', defaultHide: !isDigitalEnabled },
    { title: 'تاريخ الانتهاء', key: 'expires_at', sortable: true, minWidth: '150px', defaultHide: !isDigitalEnabled },
    { title: 'تاريخ النشر', key: 'published_at', sortable: true, minWidth: '150px', defaultHide: true },
    { title: 'الوصف', key: 'desc', sortable: false, minWidth: '250px', defaultHide: true },
    { title: 'الوصف التفصيلي', key: 'desc_long', sortable: false, minWidth: '250px', defaultHide: true },
    { title: 'الظهور', key: 'visibility', sortable: false, align: 'center', minWidth: '100px' },
    { title: 'الحالة', key: 'active', sortable: true, align: 'center', minWidth: '100px' },
    { title: 'أنشئ بواسطة', key: 'created_by_name', sortable: false, minWidth: '120px', defaultHide: true },
    { title: 'تاريخ الإضافة', key: 'created_at', sortable: true, minWidth: '150px', defaultHide: true },
    { title: 'تاريخ التحديث', key: 'updated_at', sortable: true, minWidth: '150px', defaultHide: true },
    { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', minWidth: '120px', mandatory: true }
  );

  return list;
});

const formatProductType = type => {
  const types = {
    physical: 'منتج ملموس',
    digital: 'منتج رقمي',
    service: 'خدمة',
    subscription: 'اشتراك',
  };
  return types[type] || type || '---';
};

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

// --- تصدير المنتجات بالخلفية ---

const exportImportApi = useApi('/api/export-import');
const exportDialogOpen = ref(false);
const exportProgress = ref(0);
const exportStatusText = ref('');
const exportDownloadUrl = ref('');
const exportJobId = ref(null);
let exportPollingInterval = null;

const handleExport = async () => {
  exportDialogOpen.value = true;
  exportProgress.value = 10;
  exportStatusText.value = 'جاري جدولة عملية التصدير بالخلفية...';
  exportDownloadUrl.value = '';
  
  try {
    const res = await exportImportApi.create({ model_type: 'products' }, { showLoading: false });
    if (res.data && res.data.id) {
      exportJobId.value = res.data.id;
      startExportPolling(res.data.id);
    }
  } catch (error) {
    console.error('Export scheduling failed:', error);
    exportDialogOpen.value = false;
  }
};

const startExportPolling = (jobId) => {
  exportPollingInterval = setInterval(async () => {
    try {
      const res = await exportImportApi.getById(jobId, { showLoading: false, showError: false });
      if (res.data) {
        exportProgress.value = res.data.progress || 10;
        
        if (res.data.status === 'processing') {
          exportStatusText.value = 'جاري تجميع البيانات وتوليد ملف التصدير...';
        }
        
        if (res.data.status === 'completed') {
          clearInterval(exportPollingInterval);
          exportStatusText.value = 'اكتمل توليد الملف بنجاح!';
          exportDownloadUrl.value = res.data.download_url;
          
          if (res.data.download_url) {
            triggerFileDownload(res.data.download_url);
          }
        } else if (res.data.status === 'failed') {
          clearInterval(exportPollingInterval);
          exportStatusText.value = 'فشلت عملية التصدير. يرجى المحاولة لاحقاً.';
        }
      }
    } catch (error) {
      console.error('Error polling export job:', error);
    }
  }, 2000);
};

const triggerFileDownload = (url) => {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `products_export_${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const closeExportDialog = () => {
  exportDialogOpen.value = false;
  clearInterval(exportPollingInterval);
};
</script>

<style scoped>
.product-list-page :deep(.v-container) {
  max-width: 100% !important;
}

/* الصف الموسع الأساسي (لون مغمق قليلاً للتمييز) */
:deep(.expanded-active-row td) {
  background-color: #bbdefb !important; /* Blue 100 */
  transition: background-color 0.3s ease;
}

/* التبادل اللوني في جدول المتغيرات (Zebra Striping) */
.variants-table tbody tr:nth-child(odd) {
  background-color: #e3f2fd !important; /* أزرق خفيف جداً يظهر في الصف الأول فوراً */
}
.variants-table tbody tr:nth-child(even) {
  background-color: #ffffff !important; /* أبيض (فاتح) للصف الثاني */
}

/* تصغير البادنج وحجم الخط لجدول المتغيرات */
.variants-table th,
.variants-table td {
  height: 32px !important;
  font-size: 0.75rem !important; /* text-caption */
}
</style>
