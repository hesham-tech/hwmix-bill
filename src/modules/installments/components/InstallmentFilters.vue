<template>
  <AppCard class="filter-card">
    <div class="pa-2 pb-0">
      <div class="d-flex align-center mb-2">
        <v-icon icon="ri-equalizer-line" color="primary" class="me-2" size="small" />
        <div class="text-subtitle-1 font-weight-bold">بحث متقدم</div>

        <v-chip v-if="hasActiveFilters" size="x-small" color="primary" class="ms-2">نشط</v-chip>

        <v-spacer />

        <AppButton v-if="hasActiveFilters" icon="ri-close-circle-line" variant="text" color="error" size="small" @click.stop="resetAllFilters" />
      </div>

      <v-divider class="mb-3" />

      <v-row dense>
        <!-- حقول التاريخ في صف واحد -->
        <v-col cols="6">
          <AppInput
            v-model="filters.date_from"
            type="date"
            label="من تاريخ"
            density="compact"
            prepend-inner-icon="ri-calendar-line"
            @update:model-value="emit('apply')"
          />
        </v-col>

        <v-col cols="6">
          <AppInput
            v-model="filters.date_to"
            type="date"
            label="إلى تاريخ"
            density="compact"
            prepend-inner-icon="ri-calendar-line"
            @update:model-value="emit('apply')"
          />
        </v-col>

        <!-- الحالة في صف منفصل -->
        <v-col cols="12">
          <v-select
            v-model="filters.status"
            :items="statusOptions"
            label="حالة القسط"
            variant="outlined"
            density="compact"
            prepend-inner-icon="ri-checkbox-circle-line"
            clearable
            hide-details
            @update:model-value="emit('apply')"
          />
        </v-col>
      </v-row>

      <v-row dense class="mt-2 pb-2">
        <v-col cols="6">
          <AppButton block prepend-icon="ri-filter-line" size="small" color="primary" @click="emit('apply')">تطبيق</AppButton>
        </v-col>
        <v-col cols="6">
          <AppButton block prepend-icon="ri-refresh-line" size="small" variant="outlined" color="secondary" @click="resetAllFilters">
            إعادة
          </AppButton>
        </v-col>
      </v-row>
    </div>
  </AppCard>
</template>

<script setup>
import { computed } from 'vue';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'apply']);

const filters = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const statusOptions = [
  { title: 'في الانتظار', value: 'pending' },
  { title: 'مدفوع', value: 'paid' },
  { title: 'متأخر', value: 'overdue' },
  { title: 'ملغي', value: 'cancelled' },
];

const hasActiveFilters = computed(() => {
  return filters.value.status || filters.value.date_from || filters.value.date_to;
});

const resetAllFilters = () => {
  filters.value = {
    status: null,
    date_from: null,
    date_to: null,
  };
  emit('apply');
};
</script>

<style scoped>
.filter-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}
</style>
