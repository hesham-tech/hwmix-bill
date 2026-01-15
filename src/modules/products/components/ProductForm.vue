<template>
  <div class="product-form-overhaul">
    <!-- Premium Sticky Header -->
    <div class="sticky-header pa-4 glass-blur border-b">
      <div class="container-premium d-flex align-center justify-space-between mx-auto">
        <div class="d-flex align-center gap-4">
          <v-btn icon="ri-arrow-right-line" variant="text" @click="$emit('cancel')" />
          <div>
            <div class="text-caption text-grey d-flex align-center gap-1">
              <span>المنتجات</span>
              <v-icon icon="ri-arrow-left-s-line" size="14" />
              <span>إضافة منتج جديد</span>
            </div>
            <h1 class="text-h6 font-weight-black mb-0">
              {{ localData.name || 'منتج بدون اسم تحليلي' }}
            </h1>
          </div>
        </div>

        <div class="d-flex align-center gap-3">
          <v-chip v-if="localData.active" color="success" size="small" variant="flat" class="font-weight-bold">نشط</v-chip>
          <v-chip v-else color="grey" size="small" variant="flat" class="font-weight-bold">مسودة</v-chip>
          <v-divider vertical class="mx-2" />
          <v-btn variant="text" color="grey-darken-1" class="font-weight-bold" @click="$emit('cancel')">تجاهل</v-btn>
          <v-btn
            color="primary"
            size="large"
            rounded="xl"
            class="px-8 font-weight-black elevation-4"
            :loading="loading"
            prepend-icon="ri-shield-check-line"
            @click="handleSubmit"
          >
            حفظ المنتج النهائي
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Main Dual-Pane Content -->
    <div class="main-content-wrapper pa-6 bg-grey-lighten-5 min-h-screen">
      <div class="container-premium mx-auto">
        <v-row>
          <!-- Left Pane (Main Content) -->
          <v-col cols="12" lg="8">
            <div class="d-flex flex-column gap-6">
              <!-- General Info -->
              <ProductGeneral v-model="localData" />

              <!-- Media Manager -->
              <v-card variant="flat" class="pa-6 rounded-xl border bg-white">
                <div class="d-flex align-center gap-3 mb-6">
                  <v-avatar color="secondary-lighten-5" rounded="lg">
                    <v-icon icon="ri-image-2-line" color="secondary" />
                  </v-avatar>
                  <h3 class="text-subtitle-1 font-weight-black">معرض الصور</h3>
                </div>
                <ProductMedia v-model="localData.images" />
              </v-card>

              <!-- Pricing & Inventory -->
              <ProductPricing v-model="localData" :warehouses="warehouses" />

              <!-- Variants Builder -->
              <v-card variant="flat" class="pa-6 rounded-xl border bg-white mb-6">
                <ProductVariants v-model="localData.variants" :available-attributes="availableAttributes" />
              </v-card>
            </div>
          </v-col>

          <!-- Right Pane (Sidebar) -->
          <v-col cols="12" lg="4">
            <div class="sticky-sidebar d-flex flex-column gap-6">
              <!-- Category & Brand -->
              <v-card variant="flat" class="pa-6 rounded-xl border bg-white">
                <h3 class="text-subtitle-1 font-weight-black mb-6">التصنيف والبراند</h3>
                <v-row dense>
                  <v-col cols="12">
                    <div class="d-flex align-center justify-space-between mb-1">
                      <label class="text-caption font-weight-bold text-grey-darken-1">الفئة الأساسية</label>
                      <QuickAddCategory @saved="handleCategorySaved" />
                    </div>
                    <v-autocomplete
                      v-model="localData.category_id"
                      :items="categories"
                      item-title="name"
                      item-value="id"
                      placeholder="اختر الفئة..."
                      variant="solo"
                      flat
                      bg-color="grey-lighten-4"
                      class="premium-input-field"
                    />
                  </v-col>
                  <v-col cols="12">
                    <div class="d-flex align-center justify-space-between mb-1">
                      <label class="text-caption font-weight-bold text-grey-darken-1">العلامة التجارية</label>
                      <QuickAddBrand @saved="handleBrandSaved" />
                    </div>
                    <v-autocomplete
                      v-model="localData.brand_id"
                      :items="brands"
                      item-title="name"
                      item-value="id"
                      placeholder="اختر البراند..."
                      variant="solo"
                      flat
                      bg-color="grey-lighten-4"
                      class="premium-input-field"
                    />
                  </v-col>
                </v-row>
              </v-card>

              <!-- Stats / Visibility -->
              <v-card variant="flat" class="pa-6 rounded-xl border bg-white">
                <h3 class="text-subtitle-1 font-weight-black mb-4">الحالة والظهور</h3>
                <v-list-item class="pa-0">
                  <template v-slot:prepend>
                    <v-icon icon="ri-eye-line" color="grey" />
                  </template>
                  <v-list-item-title class="text-body-2">ظهور المنتج</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">تحديد ما إذا كان المنتج متاحاً للعملاء</v-list-item-subtitle>
                  <template v-slot:append>
                    <v-switch v-model="localData.active" color="success" hide-details density="compact" />
                  </template>
                </v-list-item>
              </v-card>

              <!-- Tags / SEO -->
              <v-card variant="flat" class="pa-6 rounded-xl border bg-white">
                <h3 class="text-subtitle-1 font-weight-black mb-1">الكلمات الدلالية</h3>
                <p class="text-caption text-grey mb-4">تساعد على تسريع البحث داخل النظام</p>
                <v-combobox
                  v-model="localData.tags"
                  multiple
                  chips
                  closable-chips
                  variant="solo"
                  flat
                  bg-color="grey-lighten-4"
                  placeholder="أضف تاجات..."
                  class="premium-input-field"
                />
              </v-card>

              <!-- Internal Memo -->
              <v-card variant="flat" class="pa-6 rounded-xl border bg-white">
                <h3 class="text-subtitle-1 font-weight-black mb-1">ملاحظات داخلية</h3>
                <p class="text-caption text-grey mb-4">ملاحظات لا يراها العميل</p>
                <v-textarea v-model="localData.internal_note" variant="solo" flat bg-color="grey-lighten-4" class="premium-input-field" rows="3" />
              </v-card>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ProductGeneral from './ProductGeneral.vue';
import ProductMedia from './ProductMedia.vue';
import ProductPricing from './ProductPricing.vue';
import ProductVariants from './ProductVariants.vue';
import QuickAddCategory from './QuickAddCategory.vue';
import QuickAddBrand from './QuickAddBrand.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  categories: { type: Array, default: () => [] },
  brands: { type: Array, default: () => [] },
  warehouses: { type: Array, default: () => [] },
  availableAttributes: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'refresh-categories', 'refresh-brands']);

const localData = ref({
  ...props.modelValue,
  images: props.modelValue.images || [],
  variants: props.modelValue.variants || [],
  tags: props.modelValue.tags || [],
  active: props.modelValue.active ?? true,
});

watch(
  () => props.modelValue,
  newVal => {
    localData.value = { ...newVal };
  },
  { deep: true }
);

watch(
  localData,
  newVal => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const handleSubmit = () => {
  emit('submit', localData.value);
};

const handleCategorySaved = category => {
  emit('refresh-categories');
  localData.value.category_id = category.id;
};

const handleBrandSaved = brand => {
  emit('refresh-brands');
  localData.value.brand_id = brand.id;
};
</script>

<style scoped>
.product-form-overhaul {
  background-color: #f8fafc;
}

.container-premium {
  max-width: 1300px;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 80px;
}

.glass-blur {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px) saturate(180%);
}

.sticky-sidebar {
  position: sticky;
  top: 100px;
}

.premium-input-field :deep(.v-field) {
  border-radius: 12px !important;
  border: 1px solid transparent !important;
  transition: all 0.2s ease;
}

.premium-input-field :deep(.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.min-h-screen {
  min-height: 100vh;
}
</style>
