<template>
  <div class="thermal-receipt" dir="rtl">
    <!-- Header -->
    <div class="header text-center mb-4">
      <img v-if="company?.logo" :src="company.logo" class="logo mb-2" />
      <h2 class="company-name text-h6 font-weight-bold">{{ company?.name }}</h2>
      <p class="company-info text-caption">{{ company?.address }}</p>
      <p class="company-info text-caption">{{ company?.phone }}</p>
    </div>

    <!-- Title / Type -->
    <div class="receipt-title text-center mb-4 border-y py-2">
      <slot name="title">إيصال</slot>
    </div>

    <!-- Main Content -->
    <div class="content mb-4">
      <slot></slot>
    </div>

    <!-- Summary / Total -->
    <div class="summary border-t pt-4 mb-4">
      <slot name="summary"></slot>
    </div>

    <!-- Footer -->
    <div class="footer text-center mt-8 pt-4 border-t-dashed">
      <p class="text-caption">{{ company?.print_settings?.footer_text || 'شكراً لتعاملكم معنا' }}</p>
      <p class="text-tiny text-grey-darken-1">{{ new Date().toLocaleString('ar-EG') }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  company: Object,
});
</script>

<style scoped>
.thermal-receipt {
  width: 100%;
  font-size: 12px;
  line-height: 1.4;
}
.logo {
  max-width: 60mm;
  max-height: 30mm;
  filter: grayscale(1);
}
.border-y {
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
}
.border-t {
  border-top: 1px solid #000;
}
.border-t-dashed {
  border-top: 1px dashed #333;
}
.text-tiny {
  font-size: 8px;
}
</style>
