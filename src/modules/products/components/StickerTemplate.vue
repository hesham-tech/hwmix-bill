<template>
  <div id="sticker-container" class="sticker-page">
    <component :is="'style'">{{ stickerStyles }}</component>

    <div v-for="n in Number(quantity)" :key="n" class="product-sticker">
      <div v-if="companyName" class="sticker-company">{{ companyName }}</div>

      <div class="sticker-product-name">{{ product.name }}</div>

      <div class="sticker-barcode-container">
        <!-- Placeholder for barcode - in a real app we might use a library like JsBarcode -->
        <div class="barcode-placeholder" style="font-family: 'Libre Barcode 39', cursive; font-size: 24px">
          {{ product.sku || product.id }}
        </div>
      </div>

      <div class="sticker-serial">SN: {{ serialNumber || product.sku }}</div>

      <div v-if="product.price" class="sticker-price">
        {{ formatCurrency(product.price) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters';
import { stickerStyles } from '../styles/stickerStyles';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  serialNumber: String,
  quantity: {
    type: [Number, String],
    default: 1,
  },
  companyName: String,
});
</script>

<style scoped>
/* Scoped styles for UI preview only */
.barcode-placeholder {
  border: 1px solid #eee;
  padding: 2px;
}
</style>
