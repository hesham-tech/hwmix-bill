<template>
  <div v-if="isLoading" class="app-route-loading" role="status" aria-live="polite" aria-label="جاري تحميل الصفحة">
    <v-progress-linear indeterminate color="primary" height="4" />
    <div class="app-route-loading__message">جاري تحميل الصفحة...</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useRouteLoading } from '@/composables/useRouteLoading';

const { isLoading } = useRouteLoading(useRouter());
</script>

<style scoped>
.app-route-loading {
  position: fixed;
  inset: 0 0 auto;
  z-index: 10001;
  pointer-events: none;
}

.app-route-loading__message {
  width: fit-content;
  margin: 8px auto;
  padding: 8px 16px;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  background: #F0F9FF;
  color: #075985;
  box-shadow: 0 4px 16px rgb(0 134 205 / 12%);
}
</style>
