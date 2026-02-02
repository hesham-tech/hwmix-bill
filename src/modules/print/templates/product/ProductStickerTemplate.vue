<template>
  <div class="sticker-page">
    <div v-for="(item, index) in preparedItems" :key="item.id" class="product-sticker">
      <div class="company-name">{{ companyName || 'Hwnix Business' }}</div>
      <div class="product-name">{{ item.productName }}</div>
      <div class="barcode-wrapper">
        <img :id="`bc-img-${index}`" :src="item.barcodeImage" alt="barcode" class="barcode-img" />
        <div class="barcode-text">{{ item.barcode + '/' + Math.trunc(item.price) }}</div>
      </div>
      <!-- <div class="price-box">
        <span class="price-val">{{ formatCurrency(item.price) }}</span>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import JsBarcode from 'jsbarcode';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  items: { type: Array, required: true },
  companyName: { type: String, default: '' },
  currency: { type: String, default: 'EGP' },
  printFormat: { type: String, default: 'sticker' },
});

// Move cache outside for persistence across multiple mounts/print jobs
const barcodeCache = new Map();

function generateBarcodeBase64(value) {
  if (!value) return '';

  // Return from cache if already generated
  if (barcodeCache.has(value)) {
    return barcodeCache.get(value);
  }

  const canvas = document.createElement('canvas');
  try {
    JsBarcode(canvas, value, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: false,
      margin: 0,
      background: 'transparent',
      lineColor: '#000',
    });

    const dataUrl = canvas.toDataURL('image/png');
    barcodeCache.set(value, dataUrl);
    return dataUrl;
  } catch (e) {
    console.error('Barcode generation failed:', e);
    return '';
  }
}

const preparedItems = computed(() => {
  // ✅ Safety: Limit batch rendering to 500 stickers to prevent browser freeze
  const safeItems = props.items.slice(0, 500);

  return safeItems.map(item => ({
    ...item,
    barcodeImage: generateBarcodeBase64(item.barcode),
  }));
});
</script>
<style scoped>
/* Styles are managed via TemplateRegistry in templates/product/index.ts */
</style>
