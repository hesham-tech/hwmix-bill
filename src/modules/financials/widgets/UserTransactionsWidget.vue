<template>
  <div class="user-transactions-widget">
    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-exchange-funds-line" color="primary" size="20" />
      </v-avatar>
      المعاملات المالية للعهد
    </h3>
    <TransactionsList :user-id="entityId" hide-header />
  </div>
</template>

<script setup>
// مكون فرعي لعرض قائمة المعاملات المالية للعهدة الخاصة بالموظف الحالي
import { useEntityProfile } from '@core/entity-profile/profileContext';
import TransactionsList from '../pages/TransactionsList.vue';

const { entityId } = useEntityProfile();
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
