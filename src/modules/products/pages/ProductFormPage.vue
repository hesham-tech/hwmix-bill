<template>
  <v-container fluid>
    <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
      <v-row>
        <!-- Top Actions -->
        <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center gap-2">
            <v-btn icon="ri-arrow-right-line" variant="text" @click="router.back()" />
            <h1 class="text-h5 font-weight-bold">
              {{ isEdit ? 'تعديل منتج' : 'إضافة منتج جديد' }}
            </h1>
          </div>
          <div class="d-flex gap-2">
            <v-btn variant="outlined" @click="router.back()">إلغاء</v-btn>
            <v-btn color="primary" type="submit" :loading="loading" :disabled="!isValid" prepend-icon="ri-save-line"> حفظ المنتج </v-btn>
          </div>
        </v-col>

        <!-- General Info Section -->
        <v-col cols="12" md="8">
          <v-card class="mb-6 elevation-1 rounded-lg">
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <AppInput v-model="productData.name" label="اسم المنتج" placeholder="مثال: هاتف آيفون 15" required />
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
                  <AppTextarea v-model="productData.desc" label="وصف مختصر" rows="3" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Variant Manager -->
          <VariantManager v-model="productData.variants" />
        </v-col>

        <!-- Sidebar / Settings -->
        <v-col cols="12" md="4">
          <v-card class="mb-6 elevation-1 rounded-lg">
            <v-card-title class="text-subtitle-1 font-weight-bold">الحالة والخيارات</v-card-title>
            <v-card-text>
              <AppSwitch v-model="productData.active" label="المنتج نشط ومتاح للبيع" inset />
              <v-divider class="my-3" />
              <AppSwitch v-model="productData.featured" label="تمييز المنتج (Featured)" inset />
              <v-divider class="my-3" />
              <AppSwitch v-model="productData.returnable" label="قابل للاسترجاع" inset />
            </v-card-text>
          </v-card>

          <!-- Media Gallery (Future Integration) -->
          <v-card class="elevation-1 rounded-lg">
            <v-card-title class="text-subtitle-1 font-weight-bold">صور المنتج</v-card-title>
            <v-card-text>
              <div class="d-flex flex-column align-center justify-center border-dashed rounded-lg pa-8 bg-grey-lighten-4">
                <v-icon size="48" color="grey">ri-image-add-line</v-icon>
                <span class="text-caption mt-2 text-grey">سيتم دعم رفع الصور قريباً</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductStore } from '../store/product.store';
import AppInput from '@/components/common/AppInput.vue';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import VariantManager from '../components/VariantManager.vue';

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const { saveProduct, fetchProduct } = productStore;

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const isValid = ref(false);
const form = ref(null);

const productData = ref({
  name: '',
  category_id: null,
  brand_id: null,
  desc: '',
  active: true,
  featured: false,
  returnable: true,
  variants: [
    {
      purchase_price: 0,
      wholesale_price: 0,
      retail_price: 0,
      sku: '',
      barcode: '',
      stocks: [{ warehouse_id: null, quantity: 0 }],
      attributes: [],
    },
  ],
});

const handleSubmit = async () => {
  if (!isValid.value) return;

  loading.value = true;
  try {
    const response = await saveProduct(productData.value, route.params.id);
    if (response.status) {
      router.push({ name: 'products' });
    }
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const data = await fetchProduct(route.params.id);
      if (data) {
        productData.value = {
          ...data,
          category_id: data.category?.id || data.category_id,
          brand_id: data.brand?.id || data.brand_id,
          variants: data.variants?.map(v => ({
            ...v,
            purchase_price: v.purchase_price || v.cost || 0,
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
    // New Product: Set default warehouse
    const warehouseId = await productStore.fetchDefaultWarehouse();
    if (warehouseId && productData.value.variants[0].stocks[0]) {
      productData.value.variants[0].stocks[0].warehouse_id = warehouseId;
    }
  }
});
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
.border-dashed {
  border: 2px dashed rgba(0, 0, 0, 0.12);
}
</style>
