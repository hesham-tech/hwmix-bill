<template>
  <div class="a5-document" dir="rtl">
    <!-- Compact Header -->
    <div class="d-flex justify-space-between align-start mb-4 border-b pb-2">
      <div class="company-branding">
        <h2 class="text-h5 font-weight-bold mb-0">{{ company?.name }}</h2>
        <p class="text-caption text-grey-darken-1">{{ company?.field }}</p>
      </div>
      <div class="logo-container" v-if="company?.logo">
        <img :src="company.logo" class="a5-logo" />
      </div>
    </div>

    <!-- Content Slot -->
    <div class="main-content flex-grow-1 text-body-2">
      <slot></slot>
    </div>

    <!-- Footer -->
    <div class="footer-area mt-4 border-t pt-2">
      <p class="text-caption mb-1">{{ company?.print_settings?.footer_text || 'شكراً لتعاملكم معنا' }}</p>
      <div class="d-flex justify-space-between text-tiny text-grey">
        <span>{{ company?.phone }}</span>
        <span>{{ new Date().toLocaleString('ar-EG') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  company: Object,
});
</script>

<style scoped>
.a5-document {
  display: flex;
  flex-direction: column;
  min-height: 210mm;
  padding: 5mm;
}
.a5-logo {
  max-height: 50px;
}
.text-tiny {
  font-size: 10px;
}
.border-b {
  border-bottom: 2px solid #000;
}
.border-t {
  border-top: 1px solid #eee;
}
</style>
