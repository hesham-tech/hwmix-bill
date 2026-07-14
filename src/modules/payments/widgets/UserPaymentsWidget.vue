<template>
  <div class="user-payments-widget">
    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-bank-card-2-line" color="primary" size="20" />
      </v-avatar>
      سجل المدفوعات والتحصيلات
    </h3>
    <PaymentList :user-id="entityId" hide-header />
  </div>
</template>

<script setup>
// مكون فرعي لعرض سجل المدفوعات والتحصيلات المالية الخاصة بالمستخدم الحالي
import { useEntityProfile } from '@core/entity-profile/profileContext';
import PaymentList from '../pages/PaymentList.vue';

const { entityId } = useEntityProfile();
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
