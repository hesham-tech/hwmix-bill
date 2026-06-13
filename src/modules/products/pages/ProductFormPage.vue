<template>
  <v-container fluid class="pa-0 bg-transparent">
    <!-- Error Alert for Mobile/Runtime Debugging -->
    <v-alert
      v-if="error"
      type="error"
      title="حدث خطأ أثناء تحميل نموذج المنتج"
      closable
      class="ma-2 text-xxs font-weight-bold"
      @click:close="error = null"
    >
      <div class="text-caption font-family-monospace" style="white-space: pre-wrap; direction: ltr; text-align: left;">
        <strong>Error:</strong> {{ error.message }}
        <br />
        <strong>Stack:</strong> {{ error.stack }}
      </div>
    </v-alert>

    <ProductForm
      v-if="!error"
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
import ProductForm from '../components/ProductForm.vue';

const router = useRouter();
const route = useRoute();
const error = ref(null);

const productId = computed(() => route.params.id);

onErrorCaptured((err) => {
  error.value = err;
  console.error('Captured in ProductFormPage:', err);
  return false; // Prevent propagating further
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
