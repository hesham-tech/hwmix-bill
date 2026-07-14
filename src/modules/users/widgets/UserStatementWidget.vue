<template>
  <div class="user-statement-widget">
    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-file-paper-2-line" color="primary" size="20" />
      </v-avatar>
      كشف حساب الطرف
    </h3>
    <StakeholderStatement :user-id="entityId" />
  </div>
</template>

<script setup>
// مكون فرعي لعرض كشف الحساب التفصيلي المالي الخاص بالمستخدم الحالي
import { useEntityProfile } from '@core/entity-profile/profileContext';
import StakeholderStatement from '../components/StakeholderStatement.vue';

const { entityId } = useEntityProfile();
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
