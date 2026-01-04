<template>
  <div class="product-view-page">
    <CanView permission="products.view" show-message>
      <div class="page-header mb-6 d-flex justify-space-between align-center">
        <div>
          <h1 class="text-h4 font-weight-bold">{{ product?.name }}</h1>
          <p class="text-body-1 text-grey">SKU: {{ product?.sku || '-' }}</p>
        </div>

        <div class="d-flex gap-2">
          <CanView permission="products.update">
            <v-btn color="primary" prepend-icon="ri-edit-line" @click="handleEdit"> تعديل </v-btn>
          </CanView>
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="4">
          <!-- Product Image -->
          <AppCard>
            <v-img :src="product?.image_url || '/placeholder.png'" aspect-ratio="1" cover class="rounded" />
          </AppCard>

          <!-- Stock Status -->
          <AppCard title="حالة المخزون" icon="ri-stack-line" class="mt-4">
            <div class="pa-4">
              <div class="detail-item">
                <span>الكمية المتوفرة:</span>
                <v-chip :color="getStockColor(product?.stock)" size="small">
                  {{ product?.stock || 0 }}
                </v-chip>
              </div>
              <div class="detail-item">
                <span>الحد الأدنى:</span>
                <span>{{ product?.min_stock || 0 }}</span>
              </div>
            </div>
          </AppCard>
        </v-col>

        <v-col cols="12" md="8">
          <!-- Product Details -->
          <AppCard title="تفاصيل المنتج" icon="ri-information-line">
            <v-row class="pa-4">
              <v-col cols="12" md="6">
                <div class="detail-item">
                  <span class="text-grey">الاسم:</span>
                  <span class="font-weight-bold">{{ product?.name }}</span>
                </div>
                <div class="detail-item">
                  <span class="text-grey">الفئة:</span>
                  <span>{{ product?.category?.name || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="text-grey">الماركة:</span>
                  <span>{{ product?.brand?.name || '-' }}</span>
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <div class="detail-item">
                  <span class="text-grey">السعر:</span>
                  <span class="text-h6 text-success">{{ formatCurrency(product?.price) }}</span>
                </div>
                <div class="detail-item">
                  <span class="text-grey">التكلفة:</span>
                  <span>{{ formatCurrency(product?.cost) }}</span>
                </div>
                <div class="detail-item">
                  <span class="text-grey">الوحدة:</span>
                  <span>{{ product?.unit || 'قطعة' }}</span>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div class="pa-4" v-if="product?.description">
              <h3 class="text-h6 mb-2">الوصف</h3>
              <p>{{ product.description }}</p>
            </div>
          </AppCard>

          <!-- Variants -->
          <AppCard v-if="product?.variants?.length" title="المتغيرات" icon="ri-list-check" class="mt-4">
            <v-table>
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="variant in product.variants" :key="variant.id">
                  <td>{{ variant.name }}</td>
                  <td>{{ formatCurrency(variant.price) }}</td>
                  <td>{{ variant.stock }}</td>
                </tr>
              </tbody>
            </v-table>
          </AppCard>
        </v-col>
      </v-row>
    </CanView>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppCard } from '@/components';
import CanView from '@/components/common/CanView.vue';
import { productService } from '@/api';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const product = ref(null);

const getStockColor = stock => {
  if (stock === 0) return 'error';
  if (stock < 10) return 'warning';
  return 'success';
};

const handleEdit = () => {
  router.push(`/products/${route.params.id}/edit`);
};

onMounted(async () => {
  try {
    const response = await productService.getOne(route.params.id);
    product.value = response.data[0];
  } catch (error) {
    toast.error('فشل تحميل المنتج');
    router.push('/products');
  }
});
</script>

<style scoped>
.product-view-page {
  padding: 24px;
}

.detail-item {
  display: flex;
  justify-space-between;
  padding: 8px 0;
}
</style>
