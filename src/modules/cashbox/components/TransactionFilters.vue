<template>
  <AppCard class="filter-card mb-2">
    <div class="pa-2 pb-0">
      <div class="d-flex align-center pa-2 mb-2">
        <v-icon icon="ri-equalizer-line" color="primary" size="small" class="me-2" />
        <div class="text-subtitle-1 font-weight-bold">بحث متقدم</div>

        <v-chip v-if="hasActiveFilters" size="x-small" color="primary" class="ms-2 font-weight-bold">نشط</v-chip>

        <v-spacer />

        <AppButton v-if="hasActiveFilters" icon="ri-close-line" size="x-small" variant="text" color="error" @click.stop="resetAllFilters" />
      </div>

      <v-divider class="mb-3" />

      <v-row dense>
        <!-- النوع -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.type"
            :items="typeOptions"
            label="نوع العملية"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="ri-exchange-line"
            clearable
            hide-details
            @update:model-value="emit('apply')"
          />
        </v-col>

        <!-- الخزينة -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.cash_box_id"
            :items="cashBoxes"
            item-title="name"
            item-value="id"
            label="الخزينة"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="ri-safe-2-line"
            clearable
            hide-details
            @update:model-value="emit('apply')"
          />
        </v-col>

        <!-- من تاريخ -->
        <v-col cols="6" sm="6" md="3">
          <AppInput
            v-model="filters.date_from"
            type="date"
            label="من تاريخ"
            prepend-inner-icon="ri-calendar-line"
            @update:model-value="emit('apply')"
          />
        </v-col>

        <!-- إلى تاريخ -->
        <v-col cols="6" sm="6" md="3">
          <AppInput
            v-model="filters.date_to"
            type="date"
            label="إلى تاريخ"
            prepend-inner-icon="ri-calendar-line"
            @update:model-value="emit('apply')"
          />
        </v-col>
      </v-row>

      <v-row dense class="mt-2 pb-2">
        <v-col cols="6">
          <AppButton block prepend-icon="ri-filter-line" size="small" @click="emit('apply')">تطبيق</AppButton>
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
  cashBoxes: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'apply']);

const filters = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const typeOptions = [
  { title: 'إيداع نقدية', value: 'income' },
  { title: 'سحب نقدية', value: 'expense' },
];

const hasActiveFilters = computed(() => {
  return filters.value.type || filters.value.cash_box_id || filters.value.date_from || filters.value.date_to;
});

const resetAllFilters = () => {
  filters.value = {
    type: null,
    cash_box_id: null,
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
