<template>
  <div class="user-invoices-widget">
    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-file-list-3-line" color="primary" size="20" />
      </v-avatar>
      الفواتير والتعاملات التجارية
    </h3>
    <InvoiceList :user-id="entityId" hide-header />
  </div>
</template>

<script setup>
// مكون فرعي لعرض كشف الفواتير التجارية الخاصة بالمستخدم الحالي
import { useEntityProfile } from '@core/entity-profile/profileContext';
import InvoiceList from '../pages/InvoiceList.vue';

const { entityId } = useEntityProfile();
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
