<template>
  <div class="product-edit-page">
    <CanView permission="products.update" show-message>
      <div class="page-header mb-6">
        <h1 class="text-h4 font-weight-bold">تعديل منتج</h1>
        <p class="text-body-1 text-grey">تحديث بيانات المنتج</p>
      </div>

      <AppCard v-if="product">
        <ProductForm v-model="product" @save="handleSave" @cancel="handleCancel" />
      </AppCard>

      <AppSkeleton v-else type="form" />
    </CanView>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppCard, AppSkeleton } from '@/components';
import CanView from '@/components/common/CanView.vue';
import ProductForm from '../components/ProductForm.vue';
import { productService } from '@/api';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const product = ref(null);

const handleSave = async data => {
  try {
    await productService.save(data, route.params.id);
    toast.success('تم تحديث المنتج بنجاح');
    router.push(`/products/${route.params.id}`);
  } catch (error) {
    toast.error('فشل تحديث المنتج');
  }
};

const handleCancel = () => {
  router.push(`/products/${route.params.id}`);
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
.product-edit-page {
  padding: 24px;
}
</style>
