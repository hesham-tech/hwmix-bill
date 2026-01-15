<template>
  <div class="product-form-overhaul">
    <!-- Premium Sticky Header -->
    <div class="sticky-header pa-3 pa-md-4 glass-blur border-b">
      <div class="container-premium d-flex flex-column flex-sm-row align-start align-sm-center justify-space-between mx-auto gap-3">
        <div class="d-flex align-center gap-2 gap-md-4">
          <v-btn icon="ri-arrow-right-line" variant="text" size="small" @click="$emit('cancel')" />
          <div>
            <div class="text-caption text-grey d-none d-sm-flex align-center gap-1">
              <span>المنتجات</span>
              <v-icon icon="ri-arrow-left-s-line" size="14" />
              <span>إضافة منتج جديد</span>
            </div>
            <h1 class="text-subtitle-1 text-sm-h6 font-weight-black mb-0 truncate-title">
              {{ localData.name || 'منتج جديد' }}
            </h1>
          </div>
        </div>

        <div class="d-flex align-center justify-space-between justify-sm-end w-100 w-sm-auto gap-2 gap-md-3">
          <div class="d-flex align-center gap-2">
            <v-chip v-if="localData.active" color="success" size="x-small" variant="flat" class="font-weight-bold">نشط</v-chip>
            <v-chip v-else color="grey" size="x-small" variant="flat" class="font-weight-bold">مسودة</v-chip>
          </div>
          <div class="d-flex align-center gap-1 gap-md-2">
            <v-btn variant="text" color="grey-darken-1" size="small" class="font-weight-bold d-none d-sm-flex" @click="$emit('cancel')">تجاهل</v-btn>
            <v-btn v-if="$vuetify.display.xs" variant="text" color="grey-darken-1" icon="ri-close-line" @click="$emit('cancel')" />

            <v-btn
              color="primary"
              :size="$vuetify.display.mobile ? 'default' : 'large'"
              rounded="xl"
              :class="{ 'px-1': $vuetify.display.xs, 'px-4 px-md-8': !$vuetify.display.xs }"
              class="font-weight-black elevation-4"
              :loading="loading"
              :icon="$vuetify.display.xs ? 'ri-save-line' : false"
              :prepend-icon="!$vuetify.display.xs ? 'ri-shield-check-line' : false"
              @click="handleSubmit"
            >
              <template v-if="!$vuetify.display.xs">
                حفظ
                <span class="d-none d-md-inline ms-1">المنتج</span>
              </template>
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dual-Pane Content -->
    <v-form ref="form" @submit.prevent="handleSubmit" class="main-content-wrapper pa-6 bg-grey-lighten-5 min-h-screen">
      <div class="container-premium mx-auto">
        <v-row>
          <!-- Left Pane (Main Content) -->
          <v-col cols="12" lg="8">
            <div class="d-flex flex-column gap-6">
              <!-- Individual cards with minimal padding -->
              <ProductGeneral v-model="localData" />

              <!-- Media Manager -->
              <v-card variant="flat" class="pa-1 rounded-xl border bg-white">
                <div class="d-flex align-center gap-2 mb-2">
                  <v-avatar color="secondary-lighten-5" rounded="lg" size="32">
                    <v-icon icon="ri-image-2-line" color="secondary" size="18" />
                  </v-avatar>
                  <h3 class="text-subtitle-2 font-weight-black">معرض الصور</h3>
                </div>
                <ProductMedia v-model="localData.images" />
              </v-card>

              <!-- Pricing & Inventory -->
              <ProductPricing v-model="localData" :warehouses="warehouses" />

              <!-- Variants Builder -->
              <v-card variant="flat" class="pa-1 rounded-xl border bg-white mb-2">
                <ProductVariants v-model="localData.variants" :available-attributes="availableAttributes" />
              </v-card>
            </div>
          </v-col>

          <!-- Right Pane (Sidebar) -->
          <v-col cols="12" lg="4">
            <div class="sticky-sidebar d-flex flex-column gap-2">
              <!-- Category & Brand -->
              <v-card variant="flat" class="pa-1 rounded-xl border bg-white">
                <h3 class="text-subtitle-2 font-weight-black mb-2">التصنيف والبراند</h3>
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
                      :rules="[required]"
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
              <v-card variant="flat" class="pa-1 rounded-xl border bg-white">
                <h3 class="text-subtitle-2 font-weight-black mb-2">الحالة والظهور</h3>
                <v-list-item class="pa-0">
                  <template v-slot:prepend>
                    <v-icon icon="ri-eye-line" color="grey" size="18" />
                  </template>
                  <v-list-item-title class="text-caption">ظهور المنتج</v-list-item-title>
                  <template v-slot:append>
                    <v-switch v-model="localData.active" color="success" hide-details density="compact" />
                  </template>
                </v-list-item>
              </v-card>

              <!-- Tags / SEO -->
              <v-card variant="flat" class="pa-1 rounded-xl border bg-white">
                <h3 class="text-subtitle-2 font-weight-black mb-1">الكلمات الدلالية</h3>
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
                  density="compact"
                />
              </v-card>

              <!-- Internal Memo -->
              <v-card variant="flat" class="pa-1 rounded-xl border bg-white">
                <h3 class="text-subtitle-2 font-weight-black mb-1">ملاحظات داخلية</h3>
                <v-textarea
                  v-model="localData.internal_note"
                  variant="solo"
                  flat
                  bg-color="grey-lighten-4"
                  class="premium-input-field"
                  rows="2"
                  density="compact"
                />
              </v-card>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { required } from '@/utils/validators';
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
    // Only update localData if the value is functionally different
    // AND it wasn't just emitted by us (to prevent loops)
    if (JSON.stringify(newVal) !== JSON.stringify(localData.value)) {
      localData.value = {
        ...newVal,
        images: newVal.images || [],
        variants: newVal.variants || [],
        tags: newVal.tags || [],
        active: newVal.active ?? true,
      };
    }
  },
  { deep: true }
);

watch(
  localData,
  newVal => {
    // Check if the change actually came from user input or local mutation
    // and is different from current props to avoid cycling
    if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', newVal);
    }
  },
  { deep: true }
);

const form = ref(null);

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    emit('submit', localData.value);
  } else {
    // Scroll to first error
    const firstError = document.querySelector('.v-input--error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
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
}

.glass-blur {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px) saturate(180%);
}

.main-content-wrapper {
  padding: 12px !important;
}

@media (min-width: 960px) {
  .main-content-wrapper {
    padding: 4px !important;
  }

  .sticky-sidebar {
    position: sticky;
    top: 60px;
  }
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

.truncate-title {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 150px;
}

@media (min-width: 600px) {
  .truncate-title {
    max-width: 400px;
  }
}
</style>
