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
        <v-col cols="6" class="mb-2">
          <AppAutocomplete
            v-model="filters.category_id"
            label="التصنيف"
            api-endpoint="categories"
            item-title="name"
            item-value="id"
            clearable
            density="comfortable"
          />
        </v-col>
        <v-col cols="6" class="mb-2">
          <AppAutocomplete
            v-model="filters.brand_id"
            label="العلامة"
            api-endpoint="brands"
            item-title="name"
            item-value="id"
            clearable
            density="comfortable"
          />
        </v-col>
        <v-col cols="6" class="d-flex align-center gap-1 mb-1">
          <AppSwitch v-model="filters.active" label="نشط" inset hide-details density="compact" />
          <v-icon icon="ri-checkbox-circle-line" :color="filters.active ? 'success' : 'grey'" size="16" />
        </v-col>
        <v-col cols="6" class="d-flex align-center gap-1 mb-1">
          <AppSwitch v-model="filters.featured" label="المميزة" inset hide-details density="compact" />
          <v-icon icon="ri-star-line" :color="filters.featured ? 'warning' : 'grey'" size="16" />
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
import { storeToRefs } from 'pinia';
import { useProductStore } from '../store/product.store';
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';

const emit = defineEmits(['apply']);

const productStore = useProductStore();
const { filters } = storeToRefs(productStore);

const hasActiveFilters = computed(() => {
  return Object.keys(filters.value).some(key => {
    if (key === 'search') return false;
    const value = filters.value[key];
    return value !== null && value !== '' && value !== undefined && value !== true;
  });
});

const resetAllFilters = () => {
  filters.value = {
    ...filters.value,
    category_id: null,
    brand_id: null,
    active: null,
    featured: null,
  };
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
