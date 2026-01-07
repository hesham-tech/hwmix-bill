<template>
  <div class="product-create-page">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <AppButton icon="ri-arrow-right-line" variant="text" color="secondary" @click="handleCancel" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-bold">{{ isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد' }}</h1>
          <p class="text-body-1 text-grey">{{ isEdit ? `تحديث بيانات المنتج: ${formData.name}` : 'إضافة منتج جديد للمخزون والبيع' }}</p>
        </div>
      </div>
    </div>

    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-row>
        <!-- Basic Info Card -->
        <v-col cols="12" md="8">
          <AppCard title="المعلومات الأساسية" icon="ri-information-line" class="mb-6">
            <v-row>
              <v-col cols="12">
                <AppInput
                  v-model="formData.name"
                  label="اسم المنتج بالعربية *"
                  placeholder="مثال: آيفون 15 برو"
                  :rules="[rules.required]"
                  :error-messages="errors.name"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput v-model="formData.sku" label="رمز SKU" placeholder="كود المنتج الداخلي" :error-messages="errors.sku" />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput v-model="formData.barcode" label="الباركود" placeholder="سحب الباركود أو إدخاله يدوياً" :error-messages="errors.barcode" />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.category_id"
                  :items="categories"
                  :loading="loadingCategories"
                  item-title="name"
                  item-value="id"
                  label="الفئة *"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="ri-folder-line"
                  :rules="[rules.required]"
                  :error-messages="errors.category_id"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.brand_id"
                  :items="brands"
                  :loading="loadingBrands"
                  item-title="name"
                  item-value="id"
                  label="العلامة التجارية"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="ri-award-line"
                  clearable
                  :error-messages="errors.brand_id"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="وصف المنتج"
                  rows="3"
                  variant="outlined"
                  density="comfortable"
                  :error-messages="errors.description"
                  hide-details
                />
              </v-col>
            </v-row>
          </AppCard>

          <!-- Pricing Card -->
          <AppCard title="التسعير والضرائب" icon="ri-money-dollar-circle-line" class="mb-6">
            <v-row>
              <v-col cols="12" md="4">
                <AppInput
                  v-model.number="formData.cost_price"
                  label="سعر التكلفة *"
                  type="number"
                  step="0.01"
                  prepend-inner-icon="ri-price-tag-3-line"
                  :rules="[rules.required]"
                  :error-messages="errors.cost_price"
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppInput
                  v-model.number="formData.selling_price"
                  label="سعر البيع *"
                  type="number"
                  step="0.01"
                  prepend-inner-icon="ri-hand-coin-line"
                  :rules="[rules.required]"
                  :error-messages="errors.selling_price"
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppInput
                  v-model.number="formData.tax_rate"
                  label="نسبة الضريبة"
                  type="number"
                  step="0.1"
                  prepend-inner-icon="ri-percent-line"
                  :error-messages="errors.tax_rate"
                />
              </v-col>

              <v-col v-if="profitMargin !== null" cols="12">
                <div
                  :class="`pa-4 rounded-lg d-flex align-center justify-space-between ${
                    profitMargin >= 0 ? 'bg-success-lighten-5 border-success' : 'bg-error-lighten-5 border-error'
                  } border`"
                  style="border-style: dashed !important"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="profitMargin >= 0 ? 'ri-line-chart-line' : 'ri-dislike-line'"
                      :color="profitMargin >= 0 ? 'success' : 'error'"
                      class="me-3"
                    />
                    <div>
                      <div class="text-caption" :class="profitMargin >= 0 ? 'text-success' : 'text-error'">تحليل هامش الربح المتوقع</div>
                      <div class="text-h6 font-weight-black" :class="profitMargin >= 0 ? 'text-success' : 'text-error'">
                        {{ profitAmount.toFixed(2) }} ج.م <span class="text-body-2 font-weight-bold">({{ profitMargin.toFixed(2) }}%)</span>
                      </div>
                    </div>
                  </div>
                  <v-chip v-if="profitMargin < 0" color="error" size="small" variant="flat">تحذير: بيع بخسارة</v-chip>
                </div>
              </v-col>
            </v-row>
          </AppCard>

          <!-- Stock Card -->
          <AppCard title="إدارة المخزون" icon="ri-archive-line">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.warehouse_id"
                  :items="warehouses"
                  :loading="loadingWarehouses"
                  item-title="name"
                  item-value="id"
                  label="المخزن الافتراضي *"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="ri-building-line"
                  :rules="[rules.required]"
                  :error-messages="errors.warehouse_id"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model.number="formData.stock_quantity"
                  label="الكمية المتوفرة حالياً *"
                  type="number"
                  prepend-inner-icon="ri-stack-line"
                  :rules="[rules.required]"
                  :error-messages="errors.stock_quantity"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model.number="formData.min_stock_level"
                  label="حد الانخفاض (تنبيه)"
                  type="number"
                  prepend-inner-icon="ri-notification-badge-line"
                  :error-messages="errors.min_stock_level"
                />
              </v-col>

              <v-col cols="12" md="6" class="d-flex align-center">
                <v-switch v-model="formData.track_stock" label="تفعيل تتبع المخزون" color="primary" hide-details class="ms-2" />
              </v-col>
            </v-row>
          </AppCard>
        </v-col>

        <!-- Settings Sidebar -->
        <v-col cols="12" md="4">
          <AppCard title="الحالة والصورة" icon="ri-image-edit-line">
            <div class="mb-6">
              <div class="text-caption text-grey mb-2">حالة ظهور المنتج</div>
              <div class="pa-4 border rounded-lg d-flex align-center justify-space-between bg-grey-lighten-5">
                <span :class="formData.is_active ? 'text-success' : 'text-error'" class="font-weight-bold">
                  {{ formData.is_active ? 'المنتج متاح للبيع' : 'المنتج غير متاح حالياً' }}
                </span>
                <v-switch v-model="formData.is_active" color="success" hide-details />
              </div>
            </div>

            <div class="mb-4">
              <div class="text-caption text-grey mb-2">صورة المنتج الرئيسية</div>
              <v-file-input
                v-model="imageFile"
                label="اختر صورة..."
                accept="image/*"
                prepend-icon=""
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="ri-camera-line"
                :error-messages="errors.image"
                @change="handleImageChange"
                hide-details
              />
            </div>

            <div v-if="imagePreview || formData.image" class="mt-4 pa-2 border rounded-lg overflow-hidden position-relative">
              <v-img :src="imagePreview || formData.image" cover height="250" class="rounded" />
              <AppButton
                v-if="imagePreview"
                icon="ri-close-line"
                size="x-small"
                color="error"
                variant="flat"
                class="position-absolute"
                style="top: 16px; left: 16px; border-radius: 4px"
                @click="clearImage"
              />
            </div>
          </AppCard>

          <div class="mt-6 d-flex flex-column gap-3">
            <AppButton color="primary" size="large" block :loading="saving" prepend-icon="ri-save-line" @click="handleSubmit">
              {{ isEdit ? 'تحديث بيانات المنتج' : 'حفظ المنتج الجديد' }}
            </AppButton>
            <AppButton variant="text" size="large" block color="secondary" @click="handleCancel"> إلغاء </AppButton>
          </div>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductsData } from '../composables/useProductsData';
import { useApi } from '@/composables/useApi';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const router = useRouter();
const route = useRoute();
const { getProduct, createProduct, updateProduct } = useProductsData();

const categoriesApi = useApi('/api/categories');
const brandsApi = useApi('/api/brands');
const warehousesApi = useApi('/api/warehouses');

const formRef = ref(null);
const saving = ref(false);
const errors = ref({});
const imageFile = ref(null);
const imagePreview = ref(null);

const categories = ref([]);
const brands = ref([]);
const warehouses = ref([]);
const loadingCategories = ref(false);
const loadingBrands = ref(false);
const loadingWarehouses = ref(false);

const formData = ref({
  name: '',
  sku: '',
  barcode: '',
  category_id: null,
  brand_id: null,
  description: '',
  cost_price: 0,
  selling_price: 0,
  tax_rate: 0,
  warehouse_id: null,
  stock_quantity: 0,
  min_stock_level: 10,
  track_stock: true,
  is_active: true,
  image: '',
});

const isEdit = computed(() => !!route.params.id);

const profitAmount = computed(() => {
  return formData.value.selling_price - formData.value.cost_price;
});

const profitMargin = computed(() => {
  if (!formData.value.cost_price || formData.value.cost_price === 0) return null;
  return (profitAmount.value / formData.value.cost_price) * 100;
});

const rules = {
  required: v => !!v || 'مطلوب',
};

const handleImageChange = event => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const clearImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
};

const loadCategories = async () => {
  loadingCategories.value = true;
  try {
    const response = await categoriesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    categories.value = response.data || [];
  } finally {
    loadingCategories.value = false;
  }
};

const loadBrands = async () => {
  loadingBrands.value = true;
  try {
    const response = await brandsApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    brands.value = response.data || [];
  } finally {
    loadingBrands.value = false;
  }
};

const loadWarehouses = async () => {
  loadingWarehouses.value = true;
  try {
    const response = await warehousesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    warehouses.value = response.data || [];
  } finally {
    loadingWarehouses.value = false;
  }
};

const loadProduct = async () => {
  if (!isEdit.value) return;

  try {
    const response = await getProduct(route.params.id);
    formData.value = {
      name: response.data.name || '',
      sku: response.data.sku || '',
      barcode: response.data.barcode || '',
      category_id: response.data.category_id || null,
      brand_id: response.data.brand_id || null,
      description: response.data.description || '',
      cost_price: response.data.cost_price || 0,
      selling_price: response.data.selling_price || 0,
      tax_rate: response.data.tax_rate || 0,
      warehouse_id: response.data.warehouse_id || null,
      stock_quantity: response.data.stock_quantity || 0,
      min_stock_level: response.data.min_stock_level || 10,
      track_stock: response.data.track_stock ?? true,
      is_active: response.data.is_active ?? true,
      image: response.data.image || '',
    };
  } catch (error) {
    console.error('Error loading product:', error);
    router.push('/products');
  }
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  errors.value = {};

  try {
    const payload = new FormData();
    Object.keys(formData.value).forEach(key => {
      if (formData.value[key] !== null && formData.value[key] !== '') {
        payload.append(key, formData.value[key]);
      }
    });

    if (imageFile.value && imageFile.value.length > 0) {
      payload.append('image', imageFile.value[0]);
    }

    if (isEdit.value) {
      await updateProduct(route.params.id, payload);
    } else {
      await createProduct(payload);
    }

    router.push('/products');
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push('/products');
};

onMounted(async () => {
  await Promise.all([loadCategories(), loadBrands(), loadWarehouses()]);
  if (isEdit.value) {
    await loadProduct();
  }
});
</script>

<style scoped></style>
