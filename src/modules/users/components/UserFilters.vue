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

      <v-row dense>
        <!-- الأدوار -->
        <v-col cols="6" class="mb-2">
          <v-select
            v-model="filters.role"
            :items="roleOptions"
            label="الدور"
            variant="outlined"
            density="compact"
            prepend-inner-icon="ri-shield-user-line"
            clearable
            hide-details
            @update:model-value="handleApply"
          />
        </v-col>

        <!-- الحالة -->
        <v-col cols="6" class="mb-2">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="الحالة"
            variant="outlined"
            density="compact"
            prepend-inner-icon="ri-checkbox-circle-line"
            clearable
            hide-details
            @update:model-value="handleApply"
          />
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap gap-2 mt-4 pb-4">
        <AppButton flex-grow-1 prepend-icon="ri-filter-line" @click="handleApply" class="flex-grow-1"> تطبيق الفلاتر </AppButton>
        <AppButton flex-grow-1 variant="outlined" color="secondary" prepend-icon="ri-refresh-line" @click="resetAllFilters" class="flex-grow-1">
          إعادة تعيين
        </AppButton>
      </div>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore as useGlobalUserStore } from '@/stores/user';
import { usePermissions } from '@/composables/usePermissions';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:modelValue', 'apply']);

const globalUserStore = useGlobalUserStore();
const { can } = usePermissions();

const filters = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

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
  return filters.value.role || filters.value.status;
});

const resetAllFilters = () => {
  filters.value = {
    ...filters.value,
    role: null,
    status: null,
  };
  emit('apply', filters.value);
};

const handleApply = () => {
  emit('apply', filters.value);
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
