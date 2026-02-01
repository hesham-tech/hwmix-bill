<template>
  <div class="a4-document" dir="rtl">
    <!-- Header Area -->
    <div class="d-flex justify-space-between align-center mb-8 border-b pb-4">
      <div class="company-branding">
        <h1 class="text-h4 font-weight-black primary-text mb-1">{{ company?.name }}</h1>
        <p class="text-h6 text-grey-darken-2">{{ company?.field }}</p>
      </div>
      <div class="logo-container" v-if="company?.logo">
        <img :src="company.logo" class="a4-logo" />
      </div>
    </div>

    <!-- Info Grid -->
    <v-row class="mb-8">
      <v-col cols="6">
        <div class="info-box bg-grey-lighten-4 pa-4 rounded">
          <slot name="header-left"></slot>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="info-box pa-4">
          <p class="mb-1"><strong>العنوان:</strong> {{ company?.address }}</p>
          <p class="mb-1"><strong>الهاتف:</strong> {{ company?.phone }}</p>
          <p class="mb-1"><strong>البريد:</strong> {{ company?.email }}</p>
          <p class="mb-1" v-if="company?.tax_number"><strong>الرقم الضريبي:</strong> {{ company?.tax_number }}</p>
        </div>
      </v-col>
    </v-row>

    <!-- Main Table / Content -->
    <div class="main-content flex-grow-1">
      <slot></slot>
    </div>

    <!-- Footer Area -->
    <div class="footer-area mt-auto pt-8">
      <div class="d-flex justify-space-between border-t pt-4">
        <div class="footer-note">
          <p class="text-subtitle-1">{{ company?.print_settings?.footer_text || 'شكراً لتعاملكم معنا' }}</p>
        </div>
        <div class="page-timestamp text-caption text-grey">طُبع في: {{ new Date().toLocaleString('ar-EG') }}</div>
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
.a4-document {
  display: flex;
  flex-direction: column;
  min-height: 297mm;
  color: #1a1a1a;
}
.a4-logo {
  max-height: 80px;
  object-fit: contain;
}
.border-b {
  border-bottom: 2px solid #333;
}
.border-t {
  border-top: 1px solid #ccc;
}
.primary-text {
  color: #2c3e50;
}
</style>
