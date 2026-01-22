<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <AppPageHeader sticky>
      <template #prepend>
        <div class="d-flex align-center gap-3">
          <AppButton icon="ri-arrow-right-line" variant="tonal" color="primary" size="small" class="rounded-md" @click="emit('cancel')" />
          <AppAvatar
            :img-url="primaryImageUrl"
            :name="productData.name || 'P'"
            :size="$vuetify.display.xs ? '36' : '48'"
            rounded="lg"
            type="product"
            border
          />
        </div>
      </template>

      <template #title>
        <div class="d-flex align-center gap-2 flex-wrap">
          <span class="text-h6 font-weight-black">{{ isEdit ? 'تعديل المنتج' : 'إضافة منتج' }}</span>
          <span v-if="productData.name" class="text-subtitle-2 font-weight-medium line-clamp-1">{{ productData.name }}</span>
          <v-chip v-if="isEdit" :color="productData.active ? 'success' : 'error'" size="x-small" variant="flat" class="px-2">
            {{ productData.active ? 'نشط' : 'مؤرشف' }}
          </v-chip>
        </div>
      </template>

      <template #append>
        <div class="d-flex gap-2">
          <AppButton variant="text" color="grey-darken-1" @click="emit('cancel')"> إلغاء </AppButton>
          <AppButton color="primary" type="submit" :loading="loading" :disabled="!isValid" class="px-6" prepend-icon="ri-save-3-line">
            حفظ التغييرات
          </AppButton>
        </div>
      </template>
    </AppPageHeader>

    <v-row class="pa-6">
      <!-- Main Form Content -->
      <v-col cols="12" lg="8">
        <!-- Information Card -->
        <v-card border flat class="rounded-md mb-6 overflow-visible">
          <div class="pa-4 mb-6 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="ri-information-line" color="primary" class="me-2" />
              <span class="text-subtitle-2 font-weight-bold">المعلومات الأساسية</span>
            </div>
            <!-- Product Type Selection -->
            <v-btn-toggle
              v-model="productData.product_type"
              mandatory
              variant="tonal"
              color="primary"
              density="compact"
              class="rounded-md"
              @update:model-value="handleTypeChange"
            >
              <v-btn value="physical" size="small" prepend-icon="ri-box-3-line"> مادي </v-btn>
              <v-btn value="digital" size="small" prepend-icon="ri-download-cloud-2-line"> رقمي </v-btn>
              <v-btn value="service" size="small" prepend-icon="ri-customer-service-2-line"> خدمة </v-btn>
              <v-btn value="subscription" size="small" prepend-icon="ri-repeat-line"> اشتراك </v-btn>
            </v-btn-toggle>
          </div>
          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12">
                <AppInput
                  v-model="productData.name"
                  label="اسم المنتج"
                  placeholder="ادخل اسم المنتج (مثال: طقم بيجامة قطن)"
                  required
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <AppAutocomplete
                  v-model="productData.category_id"
                  :items="productData.category ? [productData.category] : []"
                  label="التصنيف"
                  api-endpoint="categories"
                  item-title="name"
                  item-value="id"
                  required
                  can-create
                />
              </v-col>
              <v-col cols="12" md="6">
                <AppAutocomplete
                  v-model="productData.brand_id"
                  :items="productData.brand ? [productData.brand] : []"
                  label="العلامة التجارية"
                  api-endpoint="brands"
                  item-title="name"
                  item-value="id"
                  can-create
                />
              </v-col>
              <v-col cols="12">
                <AppTextarea v-model="productData.desc" label="وصف موجز" placeholder="اكتب وصفاً مختصراً للمنتج يظهر في قوائم البحث..." rows="3" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Digital Product Details (Smart Fields) -->
        <v-expand-transition>
          <v-card v-if="productData.product_type === 'digital'" border flat class="rounded-md mb-6">
            <div class="pa-4 mb-6 bg-info-lighten-5 rounded-t-lg border-b d-flex align-center">
              <v-icon icon="ri-download-cloud-2-line" color="info" class="me-2" />
              <span class="text-subtitle-2 font-weight-bold">تفاصيل المنتج الرقمي والتسليم</span>
            </div>
            <v-card-text class="pa-6">
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch v-model="productData.is_downloadable" label="قابل للتنزيل المباشر" color="primary" inset hide-details />
                </v-col>
                <v-col cols="12" md="6" v-if="productData.is_downloadable">
                  <AppInput
                    v-model="productData.download_url"
                    label="رابط التنزيل"
                    placeholder="https://example.com/files/..."
                    prepend-inner-icon="ri-link"
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="productData.is_downloadable">
                  <AppInput
                    v-model.number="productData.download_limit"
                    label="حد مرات التنزيل"
                    type="number"
                    placeholder="اتركه فارغاً لعدد غير محدود"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <AppInput v-model.number="productData.validity_days" label="مدة الصلاحية (بالأيام)" type="number" placeholder="مثال: 365" />
                </v-col>
                <v-col cols="12">
                  <v-label class="mb-2 font-weight-bold">مفاتيح الترخيص / الأكواد (اختياري)</v-label>
                  <v-combobox
                    v-model="productData.license_keys"
                    multiple
                    chips
                    closable-chips
                    placeholder="اضغط Enter بعد كل مفتاح"
                    variant="outlined"
                    hint="سيتم تسليم مفتاح واحد عند كل عملية بيع"
                    persistent-hint
                  />
                </v-col>
                <v-col cols="12">
                  <AppTextarea
                    v-model="productData.delivery_instructions"
                    label="تعليمات التسليم للمشتري"
                    placeholder="تظهر للمشتري فوراً بعد الدفع (مثال: طريقة تشغيل الكود)"
                    rows="3"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Variant Manager -->
        <VariantManager v-model="productData.variants" :product-type="productData.product_type" />
      </v-col>

      <!-- Sidebar Options -->
      <v-col cols="12" lg="4">
        <!-- Status Card -->
        <v-card border flat class="rounded-md mb-6">
          <div class="pa-4 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center">
            <v-icon icon="ri-settings-4-line" color="grey-darken-1" class="me-2" />
            <span class="text-subtitle-2 font-weight-bold">حالة العرض والخيارات</span>
          </div>
          <v-card-text class="pa-4">
            <div class="d-flex flex-column gap-2">
              <div class="d-flex align-center justify-space-between pa-2 rounded-md hover-bg">
                <div>
                  <div class="text-body-2 font-weight-bold">متاح للبيع</div>
                  <div class="text-caption text-grey">تفعيل أو تعطيل ظهور المنتج</div>
                </div>
                <v-switch v-model="productData.active" color="success" hide-details inset density="compact" />
              </div>

              <v-divider />

              <div class="d-flex align-center justify-space-between pa-2 rounded-md hover-bg">
                <div>
                  <div class="text-body-2 font-weight-bold">منتج مميز</div>
                  <div class="text-caption text-grey">عرض في الصفحة الرئيسية</div>
                </div>
                <v-switch v-model="productData.featured" color="warning" hide-details inset density="compact" />
              </div>

              <v-divider />

              <div class="d-flex align-center justify-space-between pa-2 rounded-md hover-bg">
                <div>
                  <div class="text-body-2 font-weight-bold">قابل للاسترجاع</div>
                  <div class="text-caption text-grey">السماح لطلب استرجاع المنتج</div>
                </div>
                <v-switch v-model="productData.returnable" color="primary" hide-details inset density="compact" />
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Media Card -->
        <v-card border flat class="rounded-md pb-4">
          <div class="pa-4 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center">
            <v-icon icon="ri-image-line" color="grey-darken-1" class="me-2" />
            <span class="text-subtitle-2 font-weight-bold">صور المنتج</span>
          </div>
          <v-card-text class="pa-4">
            <ProductMediaManager v-model="productData.images" v-model:primaryImageId="productData.primary_image_id" class="mt-2" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useProductStore } from '../store/product.store';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import VariantManager from './VariantManager.vue';
import ProductMediaManager from './ProductMediaManager.vue';

const props = defineProps({
  productId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['success', 'cancel']);

const productStore = useProductStore();
const { saveProduct, fetchProduct } = productStore;

const isEdit = computed(() => !!props.productId);
const loading = ref(false);
const isValid = ref(false);
const form = ref(null);

const primaryImageUrl = computed(() => {
  if (productData.value.images?.length > 0) {
    const primary = productData.value.images.find(img => img.id === productData.value.primary_image_id || img.is_primary);
    return primary ? primary.url : productData.value.images[0].url;
  }
  return null;
});

const productData = ref({
  name: '',
  product_type: 'physical',
  require_stock: true,
  is_downloadable: false,
  download_url: '',
  download_limit: null,
  license_keys: [],
  validity_days: null,
  delivery_instructions: '',
  category_id: null,
  brand_id: null,
  desc: '',
  active: true,
  featured: false,
  returnable: true,
  images: [],
  primary_image_id: null,
  variants: [
    {
      purchase_price: 0,
      wholesale_price: 0,
      retail_price: 0,
      profit_margin: 0,
      sku: '',
      barcode: '',
      stocks: [{ warehouse_id: null, quantity: 0 }],
      attributes: [{ attribute_id: null, attribute_value_id: null }],
      images: [],
      primary_image_id: null,
    },
  ],
});

const handleTypeChange = type => {
  // Logic to handle defaults when switching types
  if (type === 'digital' || type === 'service' || type === 'subscription') {
    productData.value.require_stock = false;
  } else {
    productData.value.require_stock = true;
  }
};

const handleSubmit = async () => {
  if (!isValid.value) return;

  loading.value = true;
  try {
    const payload = {
      ...productData.value,
      image_ids: productData.value.images?.map(img => img.id) || [],
      primary_image_id: productData.value.primary_image_id,
      variants: productData.value.variants.map(v => ({
        ...v,
        image_ids: v.images?.map(img => img.id) || [],
        primary_image_id: v.primary_image_id,
      })),
    };

    const response = await saveProduct(payload, props.productId);
    if (response.status) {
      emit('success', response.data);
    }
  } finally {
    loading.value = false;
  }
};

// Keyboard shortcuts handler
const handleKeyboardShortcuts = e => {
  // Ctrl+S or Cmd+S -> Save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    if (isValid.value && !loading.value) {
      handleSubmit();
    }
  }
  // Escape -> Cancel
  else if (e.key === 'Escape') {
    e.preventDefault();
    emit('cancel');
  }
};

onMounted(async () => {
  // Add keyboard shortcuts
  window.addEventListener('keydown', handleKeyboardShortcuts);

  if (isEdit.value) {
    loading.value = true;
    try {
      const data = await fetchProduct(props.productId);
      if (data) {
        productData.value = {
          ...data,
          category_id: data.category?.id || data.category_id,
          brand_id: data.brand?.id || data.brand_id,
          images: data.images || [],
          primary_image_id: data.images?.find(img => img.is_primary)?.id || null,
          variants: data.variants?.map(v => ({
            ...v,
            purchase_price: v.purchase_price || v.cost || 0,
            images: v.images || [],
            primary_image_id: v.images?.find(img => img.is_primary)?.id || null,
            stocks:
              v.stocks?.map(s => ({
                ...s,
                warehouse_id: s.warehouse?.id || s.warehouse_id,
              })) || [],
          })),
        };
      }
    } finally {
      loading.value = false;
    }
  } else {
    // Set default warehouse for new products
    const warehouseId = await productStore.fetchDefaultWarehouse();
    if (warehouseId) {
      productData.value.variants[0].stocks[0].warehouse_id = warehouseId;
    }
    // Ensure initial variant has at least one attribute for new products
    if (!productData.value.variants[0].attributes?.length) {
      productData.value.variants[0].attributes = [{ attribute_id: null, attribute_value_id: null }];
    }
  }
});

onUnmounted(() => {
  // Clean up keyboard shortcuts
  window.removeEventListener('keydown', handleKeyboardShortcuts);
});
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}

.hover-bg:hover {
  background-color: var(--v-theme-surface-variant);
}

/* RTL Breadcrumbs */
:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.5;
}
</style>
