<template>
  <div class="user-notes-widget">
    <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-sticky-note-line" color="primary" size="20" />
      </v-avatar>
      ملاحظات إضافية
    </h3>
    <div class="bg-grey-lighten-5 pa-3 rounded-md border border-dashed text-body-1 text-grey-darken-1 min-height-100">
      {{ user?.notes || 'لا توجد ملاحظات إضافية مسجلة لهذا المستخدم.' }}
    </div>
  </div>
</template>

<script setup>
// مكون فرعي لعرض الملاحظات الإضافية المدونة على المستخدم الحالي
import { computed } from 'vue';
import { useEntityProfile } from '@core/entity-profile/profileContext';

const { entityData } = useEntityProfile();
const user = computed(() => entityData.value);
</script>

<style scoped>
.min-height-100 {
  min-height: 100px;
}
.gap-3 {
  gap: 12px;
}
</style>
