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
