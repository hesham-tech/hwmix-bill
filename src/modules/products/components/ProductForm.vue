<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Basic Info Card -->
      <v-col cols="12" md="8">
        <v-card class="mb-4" border flat>
          <v-card-title>معلومات أساسية</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="localData.name" label="اسم المنتج *" :rules="[rules.required]" :error-messages="errors.name" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="localData.sku" label="SKU" placeholder="كود المنتج" :error-messages="errors.sku" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="localData.barcode" label="باركود" :error-messages="errors.barcode" />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="localData.category_id"
                  :items="categories"
                  item-title="name"
                  item-value="id"
                  label="الفئة *"
                  :rules="[rules.required]"
                  :error-messages="errors.category_id"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="localData.brand_id"
                  :items="brands"
                  item-title="name"
                  item-value="id"
                  label="العلامة التجارية"
                  clearable
                  :error-messages="errors.brand_id"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea v-model="localData.description" label="الوصف" rows="3" :error-messages="errors.description" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Pricing Card -->
        <v-card class="mb-4" border flat>
          <v-card-title>التسعير</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="localData.cost_price"
                  label="سعر التكلفة *"
                  type="number"
                  step="0.01"
                  prefix="ج.م"
                  :rules="[rules.required]"
                  :error-messages="errors.cost_price"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="localData.selling_price"
                  label="سعر البيع *"
                  type="number"
                  step="0.01"
                  prefix="ج.م"
                  :rules="[rules.required]"
                  :error-messages="errors.selling_price"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="localData.tax_rate"
                  label="نسبة الضريبة %"
                  type="number"
                  step="0.1"
                  suffix="%"
                  :error-messages="errors.tax_rate"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Stock Card -->
        <v-card border flat>
          <v-card-title>المخزون</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="localData.warehouse_id"
                  :items="warehouses"
                  item-title="name"
                  item-value="id"
                  label="المخزن *"
                  :rules="[rules.required]"
                  :error-messages="errors.warehouse_id"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="localData.stock_quantity"
                  label="الكمية *"
                  type="number"
                  :rules="[rules.required]"
                  :error-messages="errors.stock_quantity"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="localData.min_stock_level"
                  label="الحد الأدنى للمخزون"
                  type="number"
                  hint="سيتم التنبيه عند الوصول لهذا الحد"
                  persistent-hint
                  :error-messages="errors.min_stock_level"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-switch v-model="localData.track_stock" label="تتبع المخزون" color="primary" hide-details />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Settings Sidebar -->
      <v-col cols="12" md="4">
        <v-card class="mb-4" border flat>
          <v-card-title>الحالة والصورة</v-card-title>
          <v-card-text>
            <v-switch v-model="localData.is_active" label="نشط" color="success" class="mb-4" />

            <v-file-input v-model="imageFile" label="صورة المنتج" accept="image/*" prepend-icon="ri-image-line" @change="handleImageChange" />

            <v-img v-if="imagePreview || localData.image" :src="imagePreview || localData.image" max-height="200" class="mt-4 border rounded" cover />
          </v-card-text>
        </v-card>

        <!-- Form Actions -->
        <v-card border flat>
          <v-card-actions class="pa-4">
            <v-btn variant="text" @click="$emit('cancel')" block class="mb-2"> إلغاء </v-btn>
            <v-btn color="primary" type="submit" :loading="loading" block>
              {{ isEdit ? 'تحديث المنتج' : 'حفظ المنتج' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  brands: {
    type: Array,
    default: () => [],
  },
  warehouses: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel', 'image-change']);

const formRef = ref(null);
const localData = ref({ ...props.modelValue });
const imageFile = ref(null);
const imagePreview = ref(null);

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
};

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

const handleImageChange = e => {
  const file = e.target.files?.[0];
  if (file) {
    emit('image-change', file);
    const reader = new FileReader();
    reader.onload = res => {
      imagePreview.value = res.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (valid) {
    emit('submit', localData.value);
  }
};

defineExpose({
  validate: () => formRef.value.validate(),
});
</script>
