<template>
  <div class="product-variant-list-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm overflow-hidden mb-4">
            <AppDataTable
              table-key="product_variants.index"
              v-model:sort-by="sortByVuetify"
              v-model:search="search"
              v-model:page="page"
              v-model:items-per-page="itemsPerPage"
              :filters="advancedFilters"
              @update:filters="val => Object.assign(filters, val)"
              :headers="headers"
              :items="variants"
              :total-items="totalItems"
              :loading="loading"
              permission-module="product_variants"
              title="متغيرات المنتجات"
              subtitle="عرض وإدارة متغيرات المنتجات التفصيلية والأسعار والمخزون مباشرة"
              icon="ri-bubble-chart-line"
              @view="viewVariant"
              @edit="editVariant"
              @delete="confirmDelete"
            >
              <!-- Product / Variant Column -->
              <template #item.product_name="{ item }">
                <div class="d-flex align-center gap-3 py-1">
                  <AppAvatar
                    :img-url="item.primary_image_url || item.image"
                    :name="item.product_name"
                    size="40"
                    rounded="md"
                    type="product"
                    border
                  />
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold text-body-2">{{ item.product_name }}</span>
                    <span class="text-caption text-grey-darken-1" v-if="getAttributesText(item)">
                      {{ getAttributesText(item) }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- Cost Column -->
              <template #item.cost="{ item }">
                <span class="text-caption text-grey-darken-1">
                  {{ item.cost > 0 ? formatCurrency(item.cost) : '---' }}
                </span>
              </template>

              <!-- Retail Price Column -->
              <template #item.retail_price="{ item }">
                <span class="font-weight-bold text-primary text-body-2">
                  {{ formatCurrency(item.retail_price) }}
                </span>
              </template>

              <!-- Wholesale Price Column -->
              <template #item.wholesale_price="{ item }">
                <span class="font-weight-bold text-success text-body-2">
                  {{ item.wholesale_price > 0 ? formatCurrency(item.wholesale_price) : '---' }}
                </span>
              </template>

              <!-- Purchase Price Column -->
              <template #item.purchase_price="{ item }">
                <span class="text-caption text-grey-darken-1">
                  {{ item.purchase_price > 0 ? formatCurrency(item.purchase_price) : '---' }}
                </span>
              </template>

              <!-- Profit Margin Column -->
              <template #item.profit_margin="{ item }">
                <span class="text-caption font-weight-bold" :class="item.profit_margin > 0 ? 'text-success' : ''">
                  {{ item.profit_margin > 0 ? (item.profit_margin + '%') : '---' }}
                </span>
              </template>

              <!-- Discount Column -->
              <template #item.discount="{ item }">
                <span class="text-caption text-grey-darken-1">
                  {{ item.discount > 0 ? (item.discount + '%') : '---' }}
                </span>
              </template>

              <!-- Tax Column -->
              <template #item.tax="{ item }">
                <span class="text-caption text-grey-darken-1">
                  {{ item.tax > 0 ? (item.tax + '%') : '---' }}
                </span>
              </template>

              <!-- Weight Column -->
              <template #item.weight="{ item }">
                <span class="text-caption text-grey-darken-1">
                  {{ item.weight || '---' }}
                </span>
              </template>

              <!-- Dimensions Column -->
              <template #item.dimensions="{ item }">
                <span class="text-caption text-grey-darken-1">
                  {{ item.dimensions || '---' }}
                </span>
              </template>

              <!-- Product Slug Column -->
              <template #item.product_slug="{ item }">
                <code class="text-caption bg-grey-lighten-4 px-2 py-0.5 rounded text-secondary">{{ item.product_slug }}</code>
              </template>

              <!-- Product Type Column -->
              <template #item.product_type="{ item }">
                <span class="text-body-2">{{ formatProductType(item.product_type) }}</span>
              </template>

              <!-- Requires Stock Column -->
              <template #item.requires_stock="{ item }">
                <v-icon
                  :icon="item.requires_stock ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                  :color="item.requires_stock ? 'success' : 'grey-lighten-1'"
                  size="18"
                />
              </template>

              <!-- Sales Count Column -->
              <template #item.sales_count="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.sales_count ?? 0 }}</span>
              </template>

              <!-- Quantity Column -->
              <template #item.quantity="{ item }">
                <v-chip
                  size="small"
                  variant="flat"
                  :color="item.quantity > 0 ? 'success' : 'error'"
                  class="font-weight-bold px-3"
                >
                  {{ item.quantity || 0 }}
                </v-chip>
              </template>

              <!-- Min Quantity Column -->
              <template #item.min_quantity="{ item }">
                <span class="text-caption text-grey-darken-1">
                  {{ item.min_quantity || '---' }}
                </span>
              </template>

              <!-- Status Column -->
              <template #item.status="{ item }">
                <v-chip
                  :color="item.status === 'active' || item.status === 1 ? 'success' : 'grey-darken-1'"
                  size="small"
                  variant="flat"
                  class="font-weight-bold px-3"
                >
                  {{ (item.status === 'active' || item.status === 1) ? 'نشط' : 'مؤرشف' }}
                </v-chip>
              </template>

              <!-- Created By Column -->
              <template #item.created_by_name="{ item }">
                <span class="text-caption text-grey-darken-2">{{ item.creator?.name || '---' }}</span>
              </template>

              <!-- Created At Column -->
              <template #item.created_at="{ item }">
                <span class="text-caption text-grey">
                  {{ item.created_at || '---' }}
                </span>
              </template>

              <!-- Updated At Column -->
              <template #item.updated_at="{ item }">
                <span class="text-caption text-grey">
                  {{ item.updated_at || '---' }}
                </span>
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>

      <AppConfirmDialog
        ref="confirmDialog"
        title="حذف متغير المنتج"
        message="هل أنت متأكد من حذف هذا المتغير؟ هذا الإجراء غير قابل للتراجع."
      />
    </v-container>
  </div>
</template>

<script setup>
/**
 * صفحة قائمة متغيرات المنتجات - تعرض جميع متغيرات المنتجات بشكل مسطح مع تفاصيل الأسعار والباركود والمخزون
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import productVariantService from '@/api/services/product-variant.service';
import { useDataTable } from '@/composables/useDataTable';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import { formatCurrency } from '@/utils/formatters';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

// Advanced Filters Definition
const advancedFilters = [
  {
    key: 'product_id',
    title: 'المنتج الأب',
    type: 'autocomplete',
    apiEndpoint: 'products',
  },
  {
    key: 'status',
    title: 'الحالة',
    type: 'select',
    items: [
      { title: 'نشط', value: 'active' },
      { title: 'مؤرشف', value: 'inactive' },
    ],
  },
  {
    key: 'has_stock',
    title: 'حالة المخزون',
    type: 'select',
    items: [
      { title: 'يوجد مخزون', value: 1 },
      { title: 'الكل', value: 0 },
    ],
  },
];

// API fetch function
const fetchVariantsApi = async params => {
  return await productVariantService.getAll(params);
};

// DataTable logic
const {
  items: variants,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total: totalItems,
  search,
  filters,
  sortByVuetify,
  refresh,
} = useDataTable(fetchVariantsApi, {
  syncWithUrl: true,
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const headers = computed(() => {
  const isDigitalEnabled = userStore.currentCompany?.settings?.enable_digital_products;
  const list = [
    { title: 'المنتج / المتغير', key: 'product_name', sortable: true, minWidth: '200px' },
    { title: 'SKU', key: 'sku', sortable: true, minWidth: '120px' },
    { title: 'الباركود', key: 'barcode', sortable: true, minWidth: '150px' },
    { title: 'التكلفة', key: 'cost', sortable: true, minWidth: '100px' },
    { title: 'سعر الشراء', key: 'purchase_price', sortable: true, minWidth: '110px' },
    { title: 'سعر البيع', key: 'retail_price', sortable: true, minWidth: '100px' },
    { title: 'سعر الجملة', key: 'wholesale_price', sortable: true, minWidth: '110px' },
    { title: 'هامش الربح', key: 'profit_margin', sortable: true, minWidth: '110px' },
    { title: 'الخصم (%)', key: 'discount', sortable: true, minWidth: '100px' },
    { title: 'الضريبة (%)', key: 'tax', sortable: true, minWidth: '100px' },
    { title: 'المخزون', key: 'quantity', sortable: true, align: 'center', minWidth: '100px' },
    { title: 'الحد الأدنى', key: 'min_quantity', sortable: true, align: 'center', minWidth: '100px' },
    { title: 'الوزن (كجم)', key: 'weight', sortable: true, align: 'center', minWidth: '110px' },
    { title: 'الأبعاد (ط×ع×ارتفاع)', key: 'dimensions', sortable: true, align: 'center', minWidth: '160px' },
    { title: 'الرابط البديل للمنتج', key: 'product_slug', sortable: true, minWidth: '160px' },
  ];

  if (isDigitalEnabled) {
    list.push({ title: 'نوع المنتج الأب', key: 'product_type', sortable: true, minWidth: '130px' });
  }

  list.push(
    { title: 'يتطلب مخزون', key: 'requires_stock', sortable: true, align: 'center', minWidth: '120px' },
    { title: 'عدد المبيعات', key: 'sales_count', sortable: true, align: 'center', minWidth: '120px' },
    { title: 'الحالة', key: 'status', sortable: true, align: 'center', minWidth: '100px' },
    { title: 'أنشئ بواسطة', key: 'created_by_name', sortable: false, minWidth: '120px' },
    { title: 'تاريخ الإضافة', key: 'created_at', sortable: true, minWidth: '150px' },
    { title: 'تاريخ التحديث', key: 'updated_at', sortable: true, minWidth: '150px' },
    { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', minWidth: '150px' }
  );

  return list;
});

const getAttributesText = item => {
  if (!item.attributes || !item.attributes.length) return '';
  return item.attributes
    .map(attr => {
      const attrName = attr.attribute?.name;
      const valName = attr.attribute_value?.name;
      return attrName && valName ? `${attrName}: ${valName}` : valName || '';
    })
    .filter(Boolean)
    .join(' | ');
};

const formatProductType = type => {
  const types = {
    physical: 'منتج ملموس',
    digital: 'منتج رقمي',
    service: 'خدمة',
    subscription: 'اشتراك',
  };
  return types[type] || type || '---';
};

const viewVariant = item => {
  router.push({ name: 'product-view', params: { id: item.product_id } });
};

const editVariant = item => {
  router.push({ name: 'product-edit', params: { id: item.product_id } });
};

const confirmDialog = ref(null);

const confirmDelete = async item => {
  const confirmed = await confirmDialog.value.open();
  if (confirmed) {
    try {
      await productVariantService.delete(item.id, { showToast: true });
      refresh();
    } catch (error) {
      console.error('Delete variant error:', error);
    }
  }
};
</script>

<style scoped>
.product-variant-list-page :deep(.v-container) {
  max-width: 100% !important;
}
</style>
