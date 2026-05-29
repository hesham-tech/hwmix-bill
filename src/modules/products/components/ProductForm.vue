<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
    <AppPageHeader :sticky-top="isDialog ? 0 : 79" sticky>
      <template #prepend>
        <div class="d-flex align-center gap-2">
          <AppButton icon="ri-arrow-right-line" variant="tonal" color="primary" size="x-small" density="compact" @click="emit('cancel')" />
          <AppAvatar
            :img-url="primaryImageUrl"
            :name="productData.name || 'P'"
            size="32"
            rounded="md"
            type="product"
            border
          />
        </div>
      </template>

      <template #title>
        <div class="d-flex align-center gap-2 flex-wrap">
          <span class="text-subtitle-2 font-weight-bold">{{ isEdit ? 'تعديل المنتج' : 'إضافة منتج' }}</span>
          <span v-if="productData.name" class="text-xxs text-grey-darken-1 line-clamp-1">{{ productData.name }}</span>
          <v-chip v-if="isEdit" :color="productData.active ? 'success' : 'error'" size="x-small" variant="flat" class="px-1" density="compact">
            {{ productData.active ? 'نشط' : 'مؤرشف' }}
          </v-chip>
        </div>
      </template>

      <template #append>
        <div class="d-flex gap-2">
          <AppButton variant="text" color="grey-darken-1" size="small" density="compact" @click="emit('cancel')"> إلغاء </AppButton>
          <AppButton color="primary" type="submit" :loading="loading" :disabled="!isValid" size="small" density="compact" class="px-4" prepend-icon="ri-save-3-line">
            حفظ التغييرات
          </AppButton>
        </div>
      </template>
    </AppPageHeader>

    <v-row class="pa-2">
      <!-- Main Form Content -->
      <v-col cols="12" lg="8">
        <!-- Information Card -->
        <v-card border flat class="mb-2 overflow-visible">
          <div
            class="pa-2 mb-1 bg-grey-lighten-5 rounded-t-lg border-b d-flex flex-column-reverse flex-md-row align-md-center justify-md-space-between gap-2"
          >
            <div class="d-flex align-center">
              <v-icon icon="ri-information-line" color="primary" size="14" class="me-2" />
              <span class="text-xxs font-weight-bold">المعلومات الأساسية</span>
            </div>

            <!-- Product Type Selection -->
            <v-item-group v-model="productData.product_type" mandatory class="d-flex flex-wrap gap-2" @update:model-value="handleTypeChange">
              <v-item v-for="type in productTypes" :key="type.value" :value="type.value">
                <template #default="{ isSelected, toggle }">
                  <v-tooltip :text="type.description" location="top" open-delay="300">
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        :variant="isSelected ? 'flat' : 'tonal'"
                        :color="isSelected ? 'primary' : 'grey-lighten-3'"
                        :class="['rounded-md', { 'text-primary': !isSelected }]"
                        class="flex-grow-1 flex-md-grow-0"
                        size="small"
                        @click="toggle"
                        :prepend-icon="type.icon"
                      >
                        {{ type.label }}
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>
              </v-item>
            </v-item-group>
          </div>
          <v-card-text class="pa-2">
            <v-row>
              <v-col cols="12">
                <AppAutocomplete
                  v-model="productData.name"
                  label="اسم المنتج *"
                  help-text="الاسم التجاري للمنتج كما يظهر للعملاء في الفواتير والمتجر."
                  placeholder="ادخل اسم المنتج (مثال: طقم بيجامة قطن)"
                  required
                  variant="outlined"
                  api-endpoint="products"
                  item-title="name"
                  item-value="name"
                  :clearable="false"
                  no-filter
                  hide-no-data
                  @select="handleNameSelect"
                  @update:search="productData.name = $event"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item.raw.category?.name || 'بدون تصنيف'">
                      <template #prepend>
                        <AppAvatar :img-url="item.raw.primary_image_url" :name="item.raw.name" size="32" class="me-2" />
                      </template>
                    </v-list-item>
                  </template>
                </AppAutocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <AppAutocomplete
                  v-model="productData.category_id"
                  :items="productData.category ? [productData.category] : []"
                  label="التصنيف"
                  help-text="يساعد التصنيف في ترتيب المنتجات وتقسيم تقارير المبيعات بدقة."
                  api-endpoint="categories"
                  item-title="full_path"
                  item-value="id"
                  can-create
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="undefined">
                      <template #title>
                        <div class="d-flex align-center flex-wrap gap-1">
                          <span class="font-weight-bold text-body-2 text-slate-800">{{ item.raw.name }}</span>
                          <v-chip v-if="!item.raw.company_id" size="x-small" color="info" variant="flat" class="px-1" style="height: 16px; font-size: 9px">
                            عالمي
                          </v-chip>
                        </div>
                      </template>
                      <template #subtitle>
                        <div class="d-flex align-center gap-1 text-caption text-slate-500 mt-1">
                          <v-icon icon="ri-node-tree" size="12" class="text-primary" />
                          <span v-if="item.raw.parent_path" class="text-truncate">
                            ينتمي إلى: <strong class="text-slate-700">{{ item.raw.parent_path }}</strong>
                          </span>
                          <span v-else class="text-slate-400">قسم رئيسي</span>
                        </div>
                        <div v-if="item.raw.synonyms?.length" class="text-caption text-grey mt-0.5">
                          <v-icon icon="ri-price-tag-3-line" size="10" class="me-1" />
                          {{ item.raw.synonyms.join(', ') }}
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </AppAutocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <AppAutocomplete
                  v-model="productData.brand_id"
                  :items="productData.brand ? [productData.brand] : []"
                  label="العلامة التجارية"
                  help-text="الماركة أو الشركة المصنعة للمنتج."
                  api-endpoint="brands"
                  item-title="name"
                  item-value="id"
                  can-create
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #subtitle>
                        <div v-if="item.raw.synonyms?.length" class="text-caption text-grey">
                          <v-icon icon="ri-price-tag-3-line" size="12" class="me-1" />
                          {{ item.raw.synonyms.join(', ') }}
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </AppAutocomplete>
              </v-col>
              <v-col cols="12">
                <AppTextarea v-model="productData.desc" label="وصف موجز" placeholder="اكتب وصفاً مختصراً للمنتج يظهر في قوائم البحث..." rows="3" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Digital Product Details (Smart Fields) -->
        <v-expand-transition>
          <v-card v-if="productData.product_type === 'digital'" border flat class="mb-2">
            <div class="pa-4 mb-2 bg-info-lighten-5 rounded-t-lg border-b d-flex align-center">
              <v-icon icon="ri-download-cloud-2-line" color="info" class="me-2" />
              <span class="text-subtitle-2 font-weight-bold">تفاصيل المنتج الرقمي والتسليم</span>
            </div>
            <v-card-text class="pa-2">
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch v-model="productData.is_downloadable" label="قابل للتنزيل المباشر" color="primary" inset hide-details />
                </v-col>
                <v-col cols="12" md="6" v-if="productData.is_downloadable">
                  <AppInput
                    v-model="productData.download_url"
                    label="رابط التنزيل"
                    help-text="الرابط المباشر لتحميل الملف، سيتم تسليمه للعميل بعد الدفع."
                    placeholder="https://example.com/files/..."
                    prepend-inner-icon="ri-link"
                  />
                </v-col>
                <v-col cols="12" md="6" v-if="productData.is_downloadable">
                  <AppInput
                    v-model.number="productData.download_limit"
                    label="حد مرات التنزيل"
                    help-text="أقصى عدد مسموح به لتحميل الملف من نفس الرابط."
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
        <VariantManager :key="currentProductId || 'new'" v-model="productData.variants" :product-type="productData.product_type" />
      </v-col>

      <!-- Sidebar Options -->
      <v-col cols="12" lg="4">
        <!-- Status Card -->
        <v-expansion-panels class="mb-2">
          <v-expansion-panel class="border rounded-md overflow-hidden elevation-0">
            <v-expansion-panel-title class="pa-2 bg-grey-lighten-5 rounded-t-lg border-b min-height-28">
              <div class="d-flex align-center">
                <v-icon icon="ri-settings-4-line" color="grey-darken-1" size="14" class="me-2" />
                <span class="text-xxs font-weight-bold">حالة العرض والخيارات</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="pa-0">
              <v-card-text class="pa-2">
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex align-center justify-space-between pa-2 hover-bg">
                    <div>
                      <div class="text-body-2 font-weight-bold">
                        متاح للبيع
                        <AppFieldHelp text="تفعيل أو تعطيل بيع هذا المنتج بشكل كامل. إذا كان معطلاً، فلن تتمكن من بيعه أو عرضه." />
                      </div>
                      <div class="text-caption text-grey">تفعيل أو تعطيل ظهور المنتج</div>
                    </div>
                    <v-switch v-model="productData.active" color="primary" hide-details inset density="compact" />
                  </div>

                  <v-divider />

                  <div class="d-flex align-center justify-space-between pa-2 hover-bg">
                    <div>
                      <div class="text-body-2 font-weight-bold">
                        منتج مميز
                        <AppFieldHelp text="المنتجات المميزة تظهر عادة في بداية القوائم أو في أقسام خاصة لزيادة مبيعاتها." />
                      </div>
                      <div class="text-caption text-grey">عرض في الصفحة الرئيسية</div>
                    </div>
                    <v-switch v-model="productData.featured" color="primary" hide-details inset density="compact" />
                  </div>

                  <v-divider />

                  <div class="d-flex align-center justify-space-between pa-2 hover-bg">
                    <div>
                      <div class="text-body-2 font-weight-bold">
                        قابل للإرجاع
                        <AppFieldHelp text="حدد ما إذا كان مسموحاً للعميل إرجاع هذا المنتج بعد شرائه واسترداد مبلغه (ينطبق على سياسة الاسترجاع)." />
                      </div>
                      <div class="text-caption text-grey">السماح بإرجاع المنتج واسترداد قيمته</div>
                    </div>
                    <v-switch v-model="productData.returnable" color="primary" hide-details inset density="compact" />
                  </div>

                  <v-divider />

                  <div class="d-flex align-center justify-space-between pa-2 hover-bg">
                    <div>
                      <div class="text-body-2 font-weight-bold">
                        يظهر في المتجر
                        <AppFieldHelp text="إذا كان مفوضاً، سيتمكن العملاء من رؤية هذا المنتج وطلبه عبر متجرك الإلكتروني." />
                      </div>
                      <div class="text-caption text-grey">عرض المنتج في المتجر الإلكتروني</div>
                    </div>
                    <v-switch v-model="productData.is_active_in_store" color="primary" hide-details inset density="compact" />
                  </div>

                  <v-divider />

                  <div class="d-flex align-center justify-space-between pa-2 hover-bg">
                    <div>
                      <div class="text-body-2 font-weight-bold">
                        يظهر في المبيعات / POS
                        <AppFieldHelp text="يتحكم في إمكانية ظهور هذا المنتج للبائعين (الكاشير) في واجهة نقطة البيع السريعة." />
                      </div>
                      <div class="text-caption text-grey">عرض المنتج في فواتير البيع ونقاط البيع</div>
                    </div>
                    <v-switch v-model="productData.is_active_in_sales" color="primary" hide-details inset density="compact" />
                  </div>
                </div>
              </v-card-text>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Media Card -->
        <v-card border flat class="pb-2">
          <div class="pa-2 bg-grey-lighten-5 rounded-t-lg border-b d-flex align-center">
            <v-icon icon="ri-image-line" color="grey-darken-1" size="14" class="me-2" />
            <span class="text-xxs font-weight-bold">صور المنتج</span>
          </div>
          <v-card-text class="pa-2">
            <ProductMediaManager v-model="productData.images" v-model:primaryImageId="productData.primary_image_id" class="mt-1" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Duplicate Detection Dialog -->
    <AppDialog
      v-model="showDuplicateDialog"
      title="هذا المنتج موجود بالفعل!"
      icon="ri-error-warning-line"
      confirm-text="تعديل المنتج الموجود"
      cancel-text="تجاهل الاستمرار في الإضافة"
      confirm-color="warning"
      max-width="500"
      @confirm="confirmSwitchToEdit"
      @cancel="cancelNameSelection"
    >
      <div class="pa-4 text-center">
        <v-avatar color="warning-lighten-5" size="64" class="mb-4">
          <v-icon icon="ri-file-search-line" color="warning" size="32" />
        </v-avatar>
        <div class="text-h6 font-weight-bold mb-2">هل تريد تعديل "{{ existingProduct?.name }}"؟</div>
        <p class="text-body-2 text-grey-darken-1">تم العثور على المنتج "{{ existingProduct?.name }}" مسجل مسبقاً بهذا الاسم. هل ترغب في تعديله؟</p>
        <v-chip v-if="existingProduct?.category" size="small" color="primary" variant="tonal" class="mt-2">
          {{ existingProduct.category.name }}
        </v-chip>
      </div>
    </AppDialog>
  </v-form>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '../store/product.store';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppFieldHelp from '@/components/common/AppFieldHelp.vue';
import VariantManager from './VariantManager.vue';
import ProductMediaManager from './ProductMediaManager.vue';
import { useUserStore } from '@/stores/user';
const props = defineProps({
  productId: {
    type: [String, Number],
    default: null,
  },
  isDialog: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['success', 'cancel']);

const router = useRouter();
const productStore = useProductStore();
const userStore = useUserStore();
const { saveProduct, fetchProduct } = productStore;

const currentProductId = ref(props.productId);

const isEdit = computed(() => !!currentProductId.value);
const loading = ref(false);
const isValid = ref(false);
const form = ref(null);

// Duplicate detection state
const showDuplicateDialog = ref(false);
const existingProduct = ref(null);

// --- State Initialization ---
const getInitialProductData = () => ({
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
  is_active_in_store: false,
  is_active_in_sales: true,
  images: [],
  primary_image_id: null,
  variants: [],
});

const productData = ref(getInitialProductData());

// Ensure we always have at least one variant when creating a product
if (!props.productId) {
  productData.value.variants = [
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
  ];
}

// Sync internal ID if prop changes (for robustness)
watch(
  () => props.productId,
  newId => {
    currentProductId.value = newId;
  },
  { immediate: true }
);

// Ensure there is always at least one variant when creating/editing
watch(
  () => productData.value.variants,
  newVariants => {
    if (!newVariants || newVariants.length === 0) {
      const defaultWarehouseId = productStore.defaultWarehouseId || null;
      productData.value.variants = [
        {
          purchase_price: 0,
          wholesale_price: 0,
          retail_price: 0,
          profit_margin: 0,
          sku: '',
          barcode: '',
          stocks: [{ warehouse_id: defaultWarehouseId, quantity: 0 }],
          attributes: [{ attribute_id: null, attribute_value_id: null }],
          images: [],
          primary_image_id: null,
        },
      ];
    }
  },
  { deep: true }
);

const productTypes = computed(() => {
  const isDigitalEnabled = userStore.currentCompany?.settings?.enable_digital_products;
  const list = [
    { label: 'منتج مادي (مخزني)', value: 'physical', icon: 'ri-archive-line', description: 'منتجات ملموسة تتطلب شحن وإدارة مخزون' },
  ];
  if (isDigitalEnabled || productData.value?.product_type === 'digital') {
    list.push({
      label: 'منتج رقمي (غير مخزني)',
      value: 'digital',
      icon: 'ri-file-download-line',
      description: 'منتجات غير ملموسة يتم تسليمها عبر البريد أو رابط',
    });
  }
  return list;
});

const handleNameSelect = val => {
  // Only trigger if we are not already editing
  if (val && typeof val === 'object' && !isEdit.value) {
    existingProduct.value = val;
    showDuplicateDialog.value = true;
    productData.value.name = val.name;
  }
};

const confirmSwitchToEdit = () => {
  if (existingProduct.value) {
    // Navigate and let ProductFormPage remount this component
    router.replace({
      name: 'product-edit',
      params: { id: existingProduct.value.id },
    });
  }
  showDuplicateDialog.value = false;
};

const cancelNameSelection = () => {
  productData.value.name = '';
  existingProduct.value = null;
  showDuplicateDialog.value = false;
};

const loadProductData = async id => {
  if (!id) return;
  loading.value = true;
  try {
    const data = await fetchProduct(id);
    if (data) {
      // Create a fresh object to ensure no state leakage
      const mappedData = {
        ...getInitialProductData(), // Start with clean defaults
        ...data,
        category_id: data.category?.id || data.category_id,
        brand_id: data.brand?.id || data.brand_id,
        images: data.images || [],
        primary_image_id: data.images?.find(img => img.is_primary)?.id || null,
        variants:
          (data.variants && data.variants.length > 0)
            ? data.variants.map(v => {
                // Deduplicate stocks by warehouse_id
                const stockMap = new Map();

                (v.stocks || []).forEach(s => {
                  const wid = s.warehouse?.id || s.warehouse_id;
                  if (!wid) return;

                  const existing = stockMap.get(wid);
                  // Priority: 1. Has ID, 2. Has quantity > 0, 3. Priority to first found
                  if (!existing || (!existing.id && s.id) || (existing.quantity === 0 && s.quantity > 0)) {
                    stockMap.set(wid, {
                      ...s,
                      warehouse_id: wid,
                    });
                  }
                });

                return {
                  ...v,
                  purchase_price: v.purchase_price || 0,
                  images: v.images || [],
                  primary_image_id: v.images?.find(img => img.is_primary)?.id || null,
                  stocks: Array.from(stockMap.values()),
                };
              })
            : [
                {
                  purchase_price: 0,
                  wholesale_price: 0,
                  retail_price: 0,
                  profit_margin: 0,
                  sku: '',
                  barcode: '',
                  stocks: [{ warehouse_id: productStore.defaultWarehouseId || null, quantity: 0 }],
                  attributes: [{ attribute_id: null, attribute_value_id: null }],
                  images: [],
                  primary_image_id: null,
                },
              ],
      };

      // Force set the value
      productData.value = mappedData;
    }
  } catch (error) {
    console.error('Failed to load product data:', error);
  } finally {
    loading.value = false;
  }
};

// ... existing logic ...

const primaryImageUrl = computed(() => {
  if (productData.value.images?.length > 0) {
    const primary = productData.value.images.find(img => img.id === productData.value.primary_image_id || img.is_primary);
    return primary ? primary.url : productData.value.images[0].url;
  }
  return null;
});

// This part is now handled by getInitialProductData and loadProductData

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

    const response = await saveProduct(payload, currentProductId.value);
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
    await loadProductData(currentProductId.value);
  } else {
    // Initialization for NEW product
    try {
      const warehouseId = await productStore.fetchDefaultWarehouse();

      // Critical: Re-check isEdit after async await to avoid race condition
      if (isEdit.value) return;

      // Update warehouse ID in the existing initial variants if they don't have one
      if (warehouseId && productData.value.variants.length > 0) {
        productData.value.variants.forEach(v => {
          if (v.stocks && v.stocks.length > 0) {
            v.stocks.forEach(s => {
              if (s.warehouse_id === null || s.warehouse_id === undefined) {
                s.warehouse_id = warehouseId;
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch default warehouse:', error);
    }
  }
});

onUnmounted(() => {
  // Clean up keyboard shortcuts
  window.removeEventListener('keydown', handleKeyboardShortcuts);
});
</script>

<style scoped>
.text-xxs {
  font-size: 10px !important;
}

.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}

.hover-bg:hover {
  background-color: var(--v-theme-surface-variant);
}

.min-height-28 {
  min-height: 28px !important;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

:deep(.v-expansion-panel-title) {
  min-height: 28px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}

/* RTL Breadcrumbs */
:deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.5;
}
</style>
