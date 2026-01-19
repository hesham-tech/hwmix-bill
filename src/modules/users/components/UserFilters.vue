<template>
  <AppCard class="filter-card">
    <div class="pa-4 pb-0">
      <div class="d-flex align-center mb-4">
        <v-icon icon="ri-equalizer-line" color="primary" class="me-3" />
        <div class="text-h6 font-weight-bold">بحث متقدم</div>

        <v-chip v-if="hasActiveFilters" size="x-small" color="primary" class="ms-3 font-weight-bold"> مرشحات نشطة </v-chip>

        <v-spacer />

        <AppButton
          v-if="hasActiveFilters"
          variant="text"
          color="error"
          size="small"
          prepend-icon="ri-close-circle-line"
          @click.stop="resetAllFilters"
        >
          مسح الكل
        </AppButton>
      </div>

      <v-divider class="mb-6" />

      <v-row>
        <!-- الأدوار -->
        <v-col cols="6" sm="6" md="6">
          <v-select
            v-model="store.roleFilter"
            :items="roleOptions"
            label="الدور الوظيفي"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="ri-shield-user-line"
            clearable
            hide-details
            @update:model-value="emit('apply')"
          />
        </v-col>

        <!-- الحالة -->
        <v-col cols="6" sm="6" md="6">
          <v-select
            v-model="store.statusFilter"
            :items="statusOptions"
            label="الحالة"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="ri-checkbox-circle-line"
            clearable
            hide-details
            @update:model-value="emit('apply')"
          />
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap gap-2 mt-4 pb-4">
        <AppButton flex-grow-1 prepend-icon="ri-filter-line" @click="emit('apply')" class="flex-grow-1"> تطبيق الفلاتر </AppButton>
        <AppButton flex-grow-1 variant="outlined" color="secondary" prepend-icon="ri-refresh-line" @click="resetAllFilters" class="flex-grow-1">
          إعادة تعيين
        </AppButton>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../store/user.store';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';

const emit = defineEmits(['apply']);

const store = useUserStore();
const globalUserStore = useGlobalUserStore();
const { can } = usePermissions();

const isAdmin = computed(() => globalUserStore.isAdmin);

const roleOptions = [
  { title: 'مدير عام', value: 'admin.super' },
  { title: 'مدير شركة', value: 'admin.company' },
  { title: 'موظف', value: 'employee' },
];

const statusOptions = [
  { title: 'نشط', value: 'active' },
  { title: 'معطل', value: 'inactive' },
];

const hasActiveFilters = computed(() => {
  return store.roleFilter !== null || store.statusFilter !== null || store.isGlobalMode;
});

const resetAllFilters = () => {
  store.roleFilter = null;
  store.statusFilter = null;
  store.isGlobalMode = false;
  emit('apply');
};
</script>

<style scoped>
.filter-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

.gap-2 {
  gap: 8px;
}
</style>
