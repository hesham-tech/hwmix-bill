<template>
  <div class="user-activity-log-widget">
    <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-history-line" color="primary" size="20" />
      </v-avatar>
      سجل الأنشطة والعمليات
    </h3>
    <ActivityLogList :user-id="entityId" hide-header />
  </div>
</template>

<script setup>
// مكون فرعي لعرض سجل الأنشطة والعمليات المجرية بواسطة المستخدم الحالي
import { useEntityProfile } from '@core/entity-profile/profileContext';
import ActivityLogList from '../pages/ActivityLogList.vue';

const { entityId } = useEntityProfile();
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}
</style>
