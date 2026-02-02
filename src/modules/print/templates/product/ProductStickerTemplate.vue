<template>
  <div class="sticker-page">
    <div v-for="(item, index) in items" :key="index" class="product-sticker">
      <div class="sticker-content">
        <div class="company-name">{{ companyName }}</div>
        <div class="product-name">{{ item.productName }}</div>
        <div class="barcode-container">
          <vue-barcode :value="item.barcode" :options="barcodeOptions" tag="svg" />
        </div>
        <div class="price-container">
          <span class="price-label">السعر:</span>
          <span class="price-value">{{ item.price }} {{ currency }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import VueBarcode from 'vue3-barcode';

const props = defineProps({
  items: { type: Array, required: true },
  companyName: { type: String, default: '' },
  currency: { type: String, default: 'EGP' },
  printFormat: { type: String, default: 'sticker' },
});

const barcodeOptions = {
  width: 1.5,
  height: 40,
  displayValue: true,
  fontSize: 12,
  margin: 0,
  background: 'transparent',
};
</script>

<style scoped>
.product-sticker {
  width: 40mm;
  height: 25mm;
  padding: 1mm;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  direction: rtl;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  background: white;
  page-break-after: always;
}

.sticker-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.company-name {
  font-size: 8px;
  font-weight: bold;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-name {
  font-size: 10px;
  font-weight: bold;
  line-height: 1.1;
  max-height: 2.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.barcode-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 1px 0;
}

.barcode-container svg {
  max-width: 100%;
  height: auto;
}

.price-container {
  border-top: 0.5px dashed #ccc;
  padding-top: 1px;
  display: flex;
  justify-content: center;
  gap: 3px;
  font-size: 11px;
  font-weight: black;
}

.price-value {
  color: #000;
}
</style>
