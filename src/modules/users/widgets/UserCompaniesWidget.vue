<template>
  <div class="user-companies-widget mb-6">
    <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center gap-3">
      <v-avatar color="primary-lighten-5" rounded="md" size="32">
        <v-icon icon="ri-building-line" color="primary" size="20" />
      </v-avatar>
      الشركات المرتبطة
    </h3>
    
    <v-row>
      <v-col v-for="company in user?.companies" :key="company.id" cols="12" sm="6" lg="4">
        <v-card variant="outlined" class="rounded-md border-grey-lighten-3 pa-1 hover-card">
          <v-list-item :prepend-avatar="company.logo || '/default-company.png'">
            <v-list-item-title class="font-weight-bold text-body-1">{{ company.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption mt-1">
              <v-chip size="x-small" label color="success" class="font-weight-bold">نشط</v-chip>
            </v-list-item-subtitle>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col v-if="!user?.companies?.length" cols="12">
        <div class="text-center py-8 bg-grey-lighten-5 rounded-md border-dashed">
          <v-icon icon="ri-building-2-line" color="grey-lighten-2" size="48" class="mb-2" />
          <p class="text-grey text-body-2">لا توجد شركات مرتبطة حالياً</p>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
// مكون فرعي لعرض الشركات المرتبطة بالمستخدم الحالي مع التحديث التلقائي
import { computed } from 'vue';
import { useEntityProfile } from '@core/entity-profile/profileContext';

const { entityData } = useEntityProfile();
const user = computed(() => entityData.value);
</script>

<style scoped>
.hover-card {
  transition: all 0.2s ease;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: rgb(var(--v-theme-primary), 0.3) !important;
}
.gap-3 {
  gap: 12px;
}
</style>
