<template>
  <div class="user-cashbox-widget">
    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-safe-2-line" color="primary" size="20" />
      </v-avatar>
      الخزن والعهد المالية
    </h3>
    <CashBoxList :user-id="entityId" hide-header />
  </div>
</template>

<script setup>
// مكون فرعي لعرض وإدارة الخزن والعهد المالية الخاصة بالموظف الحالي
import { useEntityProfile } from '@core/entity-profile/profileContext';
import CashBoxList from '../pages/CashBoxList.vue';

const { entityId } = useEntityProfile();
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
