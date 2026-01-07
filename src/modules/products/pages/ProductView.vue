<template>
  <div class="product-view-page">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <AppButton icon="ri-arrow-right-line" variant="text" color="secondary" @click="handleBack" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-bold">{{ product?.name }}</h1>
          <p class="text-body-1 text-grey" v-if="product">{{ product.sku }}</p>
        </div>
      </div>
      <div class="d-flex gap-2 no-print">
        <AppButton color="primary" prepend-icon="ri-edit-line" @click="handleEdit"> تعديل المنتج </AppButton>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-center align-center py-12">
      <LoadingSpinner />
    </div>

    <v-row v-else-if="product">
      <v-col cols="12" md="8">
        <AppCard title="تفاصيل المنتج" icon="ri-information-line" class="mb-6">
          <v-row>
            <v-col cols="12" sm="6">
              <div class="text-caption text-grey mb-1">الفئة</div>
              <div class="font-weight-bold text-h6">{{ product.category?.name || 'غير محددة' }}</div>
            </v-col>
            <v-col cols="12" sm="6">
              <div class="text-caption text-grey mb-1">العلامة التجارية</div>
              <div class="font-weight-bold text-h6">{{ product.brand?.name || 'بدون ماركة' }}</div>
            </v-col>
            <v-col cols="12">
              <v-divider class="my-3" />
              <div class="text-caption text-grey mb-2">وصف المنتج</div>
              <div class="text-body-1 line-height-relaxed">{{ product.description || 'لا يوجد وصف متاح لهذا المنتج.' }}</div>
            </v-col>
          </v-row>
        </AppCard>

        <AppCard title="التسعير والضرائب" icon="ri-money-dollar-circle-line" class="mb-6">
          <v-row>
            <v-col cols="12" md="4">
              <div class="text-caption text-grey mb-1">سعر التكلفة</div>
              <div class="text-h5 font-weight-bold">{{ formatCurrency(product.cost_price) }}</div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-caption text-grey mb-1">سعر البيع</div>
              <div class="text-h5 font-weight-bold text-success">{{ formatCurrency(product.selling_price) }}</div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-caption text-grey mb-1">نسبة الضريبة</div>
              <div class="text-h5 font-weight-bold">{{ product.tax_rate }}%</div>
            </v-col>
          </v-row>
        </AppCard>

        <AppCard title="تفاصيل المخزون" icon="ri-archive-line">
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-caption text-grey mb-1">المخزن الافتراضي</div>
              <div class="font-weight-bold text-h6">
                <v-icon icon="ri-building-line" size="small" class="me-1" />
                {{ product.warehouse?.name || 'غير محدد' }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="text-caption text-grey mb-1">الكمية المتوفرة</div>
              <v-chip :color="getStockColor(product.stock_quantity)" variant="flat" class="px-4 font-weight-bold">
                <v-icon :icon="getStockIcon(product.stock_quantity)" size="small" class="me-1" />
                {{ product.stock_quantity || 0 }} وحدة
              </v-chip>
            </v-col>
          </v-row>
        </AppCard>
      </v-col>

      <v-col cols="12" md="4">
        <AppCard title="الحالة والصورة" icon="ri-image-line">
          <div class="text-center">
            <div class="pa-2 border rounded-lg bg-grey-lighten-5 mb-4 overflow-hidden">
              <v-img v-if="product.image" :src="product.image" cover height="300" class="rounded" />
              <div v-else class="d-flex flex-column align-center justify-center py-12">
                <v-icon icon="ri-image-line" size="80" color="grey-lighten-2" />
                <div class="text-caption text-grey mt-2">لا توجد صورة للمنتج</div>
              </div>
            </div>

            <v-chip :color="product.is_active ? 'success' : 'error'" variant="flat" class="px-6 font-weight-bold">
              {{ product.is_active ? 'نشط متاح للبيع' : 'غير نشط' }}
            </v-chip>
          </div>
        </AppCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductsData } from '../composables/useProductsData';
import AppButton from '@/components/common/AppButton.vue';
import AppCard from '@/components/common/AppCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const router = useRouter();
const route = useRoute();
const { getProduct } = useProductsData();

const product = ref(null);
const loading = ref(true);

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const getStockColor = quantity => {
  if (!quantity || quantity === 0) return 'error';
  if (quantity < 10) return 'warning';
  return 'success';
};

const getStockIcon = quantity => {
  if (!quantity || quantity === 0) return 'ri-close-circle-line';
  if (quantity < 10) return 'ri-error-warning-line';
  return 'ri-checkbox-circle-line';
};

const handleBack = () => {
  router.push('/products');
};

const handleEdit = () => {
  router.push(`/products/${route.params.id}/edit`);
};

const loadProduct = async () => {
  loading.value = true;
  try {
    const response = await getProduct(route.params.id);
    product.value = response.data;
  } catch (error) {
    console.error('Error loading product:', error);
    router.push('/products');
  } finally {
    loading.value = false;
  }
};

onMounted(loadProduct);
</script>

<style scoped></style>
