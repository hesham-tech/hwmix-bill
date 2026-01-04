<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Product Name -->
      <v-col cols="12" md="6">
        <AppInput v-model="form.name" label="اسم المنتج *" :rules="[required]" prepend-inner-icon="ri-product-hunt-line" />
      </v-col>

      <!-- SKU/Barcode -->
      <v-col cols="12" md="6">
        <AppInput v-model="form.sku" label="كود المنتج / Barcode" prepend-inner-icon="ri-barcode-line" />
      </v-col>

      <!-- Category -->
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="form.category_id"
          :items="categories"
          item-title="name"
          item-value="id"
          label="التصنيف"
          prepend-inner-icon="ri-folder-line"
          clearable
        />
      </v-col>

      <!-- Brand -->
      <v-col cols="12" md="6">
        <v-autocomplete
          v-model="form.brand_id"
          :items="brands"
          item-title="name"
          item-value="id"
          label="الماركة"
          prepend-inner-icon="ri-building-line"
          clearable
        />
      </v-col>

      <!--Price -->
      <v-col cols="12" md="4">
        <AppInput
          v-model.number="form.price"
          label="السعر *"
          type="number"
          :rules="[required, positiveNumber]"
          prepend-inner-icon="ri-money-dollar-circle-line"
          min="0"
          step="0.01"
        />
      </v-col>

      <!-- Cost -->
      <v-col cols="12" md="4">
        <AppInput v-model.number="form.cost" label="التكلفة" type="number" prepend-inner-icon="ri-coins-line" min="0" step="0.01" />
      </v-col>

      <!-- Stock Quantity -->
      <v-col cols="12" md="4">
        <AppInput
          v-model.number="form.stock"
          label="الكمية المتوفرة *"
          type="number"
          :rules="[required]"
          prepend-inner-icon="ri-stack-line"
          min="0"
        />
      </v-col>

      <!-- Min Stock -->
      <v-col cols="12" md="6">
        <AppInput
          v-model.number="form.min_stock"
          label="الحد الأدنى للمخزون"
          type="number"
          prepend-inner-icon="ri-alert-line"
          min="0"
          hint="تنبيه عند الوصول لهذا الحد"
          persistent-hint
        />
      </v-col>

      <!-- Unit -->
      <v-col cols="12" md="6">
        <v-select v-model="form.unit" :items="unitOptions" label="الوحدة" prepend-inner-icon="ri-ruler-line" />
      </v-col>

      <!-- Image Upload -->
      <v-col cols="12">
        <v-file-input v-model="imageFile" label="صورة المنتج" accept="image/*" prepend-icon="ri-image-line" show-size @change="handleImageUpload" />

        <div v-if="imagePreview" class="mt-2">
          <v-img :src="imagePreview" max-width="200" max-height="200" class="rounded" />
        </div>
      </v-col>

      <!-- Description -->
      <v-col cols="12">
        <v-textarea v-model="form.description" label="الوصف" rows="3" prepend-inner-icon="ri-file-text-line" />
      </v-col>

      <!-- Active Status -->
      <v-col cols="12">
        <v-switch v-model="form.is_active" label="منتج نشط" color="success" hide-details />
      </v-col>
    </v-row>

    <!-- Form Actions -->
    <FormActions :loading="loading" @cancel="$emit('cancel')" @submit="handleSubmit" />
  </v-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { AppInput, FormActions } from '@/components';
import { categoryService, brandService } from '@/api';
import { required, positiveNumber } from '@/utils/validators';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['save', 'cancel']);

const formRef = ref(null);
const loading = ref(false);
const categories = ref([]);
const brands = ref([]);
const imageFile = ref(null);
const imagePreview = ref(null);

const form = ref({
  name: '',
  sku: '',
  category_id: null,
  brand_id: null,
  price: 0,
  cost: 0,
  stock: 0,
  min_stock: 0,
  unit: 'قطعة',
  description: '',
  is_active: true,
  image: null,
  ...props.modelValue,
});

const unitOptions = ['قطعة', 'كيلو', 'متر', 'لتر', 'علبة', 'كرتونة', 'زجاجة'];

const handleImageUpload = event => {
  const file = imageFile.value?.[0];

  if (!file) {
    imagePreview.value = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  form.value.image = file;
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (!valid) return;

  loading.value = true;
  emit('save', form.value);
  loading.value = false;
};

// Load categories and brands
const loadData = async () => {
  try {
    const [categoriesRes, brandsRes] = await Promise.all([
      categoryService.getAll({ per_page: -1 }, { showToast: false }),
      brandService.getAll({ per_page: -1 }, { showToast: false }),
    ]);

    categories.value = categoriesRes.data;
    brands.value = brandsRes.data;
  } catch (error) {
    console.error('Error loading data:', error);
  }
};

// Watch for modelValue changes
watch(
  () => props.modelValue,
  newVal => {
    form.value = { ...form.value, ...newVal };

    // Set image preview if exists
    if (newVal.image_url) {
      imagePreview.value = newVal.image_url;
    }
  },
  { deep: true }
);

onMounted(() => {
  loadData();

  // Set existing image preview
  if (form.value.image_url) {
    imagePreview.value = form.value.image_url;
  }
});
</script>
