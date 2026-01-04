<template>
  <div class="product-create-page">
    <CanView permission="products.create" show-message>
      <div class="page-header mb-6">
        <h1 class="text-h4 font-weight-bold">منتج جديد</h1>
        <p class="text-body-1 text-grey">إضافة منتج جديد للمخزون</p>
      </div>

      <AppCard>
        <ProductForm @save="handleSave" @cancel="handleCancel" />
      </AppCard>
    </CanView>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { AppCard } from '@/components';
import CanView from '@/components/common/CanView.vue';
import ProductForm from '../components/ProductForm.vue';
import { productService } from '@/api';
import { toast } from 'vue3-toastify';

const router = useRouter();

const handleSave = async data => {
  try {
    await productService.save(data);
    toast.success('تم إضافة المنتج بنجاح');
    router.push('/products');
  } catch (error) {
    toast.error('فشل إضافة المنتج');
  }
};

const handleCancel = () => {
  router.push('/products');
};
</script>

<style scoped>
.product-create-page {
  padding: 24px;
}
</style>
