<template>
  <v-container fluid class="pa-0 bg-transparent">
    <ProductForm :product-id="productId" @success="handleSuccess" @cancel="handleCancel" />
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ProductForm from '../components/ProductForm.vue';

const router = useRouter();
const route = useRoute();

const productId = computed(() => route.params.id);

const handleSuccess = () => {
  router.push({ name: 'products' });
};

const handleCancel = () => {
  router.back();
};
</script>
