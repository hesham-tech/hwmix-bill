<template>
  <div class="product-view-page">
    <AppPageHeader sticky>
      <template #prepend>
        <div class="d-flex align-center gap-4">
          <v-btn icon="ri-arrow-right-line" variant="tonal" color="primary" @click="router.push({ name: 'products' })" />
          <AppAvatar
            :img-url="product?.primary_image_url || product?.main_image"
            :name="product?.name"
            size="64"
            rounded="lg"
            type="product"
            border
          />
        </div>
      </template>

      <template #title>
        <div v-if="product" class="d-flex align-center gap-2">
          <h1 class="text-h4 font-weight-black">{{ product.name }}</h1>
          <v-chip :color="product.active ? 'success' : 'error'" size="small" variant="flat" class="px-3">
            {{ product.active ? 'نشط' : 'غير نشط' }}
          </v-chip>
        </div>
        <div v-else class="text-h4 font-weight-black">جاري التحميل...</div>
      </template>

      <template #subtitle>
        <v-breadcrumbs :items="breadcrumbItems" divider="/" class="pa-0 text-caption" />
      </template>

      <template #append>
        <div v-if="product" class="d-flex gap-3">
          <v-btn
            v-if="can(PERMISSIONS.PRODUCTS_UPDATE_ALL)"
            color="primary"
            variant="flat"
            prepend-icon="ri-edit-2-line"
            class="rounded-md px-6"
            @click="router.push({ name: 'product-edit', params: { id: product.id } })"
          >
            تعديل المنتج
          </v-btn>
          <v-btn v-if="can(PERMISSIONS.PRODUCTS_DELETE_ALL)" color="error" variant="tonal" icon="ri-delete-bin-line" @click="confirmDelete" />
        </div>
      </template>
    </AppPageHeader>

    <v-container fluid class="pa-6">
      <!-- Loading State -->
      <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px">
        <LoadingSpinner />
      </div>

      <!-- Error/Empty State -->
      <v-empty-state
        v-else-if="!product"
        icon="ri-error-warning-line"
        title="لم يتم العثور على المنتج"
        text="عذراً، المنتج الذي تبحث عنه غير موجود أو تم حذفه."
        action-text="العودة للقائمة"
        @click:action="router.push({ name: 'products' })"
      />

      <!-- Main Content -->
      <template v-else>
        <v-row>
          <!-- Left Column: Primary Stats & Variants -->
          <v-col cols="12" lg="9">
            <!-- Stats Dashboard -->
            <v-row class="mb-4">
              <v-col cols="12" sm="4">
                <v-card border flat class="rounded-md pa-4 bg-surface">
                  <div class="d-flex align-center gap-4">
                    <v-avatar color="primary-lighten-5" rounded="md" size="56">
                      <v-icon color="primary" icon="ri-database-2-line" size="28" />
                    </v-avatar>
                    <div>
                      <div class="text-grey-darken-1 text-caption font-weight-bold">إجمالي المخزون</div>
                      <div class="text-h5 font-weight-black">{{ totalStock }} <span class="text-caption">قطعة</span></div>
                    </div>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card border flat class="rounded-md pa-4">
                  <div class="d-flex align-center gap-4">
                    <v-avatar color="info-lighten-5" rounded="md" size="56">
                      <v-icon color="info" icon="ri-layout-grid-line" size="28" />
                    </v-avatar>
                    <div>
                      <div class="text-grey-darken-1 text-caption font-weight-bold">عدد المتغيرات</div>
                      <div class="text-h5 font-weight-black">{{ product.variants?.length || 0 }}</div>
                    </div>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4">
                <v-card border flat class="rounded-md pa-4">
                  <div class="d-flex align-center gap-4">
                    <v-avatar color="success-lighten-5" rounded="md" size="56">
                      <v-icon color="success" icon="ri-money-dollar-circle-line" size="28" />
                    </v-avatar>
                    <div>
                      <div class="text-grey-darken-1 text-caption font-weight-bold">متوسط سعر البيع</div>
                      <div class="text-h5 font-weight-black text-success">{{ formatPrice(averagePrice) }}</div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Variants Explorer -->
            <v-card border flat class="rounded-md overflow-hidden">
              <v-toolbar color="transparent" density="comfortable" class="px-2">
                <v-toolbar-title class="text-subtitle-1 font-weight-bold">
                  <v-icon icon="ri-list-settings-line" class="me-2" color="primary" />
                  مواصفات وباركود المتغيرات
                </v-toolbar-title>
                <v-spacer />
                <v-text-field
                  v-model="variantSearch"
                  density="compact"
                  variant="solo-filled"
                  flat
                  hide-details
                  prepend-inner-icon="ri-search-line"
                  placeholder="بحث في المتغيرات..."
                  class="max-width-300 me-2"
                />
              </v-toolbar>

              <v-divider />

              <v-data-table :headers="variantHeaders" :items="product.variants" :search="variantSearch" class="variant-table" show-expand>
                <!-- SKU & Barcode Column -->
                <template #item.sku_barcode="{ item }">
                  <div class="d-flex flex-column py-2">
                    <span class="font-weight-bold text-primary">{{ item.barcode }}</span>
                    <span class="text-caption text-grey">{{ item.sku }}</span>
                  </div>
                </template>

                <!-- Images Column -->
                <template #item.image="{ item }">
                  <v-avatar size="40" rounded="md" class="border bg-grey-lighten-4 my-1 cursor-pointer" @click="openLightbox(item.images?.[0]?.url)">
                    <v-img v-if="item.images?.[0]?.url" :src="item.images[0].url" cover />
                    <v-icon v-else icon="ri-image-2-line" color="grey-lighten-1" size="small" />
                  </v-avatar>
                </template>

                <!-- Attributes Column -->
                <template #item.attributes="{ item }">
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip v-for="attr in item.attributes" :key="attr.id" size="x-small" color="primary" variant="tonal" label>
                      {{ attr.attribute?.name }}: {{ attr.attribute_value?.name }}
                    </v-chip>
                    <span v-if="!item.attributes?.length" class="text-caption text-grey-lighten-1">افتراضي</span>
                  </div>
                </template>

                <!-- Prices Column -->
                <template #item.prices="{ item }">
                  <div class="d-flex flex-column gap-1 py-1">
                    <div
                      v-if="
                        item.purchase_price !== undefined &&
                        (can(PERMISSIONS.PRODUCTS_VIEW_PURCHASE_PRICE) || can(PERMISSIONS.ADMIN_SUPER) || can(PERMISSIONS.ADMIN_COMPANY))
                      "
                      class="d-flex justify-space-between align-center gap-6"
                    >
                      <span class="text-caption text-grey">شراء:</span>
                      <span class="font-weight-medium">{{ formatPrice(item.purchase_price) }}</span>
                    </div>
                    <div
                      v-if="
                        item.wholesale_price !== undefined &&
                        (can(PERMISSIONS.PRODUCTS_VIEW_WHOLESALE_PRICE) || can(PERMISSIONS.ADMIN_SUPER) || can(PERMISSIONS.ADMIN_COMPANY))
                      "
                      class="d-flex justify-space-between align-center gap-6"
                    >
                      <span class="text-caption text-grey">جملة:</span>
                      <span class="font-weight-medium">{{ formatPrice(item.wholesale_price) }}</span>
                    </div>
                    <div class="d-flex justify-space-between align-center gap-6">
                      <span class="text-caption font-weight-bold">قطاعي:</span>
                      <span class="font-weight-bold text-success">{{ formatPrice(item.retail_price) }}</span>
                    </div>
                  </div>
                </template>

                <!-- Total Stock Column -->
                <template #item.quantity="{ item }">
                  <v-chip :color="getStockColor(item.quantity)" size="small" variant="flat" class="font-weight-bold">
                    {{ item.quantity }} قطعة
                  </v-chip>
                </template>

                <!-- Expanded Row: Warehouse Breakdown -->
                <template #expanded-row="{ columns, item }">
                  <tr>
                    <td :colspan="columns.length" class="bg-grey-lighten-5 pa-4">
                      <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                        <v-icon icon="ri-home-4-line" size="small" class="me-2" color="primary" />
                        توزيع المخزون عبر المستودعات
                      </div>
                      <v-row dense>
                        <v-col v-for="stock in item.stocks" :key="stock.id" cols="12" sm="6" md="4">
                          <v-card border flat class="pa-3 rounded-md bg-white box-shadow-subtle">
                            <div class="d-flex justify-space-between align-center">
                              <div>
                                <div class="text-caption font-weight-bold text-primary mb-1">
                                  {{ stock.warehouse?.name }}
                                  <v-icon v-if="stock.warehouse?.is_default" icon="ri-star-fill" color="warning" size="x-small" />
                                </div>
                                <div class="text-caption text-grey d-flex align-center mr-1">
                                  <v-icon icon="ri-map-pin-line" size="10" class="me-1" />
                                  {{ stock.warehouse?.location || '---' }}
                                </div>
                              </div>
                              <div class="text-right">
                                <div class="text-h6 font-weight-black text-grey-darken-3">{{ stock.quantity }}</div>
                                <div class="text-caption text-grey-lighten-1">متوفر</div>
                              </div>
                            </div>
                          </v-card>
                        </v-col>
                        <v-col v-if="!item.stocks?.length" cols="12">
                          <div class="text-center py-4 text-grey text-caption">لا يوجد رصيد حالي لهذا المتغير في أي مستودع</div>
                        </v-col>
                      </v-row>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card>
          </v-col>

          <!-- Right Column: Sidebar Metadata -->
          <v-col cols="12" lg="3">
            <!-- Brands/Category Quick Card -->
            <v-card border flat class="rounded-md mb-4 pa-4 overflow-hidden position-relative">
              <div class="text-subtitle-2 font-weight-bold mb-4">التصنيف والعلامة</div>
              <div class="d-flex flex-column gap-6">
                <!-- Category -->
                <div class="d-flex align-center gap-3">
                  <v-avatar color="grey-lighten-4" class="border" rounded="md" size="50">
                    <v-img v-if="product.category?.image_url" :src="product.category.image_url" cover />
                    <v-icon v-else icon="ri-folder-line" color="grey" />
                  </v-avatar>
                  <div>
                    <div class="text-caption text-grey">التصنيف</div>
                    <div class="text-body-2 font-weight-bold">{{ product.category?.name }}</div>
                  </div>
                </div>

                <!-- Brand -->
                <div class="d-flex align-center gap-3">
                  <v-avatar color="grey-lighten-4" class="border" rounded="md" size="50">
                    <v-img v-if="product.brand?.image_url" :src="product.brand.image_url" cover />
                    <v-text-field v-else-if="product.brand?.name" :model-value="product.brand.name[0]" readonly class="centered-content" />
                    <v-icon v-else icon="ri-price-tag-3-line" color="grey" />
                  </v-avatar>
                  <div>
                    <div class="text-caption text-grey">العلامة التجارية</div>
                    <div class="text-body-2 font-weight-bold">{{ product.brand?.name || 'غير محددة' }}</div>
                  </div>
                </div>
              </div>
            </v-card>

            <!-- Creator Info Card -->
            <v-card border flat class="rounded-md mb-4 pa-4">
              <div class="text-subtitle-2 font-weight-bold mb-4">بواسطة</div>
              <div class="d-flex align-center gap-3">
                <v-avatar size="48" class="border">
                  <v-img :src="product.creator?.avatar_url" cover>
                    <template #placeholder>
                      <div class="d-flex fill-height align-center justify-center bg-grey-lighten-4">
                        <v-icon color="grey" size="small">ri-user-line</v-icon>
                      </div>
                    </template>
                  </v-img>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-bold">{{ product.creator?.full_name || product.creator?.username }}</div>
                  <div class="text-caption text-grey">{{ product.creator?.position || 'موظف' }}</div>
                </div>
              </div>
              <v-divider class="my-3" />
              <div class="d-flex justify-space-between mb-2">
                <span class="text-caption text-grey">تاريخ الإضافة</span>
                <span class="text-caption font-weight-medium">{{ formatDate(product.created_at) }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-caption text-grey">آخر تحديث</span>
                <span class="text-caption font-weight-medium">{{ formatDate(product.updated_at) }}</span>
              </div>
            </v-card>

            <!-- Images Gallery Card -->
            <v-card border flat class="rounded-md pa-4 mb-4" v-if="product.images?.length">
              <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                <v-icon icon="ri-image-2-line" class="me-2 text-primary" size="small" />
                صور المنتج
              </div>
              <v-row dense>
                <v-col v-for="img in product.images" :key="img.id" cols="4" sm="3" md="2">
                  <v-hover v-slot="{ isHovering, props: hoverProps }">
                    <v-card
                      v-bind="hoverProps"
                      border
                      flat
                      class="rounded-md cursor-pointer overflow-hidden aspect-square"
                      :elevation="isHovering ? 4 : 0"
                      @click="openLightbox(img.url)"
                    >
                      <v-img :src="img.url" cover class="fill-height bg-grey-lighten-4">
                        <!-- Primary Star (Always visible if primary, or on hover) -->
                        <v-btn
                          :icon="img.is_primary ? 'ri-star-fill' : 'ri-star-line'"
                          :color="img.is_primary ? 'warning' : 'white'"
                          size="x-small"
                          variant="flat"
                          class="position-absolute"
                          style="top: 4px; right: 4px; z-index: 2; width: 24px; height: 24px"
                          @click.stop="setPrimaryImage(img)"
                        />

                        <v-fade-transition>
                          <div
                            v-if="isHovering"
                            class="d-flex align-center justify-center fill-height bg-black-opacity-20"
                            @click="openLightbox(img.url)"
                          >
                            <v-icon icon="ri-zoom-in-line" color="white" />
                          </div>
                        </v-fade-transition>
                      </v-img>
                    </v-card>
                  </v-hover>
                </v-col>
              </v-row>
            </v-card>

            <!-- System Settings Card -->
            <v-card border flat class="rounded-md pa-4 bg-grey-lighten-5">
              <div class="text-subtitle-2 font-weight-bold mb-3">خصائص النظام</div>
              <v-list density="compact" bg-color="transparent" class="pa-0">
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon icon="ri-refresh-line" size="small" class="me-2" :color="product.returnable ? 'success' : 'grey'" />
                  </template>
                  <v-list-item-title class="text-caption">قابل للاسترجاع</v-list-item-title>
                  <template #append>
                    <v-icon
                      :icon="product.returnable ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                      :color="product.returnable ? 'success' : 'grey-lighten-1'"
                      size="16"
                    />
                  </template>
                </v-list-item>
                <v-list-item class="px-0">
                  <template #prepend>
                    <v-icon icon="ri-star-line" size="small" class="me-2" :color="product.featured ? 'warning' : 'grey'" />
                  </template>
                  <v-list-item-title class="text-caption">منتج مميز</v-list-item-title>
                  <template #append>
                    <v-icon
                      :icon="product.featured ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'"
                      :color="product.featured ? 'warning' : 'grey-lighten-1'"
                      size="16"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <AppConfirmDialog
        ref="confirmDialog"
        title="حذف المنتج"
        message="هل أنت متأكد من حذف هذا المنتج؟ سيؤدي ذلك لحذف جميع المتغيرات والمخزون المرتبط به."
      />

      <!-- Image Lightbox -->
      <v-dialog v-model="lightboxShow" max-width="800" class="image-lightbox">
        <v-card flat class="bg-transparent text-center overflow-visible">
          <v-btn icon="ri-close-line" variant="flat" color="white" class="close-btn" @click="lightboxShow = false" />
          <img :src="selectedImage" class="lightbox-img rounded-lg elevation-24" />
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../store/product.store';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { useApi } from '@/composables/useApi';
import AppAvatar from '@/components/common/AppAvatar.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const { can } = usePermissions();
const { fetchProduct, deleteProduct } = productStore;

const product = ref(null);
const loading = ref(true);
const variantSearch = ref('');

const variantHeaders = [
  { title: '', key: 'image', sortable: false, width: '60px' },
  { title: 'الباركود / SKU', key: 'sku_barcode', sortable: true },
  { title: 'الخصائص', key: 'attributes', sortable: false },
  { title: 'قائمة الأسعار', key: 'prices', sortable: false, width: '200px' },
  { title: 'الكمية الإجمالية', key: 'quantity', align: 'center', sortable: true },
  { title: '', key: 'data-table-expand' },
];

const selectedImage = ref(null);
const lightboxShow = ref(false);
const openLightbox = url => {
  if (!url) return;
  selectedImage.value = url;
  lightboxShow.value = true;
};

const { request: imageRequest } = useApi('/api/images');

const setPrimaryImage = async img => {
  if (img.is_primary) return;

  try {
    await imageRequest('POST', `${img.id}/set-primary`);
    // Update local state
    product.value.images.forEach(i => {
      i.is_primary = i.id === img.id;
    });
    // Trigger reactivity
    product.value.images = [...product.value.images];
  } catch (error) {
    console.error('Failed to update primary image:', error);
  }
};

const breadcrumbItems = computed(() => [
  { title: 'الرئيسية', disabled: false, to: '/' },
  { title: 'المنتجات', disabled: false, to: '/products' },
  { title: product.value?.category?.name || 'تصنيف', disabled: true },
]);

const totalStock = computed(() => product.value?.total_available_quantity || 0);

const averagePrice = computed(() => {
  if (!product.value?.variants?.length) return 0;
  const sum = product.value.variants.reduce((acc, v) => acc + parseFloat(v.retail_price || 0), 0);
  return sum / product.value.variants.length;
});

const formatPrice = price => {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
};

const formatDate = date => {
  if (!date) return '---';
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStockColor = qty => {
  if (qty <= 0) return 'error';
  if (qty < 10) return 'warning';
  return 'success';
};

const confirmDialog = ref(null);
const confirmDelete = async () => {
  const confirmed = await confirmDialog.value.open();
  if (confirmed) {
    await deleteProduct(product.value.id);
    router.push({ name: 'products' });
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    product.value = await fetchProduct(route.params.id);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.gap-1 {
  gap: 0.25rem;
}
.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
.gap-4 {
  gap: 1rem;
}
.gap-6 {
  gap: 1.5rem;
}

.variant-table :deep(.v-data-table-header__content) {
  font-weight: bold !important;
  color: var(--v-theme-primary);
}

.box-shadow-subtle {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
}

.max-width-300 {
  max-width: 300px;
}

/* RTL Breadcrumbs Fix */
:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.6;
}

.variant-table :deep(.v-data-table__tr:hover) {
  background-color: var(--v-theme-primary-lighten-5) !important;
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

.bg-black-opacity-20 {
  background: rgba(0, 0, 0, 0.2);
}

.image-lightbox :deep(.v-overlay__content) {
  box-shadow: none !important;
}

.lightbox-img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -20px;
  right: -20px;
  z-index: 1000;
}
</style>
