<template>
  <v-container fluid class="pa-0 bg-transparent">
    <ProductForm
      :key="productId || 'new'"
      :product-id="productId"
      @success="handleSuccess"
      @cancel="handleCancel"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue3-toastify';
import ProductForm from '../components/ProductForm.vue';

// صفحة نموذج المنتج لإضافة أو تعديل المنتجات مع معالجة الأخطاء بالتوستفاي.

const router = useRouter();
const route = useRoute();

const productId = computed(() => route.params.id);

onErrorCaptured((err) => {
  console.error('Captured in ProductFormPage:', err);
  
  // فحص أخطاء الاتصال بالخادم والتحقق
  const response = err.response || err.config?.metadata?.error?.response;
  if (response) {
    if (response.status === 422) {
      const message = response.data?.message || 'يرجى التحقق من صحة المدخلات والحقول.';
      toast.error(message);
    } else {
      toast.error('حدث خطأ في السيرفر، يرجى إعادة تحميل الصفحة.');
    }
  } else {
    // خطأ برمجي داخلي في الجافا سكريبت أو مشكلة تحميل
    toast.error('هناك خطأ ما، يرجى إعادة تحميل الصفحة.');
  }
  
  return false; // منع انتشار الخطأ في المتصفح وتأثيره على بقية العناصر
});

const handleSuccess = () => {
  if (productId.value) {
    router.push({ name: 'products' });
  }
};

const handleCancel = () => {
  router.back();
};
</script>
